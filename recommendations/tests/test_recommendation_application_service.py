import unittest
from uuid import UUID

from recommendations.application import ApplicationRecommendationInput, RecommendationApplicationService
from recommendations.core import RecommendationCore


class RecommendationApplicationServiceTests(unittest.TestCase):
    def test_delegates_unchanged_semantics_and_adds_independent_result_id(self):
        core = RecommendationCore()
        service = RecommendationApplicationService(core)
        request = ApplicationRecommendationInput(16, 1, "male", 1986, "ozon")
        result = service.resolve(request)
        self.assertEqual(result.semantic_result, core.resolve_recommendation(16, 1, "male", "ozon", year=1986))
        self.assertEqual(UUID(result.result_id).version, 4)
        self.assertNotIn("result_id", result.semantic_result)
