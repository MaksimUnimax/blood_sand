"""Immutable presentation links for completed VK recommendations."""
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse

from .illustrations import active_product_keys

REGISTRY = Path(__file__).parents[1] / "data" / "recommendation_product_links.v1.json"
AUTHORITY = "KIP_RECOMMENDATION_PRODUCT_LINKS_V1"
PRODUCTION_OWNER_ID = "139561282"
TEST_OWNER_ID = "35722386"


class ProductLinkConfigurationError(ValueError):
    pass


def _valid_url(value, host):
    parsed = urlparse(value) if isinstance(value, str) else None
    return parsed and parsed.scheme == "https" and parsed.netloc == host and bool(parsed.path)


def load_product_links(path=REGISTRY):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    products = data.get("products")
    if data.get("authority") != AUTHORITY or data.get("version") != 1 or not isinstance(products, dict):
        raise ProductLinkConfigurationError("invalid product link registry authority")
    if set(products) != active_product_keys():
        raise ProductLinkConfigurationError("product link registry must exactly cover active products")
    for key, links in products.items():
        if not isinstance(links, dict) or set(links) != {"vk", "ozon", "wildberries"}:
            raise ProductLinkConfigurationError(f"invalid link set for {key}")
        if not _valid_url(links["vk"], "vk.ru") or f"-{PRODUCTION_OWNER_ID}-" not in links["vk"] or TEST_OWNER_ID in links["vk"]:
            raise ProductLinkConfigurationError(f"invalid production VK link for {key}")
        if not _valid_url(links["ozon"], "www.ozon.ru") or not _valid_url(links["wildberries"], "www.wildberries.ru"):
            raise ProductLinkConfigurationError(f"invalid marketplace link for {key}")
    return products


def product_links(product_key):
    return load_product_links()[product_key]
