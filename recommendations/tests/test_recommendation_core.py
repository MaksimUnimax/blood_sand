import copy
import unittest

from recommendations.core.configuration import ConfigurationValidationError, load_configuration
from recommendations.core.recommendation import (
    RecommendationCore,
    RecommendationInputError,
    render_birth_date_context,
    resolve_chertog,
    resolve_recommendation,
    validate_birth_date,
)


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

BOUNDARIES = (
    ((27, 8), "deva"), ((19, 9), "deva"), ((20, 9), "vepr"), ((10, 10), "vepr"),
    ((11, 10), "shchuka"), ((2, 11), "shchuka"), ((3, 11), "lebed"), ((23, 11), "lebed"),
    ((24, 11), "zmei"), ((15, 12), "zmei"), ((16, 12), "voron"), ((31, 12), "voron"),
    ((1, 1), "voron"), ((6, 1), "voron"), ((7, 1), "medved"), ((30, 1), "medved"),
    ((31, 1), "busel"), ((24, 2), "busel"), ((25, 2), "volk"), ((21, 3), "volk"),
    ((22, 3), "lisa"), ((13, 4), "lisa"), ((14, 4), "tur"), ((5, 5), "tur"),
    ((6, 5), "los"), ((28, 5), "los"), ((29, 5), "finist"), ((19, 6), "finist"),
    ((20, 6), "kon"), ((12, 7), "kon"), ((13, 7), "orel"), ((3, 8), "orel"),
    ((4, 8), "rasa"), ((26, 8), "rasa"),
)


class RecommendationCoreTests(unittest.TestCase):
    def test_birth_date_validation_and_display(self):
        validate_birth_date(29, 2)
        validate_birth_date(29, 2, 1988)
        for value in ((29, 2, 1987), (31, 4, None), (0, 1, None), (1, 0, None), (32, 1, None), (1, 13, None)):
            with self.assertRaises(RecommendationInputError):
                validate_birth_date(*value)
        for value in ((True, 1, None), (1, True, None), (1, 1, True)):
            with self.assertRaises(RecommendationInputError):
                validate_birth_date(*value)
        self.assertEqual(render_birth_date_context(19, 11, 1988), "19.11.1988")
        self.assertEqual(render_birth_date_context(19, 11), "19.11")
        self.assertEqual(render_birth_date_context(7, 1, 1986), "07.01.1986")

    def test_calendar_boundaries_and_february_29(self):
        for (day, month), expected in BOUNDARIES:
            self.assertEqual(resolve_chertog(day, month)["id"], expected)
        self.assertEqual(resolve_chertog(29, 2)["id"], "volk")

    def test_all_32_base_cases_and_marketplaces(self):
        base_cases = 0
        wildberries_differences = 0
        for chertog, ((day, month), genders) in CASES.items():
            for gender, expected in genders.items():
                base_cases += 1
                base = resolve_recommendation(day, month, gender)
                ozon = resolve_recommendation(day, month, gender, "ozon")
                wildberries = resolve_recommendation(day, month, gender, "wildberries")
                for result in (base, ozon):
                    self.assertEqual(result["chertog"]["id"], chertog)
                    self.assertEqual(result["recommendation"]["product_key"], expected)
                    self.assertEqual(set(result["recommendation"]), {"product_key", "sku", "recommendation_identity", "customer_label", "relation_type", "selection_basis", "reason_code"})
                    self.assertNotIn("secondary", result)
                    self.assertNotIn("alternatives", result)
                expected_wb = "alatyr" if (chertog, gender) == ("voron", "male") else expected
                self.assertEqual(wildberries["recommendation"]["product_key"], expected_wb)
                wildberries_differences += wildberries["recommendation"]["product_key"] != expected
        self.assertEqual(base_cases, 32)
        self.assertEqual(wildberries_differences, 1)

    def test_domain_contract_cases_and_bear_customer_label(self):
        for day, month, year, gender, marketplace, chertog, product in (
            (25, 3, 1993, "male", "ozon", "lisa", "chernobog"),
            (25, 3, 1993, "female", "ozon", "lisa", "mara"),
            (16, 1, 1986, "male", "ozon", "medved", "bear_paw"),
            (16, 1, 1990, "female", "wildberries", "medved", "bear_paw"),
            (19, 7, 1988, "male", None, "orel", "perun"),
            (19, 7, 1988, "female", None, "orel", "zvezda_lady"),
            (15, 3, 1988, "male", None, "volk", "veles"),
            (15, 3, 1988, "female", None, "volk", "veles"),
            (13, 8, 1988, "male", None, "rasa", "dazhdbog"),
            (13, 8, 1988, "female", None, "rasa", "dazhdbog"),
        ):
            result = resolve_recommendation(day, month, gender, marketplace, year=year)
            self.assertEqual((result["chertog"]["id"], result["recommendation"]["product_key"]), (chertog, product))
            self.assertEqual(result["birth_date"]["display"], f"{day:02d}.{month:02d}.{year}")
            if product == "bear_paw":
                self.assertEqual(result["recommendation"]["customer_label"], "Печать Велеса")

    def test_voron_override_details(self):
        expected = {
            None: ("kolyadnik", "VORON_MALE_KOLYADNIK", "DIRECT_DERIVED", "SEMANTIC_DIRECT"),
            "ozon": ("kolyadnik", "VORON_MALE_KOLYADNIK", "DIRECT_DERIVED", "SEMANTIC_DIRECT"),
            "wildberries": ("alatyr", "VORON_CHANGE_INNER_SUPPORT", "CURATED_MEANING_SUBSTITUTE", "MARKETPLACE_OVERRIDE_SALES_WEIGHTED"),
        }
        for marketplace, values in expected.items():
            recommendation = resolve_recommendation(20, 12, "male", marketplace, year=1988)["recommendation"]
            self.assertEqual(tuple(recommendation[key] for key in ("product_key", "reason_code", "relation_type", "selection_basis")), values)
        for marketplace in (None, "ozon", "wildberries"):
            self.assertEqual(resolve_recommendation(20, 12, "female", marketplace)["recommendation"]["product_key"], "alatyr")

    def test_year_does_not_affect_selection_but_is_preserved(self):
        results = [resolve_recommendation(25, 3, "male", "ozon", year=year) for year in (1980, 1993, 2020)]
        semantic = [(r["chertog"]["id"], *(r["recommendation"][field] for field in ("product_key", "relation_type", "selection_basis", "reason_code"))) for r in results]
        self.assertEqual(len(set(semantic)), 1)
        self.assertEqual([r["birth_date"]["year"] for r in results], [1980, 1993, 2020])
        self.assertEqual([r["birth_date"]["display"] for r in results], ["25.03.1980", "25.03.1993", "25.03.2020"])

    def test_invalid_domain_inputs(self):
        for gender in ("any", "", None, "мужчина", True):
            with self.assertRaises(RecommendationInputError):
                resolve_recommendation(1, 1, gender)
        for marketplace in ("", "vk", "OZON", False):
            with self.assertRaises(RecommendationInputError):
                resolve_recommendation(1, 1, "male", marketplace)
        self.assertEqual(resolve_recommendation(1, 1, "male", None)["marketplace"], None)

    def test_invalid_supplied_configuration_fails_via_m1_2_validator(self):
        configuration = copy.deepcopy(load_configuration())
        configuration["matrix"]["base_rows"].pop()
        with self.assertRaises(ConfigurationValidationError):
            RecommendationCore(configuration)


if __name__ == "__main__":
    unittest.main()
