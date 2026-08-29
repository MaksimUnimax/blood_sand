"""Frozen M2 Recommendation HTTP API."""

from __future__ import annotations

import json
import logging
import time
from contextlib import asynccontextmanager
from collections.abc import Callable
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import Response
from pydantic import BaseModel, ConfigDict

from recommendations.application import ApplicationRecommendationInput, RecommendationApplicationService
from recommendations.core import RecommendationCoreError, RecommendationInputError
from recommendations.core.configuration import ConfigurationValidationError

from .errors import APIError, ContractJSONResponse, error_response, project_error
from .models import ResolveRequest
from .serialization import serialize_success

MAX_BODY_BYTES = 16384
logger = logging.getLogger("recommendations.api")


def _configuration_unavailable(request: Request) -> ContractJSONResponse:
    return error_response(request, 503, "CONFIGURATION_UNAVAILABLE", "Recommendation configuration is unavailable.")


async def _bounded_body(request: Request) -> bytes:
    chunks: list[bytes] = []
    received = 0
    async for chunk in request.stream():
        received += len(chunk)
        if received > MAX_BODY_BYTES:
            raise APIError(413, "PAYLOAD_TOO_LARGE", "Request body exceeds 16384 bytes.")
        chunks.append(chunk)
    return b"".join(chunks)


def _is_json_content_type(request: Request) -> bool:
    content_type = request.headers.get("content-type")
    return content_type is not None and content_type.split(";", 1)[0].strip().lower() == "application/json"


def create_app(
    service: RecommendationApplicationService | None = None,
    service_factory: Callable[[], RecommendationApplicationService] = RecommendationApplicationService,
    vk_config=None,
    miniapp_config=None,
    vk_runtime_factory=None,
) -> FastAPI:
    """Create an independently testable M2 app, optionally with an injected service."""
    @asynccontextmanager
    async def lifespan(application: FastAPI):
        controller = None
        if application.state.vk_config is not None:
            from recommendations.vk.runtime import VKRuntimeController
            controller = (vk_runtime_factory or VKRuntimeController)(application.state.vk_config)
            await controller.start()
            application.state.vk_runtime = {"config": application.state.vk_config, "storage": controller.storage, "controller": controller}
        try:
            yield
        finally:
            if controller is not None:
                await controller.stop()
                application.state.vk_runtime = None
    app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
    app.state.service = service
    app.state.configuration_unavailable = False
    if service is None:
        try:
            app.state.service = service_factory()
        except ConfigurationValidationError:
            app.state.configuration_unavailable = True
    # M3 is opt-in: ordinary M2 use neither reads VK secrets nor opens its DB.
    if vk_config is None:
        from recommendations.vk.config import VKRuntimeConfig
        vk_config = VKRuntimeConfig.from_environment()
    app.state.vk_config = vk_config
    if miniapp_config is None:
        from recommendations.vk.config import VKMiniAppConfig
        miniapp_config = VKMiniAppConfig.from_environment()
    app.state.miniapp_config = miniapp_config
    app.state.vk_runtime = None
    if vk_config is not None:
        # State and workers are deliberately opened only inside lifespan.
        app.state.vk_runtime = {"config": vk_config}

    @app.middleware("http")
    async def request_metadata(request: Request, call_next: Callable) -> Response:
        request.state.request_id = str(uuid4())
        started = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            # The registered exception handlers normally convert errors; retain the
            # envelope if middleware sees an exception before they can do so.
            response = error_response(request, 500, "INTERNAL_ERROR", "Internal server error.")
        response.headers["X-Request-Id"] = request.state.request_id
        fields = {
            "event": "http_request_completed", "request_id": request.state.request_id,
            "method": request.method, "path": request.url.path, "status": response.status_code,
            "duration_ms": round((time.perf_counter() - started) * 1000, 3),
        }
        if hasattr(request.state, "result_id"):
            fields["result_id"] = request.state.result_id
        if hasattr(request.state, "error_code"):
            fields["error_code"] = request.state.error_code
        try:
            logger.info(json.dumps(fields, ensure_ascii=False, separators=(",", ":")))
        except Exception:
            pass
        return response

    @app.exception_handler(APIError)
    async def api_error_handler(request: Request, exc: APIError) -> Response:
        return project_error(request, exc)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError) -> Response:
        return error_response(request, 422, "INVALID_REQUEST", "Request body is invalid.")

    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(request: Request, exc: StarletteHTTPException) -> Response:
        if exc.status_code == 404:
            return error_response(request, 404, "NOT_FOUND", "Route not found.")
        if exc.status_code == 405:
            headers = {"Allow": exc.headers["Allow"]} if exc.headers and "Allow" in exc.headers else None
            return error_response(request, 405, "METHOD_NOT_ALLOWED", "Method not allowed.", headers)
        return error_response(request, 500, "INTERNAL_ERROR", "Internal server error.")

    @app.exception_handler(Exception)
    async def unexpected_error_handler(request: Request, exc: Exception) -> Response:
        return error_response(request, 500, "INTERNAL_ERROR", "Internal server error.")

    @app.get("/healthz")
    async def healthz() -> Response:
        return ContractJSONResponse({"api_version": "v1", "status": "ok"})

    @app.get("/readyz")
    async def readyz(request: Request) -> Response:
        if request.app.state.configuration_unavailable or request.app.state.service is None:
            return _configuration_unavailable(request)
        return ContractJSONResponse({"api_version": "v1", "status": "ready"})

    @app.post("/v1/recommendations/resolve")
    async def resolve(request: Request) -> Response:
        if not _is_json_content_type(request):
            raise APIError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.")
        raw_body = await _bounded_body(request)
        try:
            parsed = json.loads(raw_body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise APIError(400, "MALFORMED_JSON", "Request body must be valid JSON.")
        try:
            model = ResolveRequest.model_validate(parsed)
        except ValidationError:
            raise APIError(422, "INVALID_REQUEST", "Request body is invalid.")
        if request.app.state.configuration_unavailable or request.app.state.service is None:
            return _configuration_unavailable(request)
        try:
            result = request.app.state.service.resolve(ApplicationRecommendationInput(**model.model_dump()))
        except ConfigurationValidationError:
            return _configuration_unavailable(request)
        except RecommendationInputError:
            raise APIError(422, "INVALID_REQUEST", "Request body is invalid.")
        except RecommendationCoreError:
            raise APIError(500, "CORE_ERROR", "Recommendation core failed.")
        request.state.result_id = result.result_id
        return ContractJSONResponse(
            serialize_success(model, result.semantic_result), headers={"X-Result-Id": result.result_id}
        )

    if app.state.vk_runtime is not None:
        from recommendations.vk.callback import callback
        # Application decision: mount behind HTTPS only during later deployment.
        app.add_api_route("/internal/vk/callback", callback, methods=["POST"], include_in_schema=False)

    class Bootstrap(BaseModel):
        model_config=ConfigDict(extra='forbid',strict=True)
        launch_params: str
        handoff_token: str
    class BirthDate(BaseModel):
        model_config=ConfigDict(extra='forbid',strict=True)
        birth_date: str

    def mini_storage(request):
        runtime=request.app.state.vk_runtime
        if not runtime or not request.app.state.miniapp_config.enabled: raise APIError(503,'MINIAPP_DISABLED','Mini App is disabled.')
        return runtime['storage']

    @app.post('/vk-miniapp-api/v1/bootstrap')
    async def mini_bootstrap(request: Request) -> Response:
        model=Bootstrap.model_validate(json.loads((await _bounded_body(request)).decode('utf-8')))
        config=request.app.state.miniapp_config; storage=mini_storage(request)
        from recommendations.vk.miniapp import verify_launch, MiniAppError
        try:
            launch=verify_launch(model.launch_params,config.protected_key,config.app_id)
            token=storage.bootstrap_miniapp(model.handoff_token,int(launch['vk_user_id']),config.app_id,config.session_ttl_seconds)
        except (ValueError,MiniAppError,KeyError): raise APIError(403,'MINIAPP_AUTH_REJECTED','Mini App launch is not accepted.')
        return ContractJSONResponse({'session_token':token,'expires_in':config.session_ttl_seconds,'purpose':'birth_date'})

    @app.post('/vk-miniapp-api/v1/birth-date')
    async def mini_birth_date(request: Request) -> Response:
        auth=request.headers.get('authorization','');
        if not auth.startswith('Bearer ') or not auth[7:]: raise APIError(401,'MINIAPP_AUTH_REJECTED','Mini App session is not accepted.')
        model=BirthDate.model_validate(json.loads((await _bounded_body(request)).decode('utf-8')))
        storage=mini_storage(request)
        from recommendations.vk.presenter import GENDER_PROMPT
        from recommendations.vk.keyboard import gender_keyboard
        try: storage.submit_miniapp_birth_date(auth[7:],model.birth_date,GENDER_PROMPT,gender_keyboard())
        except ValueError as exc: raise APIError(409,'MINIAPP_DATE_REJECTED','Birth date cannot be accepted.') from exc
        return ContractJSONResponse({'status':'ok'})

    return app


app = create_app()
