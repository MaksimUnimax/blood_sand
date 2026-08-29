"""Deterministic V2 recommendation resolution from validated configuration."""

from __future__ import annotations

from datetime import date
from types import MappingProxyType
from typing import Any, Mapping

from .configuration import load_configuration, validate_configuration


class RecommendationInputError(ValueError):
    """Raised when customer/domain input is invalid."""


class RecommendationCoreError(RuntimeError):
    """Raised when a validated configuration cannot be resolved consistently."""


def validate_birth_date(day: int, month: int, year: int | None = None) -> None:
    """Validate a Gregorian birth date, allowing 29 February without a year."""
    if type(day) is not int or type(month) is not int:
        raise RecommendationInputError("day and month must be integers")
    if year is not None and type(year) is not int:
        raise RecommendationInputError("year must be an integer when supplied")
    try:
        date(2000 if year is None else year, month, day)
    except (TypeError, ValueError) as error:
        raise RecommendationInputError("invalid Gregorian birth date") from error


def render_birth_date_context(day: int, month: int, year: int | None = None) -> str:
    """Return the validated, normalized display context for a supplied DOB."""
    validate_birth_date(day, month, year)
    return f"{day:02d}.{month:02d}" if year is None else f"{day:02d}.{month:02d}.{year:04d}"


def _in_circular_range(point: tuple[int, int], start: tuple[int, int], end: tuple[int, int]) -> bool:
    return start <= point <= end if start <= end else point >= start or point <= end


class RecommendationCore:
    """Read-only lookup core built exclusively from M1.2-validated data."""

    def __init__(self, configuration: Mapping[str, Any] | None = None) -> None:
        data = load_configuration() if configuration is None else configuration
        validate_configuration(configuration=data)

        calendar = data["calendar"]
        self._versions = MappingProxyType({
            "calendar_version": calendar["calendar_version"],
            "product_policy_version": data["products"]["product_policy_version"],
            "matrix_version": data["matrix"]["matrix_version"],
            "marketplace_override_version": data["overrides"]["marketplace_override_version"],
            "copy_version": data["copy"]["copy_version"],
        })
        self._chertogs = tuple(
            MappingProxyType({
                "id": row["chertog_id"],
                "name": row["name"],
                "patron_name": row["patron"]["name"],
                "start": (row["start"]["month"], row["start"]["day"]),
                "end": (row["end"]["month"], row["end"]["day"]),
            })
            for row in calendar["chertogs"]
        )
        self._base_rows = MappingProxyType({
            (row["chertog_id"], row["gender"]): MappingProxyType(dict(row))
            for row in data["matrix"]["base_rows"]
        })
        self._overrides = MappingProxyType({
            (row["marketplace"], row["chertog_id"], row["gender"]): MappingProxyType(dict(row))
            for row in data["overrides"]["overrides"]
        })
        self._products = MappingProxyType({
            row["product_key"]: MappingProxyType(dict(row))
            for row in data["products"]["products"]
        })

    def resolve_chertog(self, day: int, month: int) -> dict[str, str]:
        validate_birth_date(day, month)
        point = (month, day)
        matches = [row for row in self._chertogs if _in_circular_range(point, row["start"], row["end"])]
        if len(matches) != 1:
            raise RecommendationCoreError("validated calendar did not resolve exactly one Chertog")
        row = matches[0]
        return {"id": row["id"], "name": row["name"], "patron_name": row["patron_name"]}

    def resolve_recommendation(
        self, day: int, month: int, gender: str, marketplace: str | None = None, *, year: int | None = None
    ) -> dict[str, Any]:
        validate_birth_date(day, month, year)
        if type(gender) is not str or gender not in {"male", "female"}:
            raise RecommendationInputError("gender must be exactly 'male' or 'female'")
        if marketplace is not None and (type(marketplace) is not str or marketplace not in {"ozon", "wildberries"}):
            raise RecommendationInputError("marketplace must be None, 'ozon', or 'wildberries'")

        chertog = self.resolve_chertog(day, month)
        base = self._base_rows.get((chertog["id"], gender))
        if base is None:
            raise RecommendationCoreError("validated matrix has no base row for resolved case")
        override = self._overrides.get((marketplace, chertog["id"], gender)) if marketplace is not None else None
        selected = override if override is not None else base
        product_key = selected["effective_product_key"] if override is not None else selected["product_key"]
        product = self._products.get(product_key)
        if product is None:
            raise RecommendationCoreError("validated configuration references an unresolved product")

        return {
            **self._versions,
            "birth_date": {"day": day, "month": month, "year": year, "display": render_birth_date_context(day, month, year)},
            "chertog": chertog,
            "gender": gender,
            "marketplace": marketplace,
            "recommendation": {
                "product_key": product_key,
                "sku": product["sku"],
                "recommendation_identity": product["recommendation_identity"],
                "customer_label": product["customer_label"],
                "relation_type": selected["relation_type"],
                "selection_basis": selected["selection_basis"],
                "reason_code": selected["reason_code"],
            },
        }


_canonical_core: RecommendationCore | None = None


def _get_canonical_core() -> RecommendationCore:
    global _canonical_core
    if _canonical_core is None:
        _canonical_core = RecommendationCore()
    return _canonical_core


def resolve_chertog(day: int, month: int) -> dict[str, str]:
    return _get_canonical_core().resolve_chertog(day, month)


def resolve_recommendation(
    day: int, month: int, gender: str, marketplace: str | None = None, *, year: int | None = None
) -> dict[str, Any]:
    return _get_canonical_core().resolve_recommendation(day, month, gender, marketplace, year=year)
