import asyncio
import json
import logging
import unittest
from uuid import UUID

import httpx

from recommendations.api.app import create_app
from recommendations.application import RecommendationApplicationService
from recommendations.core import RecommendationCoreError
from recommendations.core.configuration import ConfigurationValidationError


# Explicit oracle: this must not be derived from production configuration data.
CASES = {
    "deva": ((27, 8), {"male": "svarog", "female": "zhiva"}),
    "vepr": ((20, 9), {"male": "alatyr", "female": "alatyr"}),
    "shchuka": ((11, 10), {"male": "rodimich", "female": "zvezda_lady"}),
    "lebed": ((3, 11), {"male": "rodimich", "female": "makosh"}),
    "zmei": ((24, 11), {"male": "semargl", "female": "semargl"}),
    "voron": ((20, 12), {"male": "kolyadnik", "female": "alatyr"}),
    "medved": ((16, 1), {"male": "bear_paw", "female": "bear_paw"}),
    "busel": ((1, 2), {"male": "molvinets", "female": "zvezda_lady"}),
    "volk": ((15, 3), {"male": "veles", "female": "veles"}),
    "lisa": ((25, 3), {"male": "chernobog", "female": "mara"}),
    "tur": ((20, 4), {"male": "chur", "female": "chur"}),
    "los": ((10, 5), {"male": "rodimich", "female": "zvezda_lady"}),
    "finist": ((10, 6), {"male": "alatyr", "female": "alatyr"}),
    "kon": ((1, 7), {"male": "svarog", "female": "zhiva"}),
    "orel": ((19, 7), {"male": "perun", "female": "zvezda_lady"}),
    "rasa": ((13, 8), {"male": "dazhdbog", "female": "dazhdbog"}),
}


class _CoreErrorService:
    def resolve(self, request):
        raise RecommendationCoreError("private")


class _UnexpectedService:
    def resolve(self, request):
        raise RuntimeError("private")


class RecommendationAPITests(unittest.TestCase):
    def request(self, app, method, path, **kwargs):
        async def run():
            transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
            async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
                return await client.request(method, path, **kwargs)
        return asyncio.run(run())

    def resolve(self, app, body, content_type="application/json"):
        return self.request(app, "POST", "/v1/recommendations/resolve", content=body, headers={"content-type": content_type})

    def assert_error(self, response, status, code):
        self.assertEqual(response.status_code, status)
        self.assertEqual(response.json()["error"]["code"], code)
        self.assertEqual(response.headers["content-type"], "application/json; charset=utf-8")
        self.assertEqual(UUID(response.headers["x-request-id"]).version, 4)
        self.assertNotIn("x-result-id", response.headers)

    def test_all_32_base_and_marketplace_parity(self):
        app = create_app()
        counts = {"base": 0, "ozon": 0, "wb_changed": 0}
        for chertog, ((day, month), genders) in CASES.items():
            for gender, product in genders.items():
                for marketplace in (None, "ozon", "wildberries"):
                    payload = {"birth_day": day, "birth_month": month, "gender": gender}
                    if marketplace is not None:
                        payload["marketplace"] = marketplace
                    response = self.resolve(app, json.dumps(payload).encode())
                    self.assertEqual(response.status_code, 200)
                    body = response.json()
                    expected = "alatyr" if (marketplace == "wildberries" and chertog == "voron" and gender == "male") else product
                    self.assertEqual(body["chertog"]["id"], chertog)
                    self.assertEqual(body["recommendation"]["product_key"], expected)
                    self.assertEqual(set(body), {"api_version", "input", "versions", "birth_date", "chertog", "gender", "marketplace", "recommendation"})
                    self.assertEqual(UUID(response.headers["x-request-id"]).version, 4)
                    self.assertEqual(UUID(response.headers["x-result-id"]).version, 4)
                    counts["base"] += marketplace is None
                    counts["ozon"] += marketplace == "ozon"
                    counts["wb_changed"] += marketplace == "wildberries" and expected != product
        self.assertEqual(counts, {"base": 32, "ozon": 32, "wb_changed": 1})

    def test_contract_validation_routing_and_utf8(self):
        app = create_app()
        valid = b'{"birth_day":16,"birth_month":1,"birth_year":1986,"gender":"male","marketplace":"ozon"}'
        response = self.resolve(app, valid, "application/json; charset=utf-8")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Печать Велеса", response.text)
        self.assertNotIn("\\u041f", response.text)
        self.assertEqual(response.json()["birth_date"]["display"], "16.01.1986")
        for raw in (b"", b"{", b"\xff"):
            self.assert_error(self.resolve(app, raw), 400, "MALFORMED_JSON")
        for raw in (b"[]", b'"x"', b'{"birth_day":true,"birth_month":1,"gender":"male"}', b'{"birth_day":"16","birth_month":1,"gender":"male"}', b'{"birth_day":1,"birth_month":1,"gender":"male","birth_year":null}', b'{"birth_day":31,"birth_month":4,"gender":"male"}', b'{"birth_day":29,"birth_month":2,"birth_year":1987,"gender":"male"}', b'{"birth_day":1,"birth_month":1,"gender":"male","extra":1}'):
            self.assert_error(self.resolve(app, raw), 422, "INVALID_REQUEST")
        self.assertEqual(self.resolve(app, b'{"birth_day":29,"birth_month":2,"birth_year":1988,"gender":"male"}').status_code, 200)
        self.assert_error(self.request(app, "POST", "/v1/recommendations/resolve", content=valid), 415, "UNSUPPORTED_MEDIA_TYPE")
        self.assert_error(self.resolve(app, valid, "text/plain"), 415, "UNSUPPORTED_MEDIA_TYPE")
        self.assert_error(self.resolve(app, b"x" * 16385), 413, "PAYLOAD_TOO_LARGE")
        self.assertEqual(self.request(app, "GET", "/healthz").status_code, 200)
        self.assertEqual(self.request(app, "GET", "/readyz").status_code, 200)
        for method, path in (("GET", "/v1/recommendations/resolve"), ("POST", "/healthz"), ("POST", "/readyz")):
            self.assert_error(self.request(app, method, path), 405, "METHOD_NOT_ALLOWED")
        for path in ("/unknown", "/docs", "/redoc", "/openapi.json"):
            self.assert_error(self.request(app, "GET", path), 404, "NOT_FOUND")

    def test_optional_presence_year_invariance_and_failures(self):
        app = create_app()
        without = self.resolve(app, b'{"birth_day":25,"birth_month":3,"gender":"male"}').json()
        null_marketplace = self.resolve(app, b'{"birth_day":25,"birth_month":3,"gender":"male","marketplace":null}').json()
        self.assertNotIn("birth_year", without["input"])
        self.assertNotIn("marketplace", without["input"])
        self.assertIn("marketplace", null_marketplace["input"])
        self.assertIsNone(null_marketplace["input"]["marketplace"])
        selections = []
        for year in (1980, 1993, 2020):
            body = self.resolve(app, json.dumps({"birth_day": 25, "birth_month": 3, "birth_year": year, "gender": "male", "marketplace": "ozon"}).encode()).json()
            selections.append(tuple(body["recommendation"][key] for key in ("product_key", "relation_type", "selection_basis", "reason_code")))
        self.assertEqual(len(set(selections)), 1)
        unavailable = create_app(service_factory=lambda: (_ for _ in ()).throw(ConfigurationValidationError("private")))
        self.assertEqual(self.request(unavailable, "GET", "/healthz").status_code, 200)
        self.assert_error(self.request(unavailable, "GET", "/readyz"), 503, "CONFIGURATION_UNAVAILABLE")
        self.assert_error(self.resolve(unavailable, b'{"birth_day":1,"birth_month":1,"gender":"male"}'), 503, "CONFIGURATION_UNAVAILABLE")
        self.assert_error(self.resolve(create_app(service=_CoreErrorService()), b'{"birth_day":1,"birth_month":1,"gender":"male"}'), 500, "CORE_ERROR")
        self.assert_error(self.resolve(create_app(service=_UnexpectedService()), b'{"birth_day":1,"birth_month":1,"gender":"male"}'), 500, "INTERNAL_ERROR")

    def test_completion_logging_is_structured_and_redacted(self):
        app = create_app()
        with self.assertLogs("recommendations.api", level="INFO") as captured:
            self.resolve(app, b'{"birth_day":16,"birth_month":1,"birth_year":1986,"gender":"male"}')
            self.resolve(app, b"{")
        records = [json.loads(record.split(":", 2)[-1]) for record in captured.output]
        self.assertEqual(records[0]["event"], "http_request_completed")
        self.assertIn("result_id", records[0])
        self.assertIn("error_code", records[1])
        for record in captured.output:
            self.assertNotIn("birth_year", record)
            self.assertNotIn("16.01.1986", record)
