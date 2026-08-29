"""Transport-neutral recommendation application boundary."""

from .recommendation_service import (
    ApplicationRecommendationInput,
    ApplicationRecommendationResult,
    RecommendationApplicationService,
)

__all__ = [
    "ApplicationRecommendationInput",
    "ApplicationRecommendationResult",
    "RecommendationApplicationService",
]
