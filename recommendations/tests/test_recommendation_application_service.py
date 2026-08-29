import unittest
from uuid import UUID

from recommendations.application import ApplicationRecommendationInput, RecommendationApplicationService
from recommendations.core import RecommendationCore


class RecommendationApplicationServiceTests(unittest.TestCase):
    def test_semantics_match_core_and_result_ids_are_independent_uuid4s(self):
        core = RecommendationCore()
        service = RecommendationApplicationService(core)
        cases = (
            (16, 1, "male", 1986, "ozon"),       # Medved
            (25, 3, "female", None, None),        # Lisa
            (20, 12, "male", None, None),         # Voron base
            (20, 12, "male", None, "wildberries"),# Voron override
            (13, 8, "female", None, "ozon"),      # Rasa
        )
        for day, month, gender, year, marketplace in cases:
            request = ApplicationRecommendationInput(day, month, gender, year, marketplace)
            first = service.resolve(request)
            second = service.resolve(request)
            expected = core.resolve_recommendation(day, month, gender, marketplace, year=year)
            self.assertEqual(first.semantic_result, expected)
            self.assertEqual(second.semantic_result, expected)
            self.assertNotEqual(first.result_id, second.result_id)
            for result_id in (first.result_id, second.result_id):
                self.assertEqual(UUID(result_id).version, 4)
                self.assertNotIn("result_id", first.semantic_result)
