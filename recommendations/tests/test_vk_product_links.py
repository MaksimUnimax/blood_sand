import json
import tempfile
import unittest
from pathlib import Path

from recommendations.vk.keyboard import recommendation_marketplace_keyboard
from recommendations.vk.product_links import (
    ProductLinkConfigurationError, TEST_OWNER_ID, load_product_links, product_links,
)


class VKProductLinksTests(unittest.TestCase):
    def test_active_registry_has_exact_coverage_and_only_kolyadnik_substitution(self):
        links = load_product_links()
        self.assertEqual(len(links), 15)
        self.assertEqual(sum(1 for value in links.values() if "-139561282-" in value["vk"]), 15)
        self.assertEqual(sum(1 for value in links.values() if value["ozon"]), 15)
        self.assertEqual(sum(1 for value in links.values() if value["wildberries"]), 15)
        self.assertNotIn(TEST_OWNER_ID, json.dumps(links))
        self.assertIn("11604209", links["svarog"]["vk"]); self.assertIn("11604231", links["alatyr"]["vk"])
        self.assertIn("11604207", links["veles"]["vk"]); self.assertIn("11604213", links["bear_paw"]["vk"])
        self.assertNotEqual(links["svarog"]["vk"], links["alatyr"]["vk"])
        self.assertNotEqual(links["veles"]["vk"], links["bear_paw"]["vk"])
        alatyr_wb = links["alatyr"]["wildberries"]
        self.assertEqual(links["kolyadnik"]["wildberries"], alatyr_wb)
        self.assertEqual([key for key, value in links.items() if value["wildberries"] == alatyr_wb], ["alatyr", "kolyadnik"])

    def test_production_registry_rejects_test_owner(self):
        data = {"authority": "KIP_RECOMMENDATION_PRODUCT_LINKS_V1", "version": 1, "products": load_product_links()}
        data["products"]["svarog"]["vk"] = data["products"]["svarog"]["vk"].replace("139561282", TEST_OWNER_ID)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "links.json"; path.write_text(json.dumps(data))
            with self.assertRaises(ProductLinkConfigurationError): load_product_links(path)

    def test_one_row_open_link_keyboard_and_kolyadnik_label(self):
        for key in load_product_links():
            keyboard = recommendation_marketplace_keyboard(key, product_links(key))
            self.assertEqual((keyboard["one_time"], keyboard["inline"], len(keyboard["buttons"]), len(keyboard["buttons"][0])), (False, True, 1, 3))
            self.assertEqual([button["action"]["type"] for button in keyboard["buttons"][0]], ["open_link"] * 3)
        self.assertEqual(recommendation_marketplace_keyboard("kolyadnik", product_links("kolyadnik"))["buttons"][0][2]["action"]["label"], "🟣 Wildberries · Алатырь")
