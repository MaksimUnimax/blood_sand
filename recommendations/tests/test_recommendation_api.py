import asyncio
import json
import logging
import unittest
from uuid import UUID

import httpx

from recommendations.api.app import create_app
from recommendations.application import RecommendationApplicationService
from recommendations.core import RecommendationCore, RecommendationCoreError
from recommendations.core.configuration import ConfigurationValidationError


# Independent date/chertog oracle, deliberately not read from production data.
CASES = {
    "deva": ((27, 8), {"male": "svarog", "female": "zhiva"}),
    "vepr": ((20, 9), {"male": "alatyr", "female": "alatyr"}),
    "shchuka": ((11, 10), {"male": "rodimich", "female": "zvezda_lady"}),
    "lebed": ((3, 11), {"male": "rodimich", "female": "makosh"}),
    "zmei": ((24, 11), {"male": "semargl", "female": "semargl"}),
    "voron": ((20, 12), {"male": "kolyadnik", "female": "alatyr"}),
    "medved": ((16, 1), {"male": "bear_paw", "female": "bear_paw"}),
    "busel": ((1, 2), {"male": "rodimich", "female": "zvezda_lady"}),
    "volk": ((15, 3), {"male": "veles", "female": "veles"}),
    "lisa": ((25, 3), {"male": "chernobog", "female": "mara"}),
    "tur": ((20, 4), {"male": "chur", "female": "chur"}),
    "los": ((10, 5), {"male": "rodimich", "female": "zvezda_lady"}),
    "finist": ((10, 6), {"male": "alatyr", "female": "alatyr"}),
    "kon": ((1, 7), {"male": "svarog", "female": "zhiva"}),
    "orel": ((19, 7), {"male": "perun", "female": "zvezda_lady"}),
    "rasa": ((13, 8), {"male": "dazhdbog", "female": "dazhdbog"}),
}
SEMANTIC_KEYS = ("calendar_version", "product_policy_version", "matrix_version", "marketplace_override_version", "copy_version", "birth_date", "chertog", "gender", "marketplace", "recommendation")
ERRORS = {
    "MALFORMED_JSON": (400, "Request body must be valid JSON."),
    "PAYLOAD_TOO_LARGE": (413, "Request body exceeds 16384 bytes."),
    "UNSUPPORTED_MEDIA_TYPE": (415, "Content-Type must be application/json."),
    "INVALID_REQUEST": (422, "Request body is invalid."),
    "CONFIGURATION_UNAVAILABLE": (503, "Recommendation configuration is unavailable."),
    "CORE_ERROR": (500, "Recommendation core failed."),
    "INTERNAL_ERROR": (500, "Internal server error."),
    "NOT_FOUND": (404, "Route not found."),
    "METHOD_NOT_ALLOWED": (405, "Method not allowed."),
}


class _CoreErrorService:
    def resolve(self, request):
        raise RecommendationCoreError("private injected text")


class _UnexpectedService:
    def resolve(self, request):
        raise RuntimeError("private injected text")


class RecommendationAPITests(unittest.TestCase):
    def request(self, app, method, path, **kwargs):
        async def run():
            transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
            async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
                return await client.request(method, path, **kwargs)
        return asyncio.run(run())

    def resolve(self, app, body, content_type="application/json"):
        headers = {} if content_type is None else {"content-type": content_type}
        return self.request(app, "POST", "/v1/recommendations/resolve", content=body, headers=headers)

    def assert_uuid4(self, value):
        self.assertEqual(UUID(value).version, 4)

    def assert_error(self, response, code):
        status, message = ERRORS[code]
        self.assertEqual(response.status_code, status)
        self.assertEqual(response.json(), {"api_version": "v1", "error": {"code": code, "message": message}})
        self.assertEqual(response.headers["content-type"], "application/json; charset=utf-8")
        self.assert_uuid4(response.headers["x-request-id"])
        self.assertNotIn("x-result-id", response.headers)
        self.assertNotIn("detail", response.text)
        self.assertNotIn("private injected text", response.text)

    def test_full_32_case_api_core_semantic_parity_for_each_marketplace(self):
        app, core = create_app(), RecommendationCore()
        differences = 0
        for marketplace in (None, "ozon", "wildberries"):
            for chertog, ((day, month), products) in CASES.items():
                for gender, product in products.items():
                    payload = {"birth_day": day, "birth_month": month, "gender": gender}
                    if marketplace is not None:
                        payload["marketplace"] = marketplace
                    response = self.resolve(app, json.dumps(payload).encode())
                    self.assertEqual(response.status_code, 200)
                    body = response.json()
                    expected = core.resolve_recommendation(day, month, gender, marketplace)
                    actual = {**body["versions"], **{key: body[key] for key in SEMANTIC_KEYS if key not in {"calendar_version", "product_policy_version", "matrix_version", "marketplace_override_version", "copy_version"}}}
                    self.assertEqual(actual, expected)
                    expected_product = "alatyr" if marketplace == "wildberries" and chertog == "voron" and gender == "male" else product
                    self.assertEqual(body["recommendation"]["product_key"], expected_product)
                    differences += marketplace == "wildberries" and expected_product != product
                    self.assertEqual(set(body), {"api_version", "input", "versions", "birth_date", "chertog", "gender", "marketplace", "recommendation"})
                    self.assert_uuid4(response.headers["x-request-id"])
                    self.assert_uuid4(response.headers["x-result-id"])
        self.assertEqual(differences, 1)

    def test_strict_types_dates_and_content_types(self):
        app = create_app()
        invalid = [
            {"birth_day": True, "birth_month": 1, "gender": "male"},
            {"birth_day": 1, "birth_month": True, "gender": "male"},
            {"birth_day": 1, "birth_month": 1, "birth_year": True, "gender": "male"},
            {"birth_day": "16", "birth_month": 1, "gender": "male"},
            {"birth_day": 16, "birth_month": "1", "gender": "male"},
            {"birth_day": 16, "birth_month": 1, "birth_year": "1986", "gender": "male"},
            {"birth_day": 16, "birth_month": 1, "birth_year": None, "gender": "male"},
        ]
        invalid = invalid[:7] + [{"birth_day": 1, "birth_month": 1, "gender": value} for value in ("any", "мужчина", "male ", 1)]
        invalid += [{"birth_day": 1, "birth_month": 1, "gender": "male", "marketplace": value} for value in ("OZON", "vk", 1)]
        invalid += [
            {"birth_day": 31, "birth_month": 4, "gender": "male"},
            {"birth_day": 29, "birth_month": 2, "birth_year": 1987, "gender": "male"},
            {"birth_day": 0, "birth_month": 1, "gender": "male"},
            {"birth_day": 1, "birth_month": 0, "gender": "male"},
            {"birth_day": 1, "birth_month": 13, "gender": "male"},
        ]
        for payload in invalid:
            self.assert_error(self.resolve(app, json.dumps(payload).encode()), "INVALID_REQUEST")
        self.assertEqual(self.resolve(app, b'{"birth_day":29,"birth_month":2,"birth_year":1988,"gender":"male"}').status_code, 200)
        for content_type in ("application/json", "application/json; charset=utf-8", "APPLICATION/JSON"):
            self.assertEqual(self.resolve(app, b'{"birth_day":16,"birth_month":1,"gender":"male"}', content_type).status_code, 200)
        for content_type in (None, "text/plain", "application/problem+json"):
            self.assert_error(self.resolve(app, b'{}', content_type), "UNSUPPORTED_MEDIA_TYPE")

    def test_unknown_fields_are_rejected_with_project_error_envelope(self):
        app = create_app()
        for payload in (
            {"birth_day": 16, "birth_month": 1, "gender": "male", "channel": "vk"},
            {"birth_day": 16, "birth_month": 1, "gender": "male", "availability": "AVAILABLE"},
        ):
            self.assert_error(self.resolve(app, json.dumps(payload).encode()), "INVALID_REQUEST")

    def test_exact_body_boundaries_and_optional_fields(self):
        app = create_app()
        valid = b'{"birth_day":16,"birth_month":1,"gender":"male"}'
        at_limit = valid + b" " * (16384 - len(valid))
        over_limit = at_limit + b" "
        self.assertEqual(len(at_limit), 16384)
        self.assertEqual(len(over_limit), 16385)
        self.assertEqual(self.resolve(app, at_limit).status_code, 200)
        self.assert_error(self.resolve(app, over_limit), "PAYLOAD_TOO_LARGE")
        omitted = self.resolve(app, valid).json()
        year_only = self.resolve(app, b'{"birth_day":16,"birth_month":1,"birth_year":1986,"gender":"male"}').json()
        null_marketplace = self.resolve(app, b'{"birth_day":16,"birth_month":1,"gender":"male","marketplace":null}').json()
        ozon_marketplace = self.resolve(app, b'{"birth_day":16,"birth_month":1,"gender":"male","marketplace":"ozon"}').json()
        self.assertNotIn("birth_year", omitted["input"])
        self.assertNotIn("marketplace", omitted["input"])
        self.assertIsNone(omitted["birth_date"]["year"])
        self.assertIsNone(omitted["marketplace"])
        self.assertEqual(year_only["input"]["birth_year"], 1986)
        self.assertNotIn("marketplace", year_only["input"])
        self.assertEqual(year_only["birth_date"]["year"], 1986)
        self.assertEqual(year_only["birth_date"]["display"], "16.01.1986")
        self.assertIsNone(year_only["marketplace"])
        self.assertNotIn("birth_year", null_marketplace["input"])
        self.assertIn("marketplace", null_marketplace["input"])
        self.assertIsNone(null_marketplace["input"]["marketplace"])
        self.assertIsNone(null_marketplace["marketplace"])
        self.assertEqual(ozon_marketplace["input"]["marketplace"], "ozon")
        self.assertEqual(ozon_marketplace["marketplace"], "ozon")

    def test_exact_error_envelopes_routing_readiness_and_ids(self):
        app = create_app()
        for raw in (b"", b"{", b"\xff"):
            self.assert_error(self.resolve(app, raw), "MALFORMED_JSON")
        self.assert_error(self.resolve(app, b"[]"), "INVALID_REQUEST")
        self.assert_error(self.request(app, "GET", "/v1/recommendations/resolve"), "METHOD_NOT_ALLOWED")
        self.assertIn("POST", self.request(app, "GET", "/v1/recommendations/resolve").headers["allow"])
        for method, path in (("POST", "/healthz"), ("POST", "/readyz")):
            self.assert_error(self.request(app, method, path), "METHOD_NOT_ALLOWED")
        for path in ("/unknown", "/docs", "/redoc", "/openapi.json"):
            self.assert_error(self.request(app, "GET", path), "NOT_FOUND")
        health, ready = self.request(app, "GET", "/healthz"), self.request(app, "GET", "/readyz")
        self.assertEqual(health.json(), {"api_version": "v1", "status": "ok"})
        self.assertEqual(ready.json(), {"api_version": "v1", "status": "ready"})
        for response in (health, ready):
            self.assertEqual(response.headers["content-type"], "application/json; charset=utf-8")
            self.assert_uuid4(response.headers["x-request-id"])
            self.assertNotIn("x-result-id", response.headers)
        unavailable = create_app(service_factory=lambda: (_ for _ in ()).throw(ConfigurationValidationError("private injected text")))
        self.assertEqual(self.request(unavailable, "GET", "/healthz").status_code, 200)
        self.assert_error(self.request(unavailable, "GET", "/readyz"), "CONFIGURATION_UNAVAILABLE")
        self.assert_error(self.resolve(unavailable, b'{"birth_day":1,"birth_month":1,"gender":"male"}'), "CONFIGURATION_UNAVAILABLE")
        self.assert_error(self.resolve(create_app(service=_CoreErrorService()), b'{"birth_day":1,"birth_month":1,"gender":"male"}'), "CORE_ERROR")
        self.assert_error(self.resolve(create_app(service=_UnexpectedService()), b'{"birth_day":1,"birth_month":1,"gender":"male"}'), "INTERNAL_ERROR")

    def test_request_ids_are_uuid4_unique_across_response_classes(self):
        app = create_app()
        health = [self.request(app, "GET", "/healthz") for _ in range(2)]
        success = [self.resolve(app, b'{"birth_day":16,"birth_month":1,"gender":"male"}') for _ in range(2)]
        malformed = self.resolve(app, b"{")
        invalid = self.resolve(app, b'{"birth_day":16,"birth_month":1,"gender":"male","channel":"vk"}')
        for response in health + success:
            self.assertEqual(response.status_code, 200)
        self.assert_error(malformed, "MALFORMED_JSON")
        self.assert_error(invalid, "INVALID_REQUEST")
        responses = health + success + [malformed, invalid]
        request_ids = [response.headers["x-request-id"] for response in responses]
        for request_id in request_ids:
            self.assert_uuid4(request_id)
        self.assertEqual(len(request_ids), len(set(request_ids)))
        for response in health + [malformed, invalid]:
            self.assertNotIn("x-result-id", response.headers)
        for response in success:
            self.assert_uuid4(response.headers["x-result-id"])

    def test_medved_and_voron_exact_contracts_and_unique_ids(self):
        app = create_app()
        medved = self.resolve(app, b'{"birth_day":16,"birth_month":1,"birth_year":1986,"gender":"male","marketplace":"ozon"}')
        self.assertEqual(medved.status_code, 200)
        self.assertIn("Печать Велеса", medved.text)
        self.assertNotIn("\\u041f", medved.text)
        self.assertEqual(medved.headers["content-type"], "application/json; charset=utf-8")
        body = medved.json()
        self.assertEqual(set(body), {"api_version", "input", "versions", "birth_date", "chertog", "gender", "marketplace", "recommendation"})
        self.assertEqual(body["versions"], {
            "calendar_version": "KIP_CHERTOG_CALENDAR_V1",
            "product_policy_version": "KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED",
            "matrix_version": "KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED",
            "marketplace_override_version": "KIP_MARKETPLACE_OVERRIDE_V1",
            "copy_version": "KIP_REASON_COPY_V2_SALES_WEIGHTED",
        })
        self.assertEqual(body["recommendation"]["product_key"], "bear_paw")
        self.assertEqual(body["recommendation"]["sku"], "1636048691")
        self.assertEqual(body["recommendation"]["recommendation_identity"], "Печать Велеса")
        self.assertEqual(body["recommendation"]["customer_label"], "Печать Велеса")
        self.assertEqual(body["recommendation"]["relation_type"], "DIRECT_CHERTOG_SYMBOL")
        self.assertEqual(body["recommendation"]["selection_basis"], "SEMANTIC_DIRECT_SALES_PRIORITIZED")
        self.assertEqual(body["recommendation"]["reason_code"], "MEDVED_MALE")
        self.assertEqual(body["birth_date"], {"day": 16, "month": 1, "year": 1986, "display": "16.01.1986"})
        self.assertEqual(body["chertog"], {"id": "medved", "name": "Медведь", "patron_name": "Сварог"})
        self.assertEqual(body["gender"], "male")
        self.assertEqual(body["marketplace"], "ozon")
        for marketplace, product, reason, relation, basis in ((None, "kolyadnik", "VORON_MALE_KOLYADNIK", "DIRECT_DERIVED", "SEMANTIC_DIRECT"), ("ozon", "kolyadnik", "VORON_MALE_KOLYADNIK", "DIRECT_DERIVED", "SEMANTIC_DIRECT"), ("wildberries", "alatyr", "VORON_CHANGE_INNER_SUPPORT", "CURATED_MEANING_SUBSTITUTE", "MARKETPLACE_OVERRIDE_SALES_WEIGHTED")):
            payload = {"birth_day": 20, "birth_month": 12, "gender": "male"}
            if marketplace: payload["marketplace"] = marketplace
            response = self.resolve(app, json.dumps(payload).encode()).json()["recommendation"]
            self.assertEqual((response["product_key"], response["reason_code"], response["relation_type"], response["selection_basis"]), (product, reason, relation, basis))
        for marketplace in (None, "ozon", "wildberries"):
            payload = {"birth_day": 20, "birth_month": 12, "gender": "female"}
            if marketplace: payload["marketplace"] = marketplace
            self.assertEqual(self.resolve(app, json.dumps(payload).encode()).json()["recommendation"]["product_key"], "alatyr")
        first, second = self.resolve(app, b'{"birth_day":16,"birth_month":1,"gender":"male"}'), self.resolve(app, b'{"birth_day":16,"birth_month":1,"gender":"male"}')
        self.assertEqual(first.json(), second.json())
        self.assertNotEqual(first.headers["x-result-id"], second.headers["x-result-id"])
        request_ids = [medved.headers["x-request-id"], first.headers["x-request-id"], second.headers["x-request-id"]]
        self.assertEqual(len(request_ids), len(set(request_ids)))

    def test_structured_logs_are_complete_and_redacted(self):
        app = create_app(service=_UnexpectedService())
        with self.assertLogs("recommendations.api", level="INFO") as captured:
            success = self.resolve(create_app(), b'{"birth_day":16,"birth_month":1,"birth_year":1986,"gender":"male"}')
            invalid = self.resolve(create_app(), b"{")
            failure = self.resolve(app, b'{"birth_day":1,"birth_month":1,"gender":"male"}')
        records = [json.loads(record.split(":", 2)[-1]) for record in captured.output]
        for record in records:
            self.assertTrue({"event", "request_id", "method", "path", "status", "duration_ms"} <= set(record))
        self.assertEqual(records[0]["result_id"], success.headers["x-result-id"])
        self.assertEqual(records[0]["request_id"], success.headers["x-request-id"])
        self.assertEqual(records[1]["error_code"], "MALFORMED_JSON")
        self.assertEqual(records[2]["error_code"], "INTERNAL_ERROR")
        rendered = "\n".join(captured.output)
        for forbidden in ("birth_year", "1986", "16.01.1986", "private injected text"):
            self.assertNotIn(forbidden, rendered)
