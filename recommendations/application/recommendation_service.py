"""In-process application service shared by HTTP and future consumers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from recommendations.core import RecommendationCore

from .result_ids import new_result_id


@dataclass(frozen=True)
class ApplicationRecommendationInput:
    birth_day: int
    birth_month: int
    gender: str
    birth_year: int | None = None
    marketplace: str | None = None


@dataclass(frozen=True)
class ApplicationRecommendationResult:
    result_id: str
    semantic_result: dict[str, Any]


class RecommendationApplicationService:
    """Delegate all recommendation semantics to the already validated Core."""

    def __init__(self, core: RecommendationCore | None = None) -> None:
        self._core = RecommendationCore() if core is None else core

    def resolve(self, request: ApplicationRecommendationInput) -> ApplicationRecommendationResult:
        semantic_result = self._core.resolve_recommendation(
            request.birth_day,
            request.birth_month,
            request.gender,
            request.marketplace,
            year=request.birth_year,
        )
        return ApplicationRecommendationResult(result_id=new_result_id(), semantic_result=semantic_result)
