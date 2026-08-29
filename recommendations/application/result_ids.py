"""Application metadata identifiers."""

from uuid import uuid4


def new_result_id() -> str:
    """Return an independent UUIDv4 for a completed resolution."""
    return str(uuid4())
