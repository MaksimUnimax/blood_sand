"""Strict HTTP transport models; business validation remains in the Core."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, StrictInt, model_validator


class ResolveRequest(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")

    birth_day: StrictInt
    birth_month: StrictInt
    gender: Literal["male", "female"]
    birth_year: StrictInt | None = None
    marketplace: Literal["ozon", "wildberries"] | None = None

    @model_validator(mode="after")
    def reject_explicit_null_birth_year(self):
        if "birth_year" in self.model_fields_set and self.birth_year is None:
            raise ValueError("birth_year may not be null")
        return self


class MiniAppResolveRequest(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")

    birth_day: StrictInt
    birth_month: StrictInt
    gender: Literal["male", "female"]
    birth_year: StrictInt | None = None

    @model_validator(mode="after")
    def reject_explicit_null_birth_year(self):
        if "birth_year" in self.model_fields_set and self.birth_year is None:
            raise ValueError("birth_year may not be null")
        return self
