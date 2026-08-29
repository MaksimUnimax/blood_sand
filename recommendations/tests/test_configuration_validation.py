import copy
import unittest

from recommendations.core.configuration import ConfigurationValidationError, load_configuration, validate_configuration


class ConfigurationValidationTests(unittest.TestCase):
    def setUp(self):
        self.data = load_configuration()

    def invalid(self, mutate):
        data = copy.deepcopy(self.data)
        mutate(data)
        with self.assertRaises(ConfigurationValidationError):
            validate_configuration(configuration=data)

    def test_canonical_configuration_passes(self):
        validate_configuration(configuration=self.data)


def row(data, chertog, gender):
    return next(item for item in data["matrix"]["base_rows"] if item["chertog_id"] == chertog and item["gender"] == gender)


def product(data, key):
    return next(item for item in data["products"]["products"] if item["product_key"] == key)


def add_failure_test(name, mutate):
    def test(self):
        self.invalid(mutate)
    test.__name__ = name
    setattr(ConfigurationValidationTests, name, test)


add_failure_test("test_wrong_version_marker_fails", lambda d: d["matrix"].update(matrix_version="wrong"))
add_failure_test("test_calendar_gap_fails", lambda d: d["calendar"]["chertogs"][0]["start"].update(day=28))
add_failure_test("test_calendar_overlap_fails", lambda d: d["calendar"]["chertogs"][1]["start"].update(day=19))
add_failure_test("test_duplicate_chertog_id_fails", lambda d: d["calendar"]["chertogs"][1].update(chertog_id="deva"))
def feb_not_volk(d):
    volk = next(x for x in d["calendar"]["chertogs"] if x["chertog_id"] == "volk")
    busel = next(x for x in d["calendar"]["chertogs"] if x["chertog_id"] == "busel")
    volk["start"] = {"day": 1, "month": 3}
    busel["end"] = {"day": 29, "month": 2}
add_failure_test("test_feb_29_not_belonging_to_volk_fails", feb_not_volk)
add_failure_test("test_missing_base_case_fails", lambda d: d["matrix"]["base_rows"].pop())
add_failure_test("test_duplicate_base_case_fails", lambda d: d["matrix"]["base_rows"].__setitem__(-1, copy.deepcopy(d["matrix"]["base_rows"][0])))
add_failure_test("test_unknown_matrix_product_key_fails", lambda d: row(d, "deva", "male").update(product_key="missing"))
add_failure_test("test_inactive_reserve_matrix_product_fails", lambda d: row(d, "deva", "male").update(product_key="belobog"))
add_failure_test("test_product_role_is_required", lambda d: product(d, "triglav").pop("role"))
add_failure_test("test_matrix_gender_policy_conflict_fails", lambda d: row(d, "deva", "male").update(product_key="mara"))
add_failure_test("test_product_allowed_chertogs_conflict_fails", lambda d: product(d, "svarog").update(allowed_chertogs=["kon"]))
add_failure_test("test_bear_paw_outside_medved_fails", lambda d: row(d, "volk", "male").update(product_key="bear_paw"))
add_failure_test("test_bear_paw_customer_label_fails", lambda d: product(d, "bear_paw").update(customer_label="other"))
add_failure_test("test_dazhdbog_outside_rasa_fails", lambda d: row(d, "tur", "male").update(product_key="dazhdbog"))
def dazhdbog_count(d):
    row(d, "rasa", "female")["product_key"] = "alatyr"
    product(d, "alatyr")["allowed_chertogs"].append("rasa")
add_failure_test("test_dazhdbog_base_count_not_two_fails", dazhdbog_count)
add_failure_test("test_svarog_in_female_base_row_fails", lambda d: row(d, "deva", "female").update(product_key="svarog"))
add_failure_test("test_chernobog_in_female_base_row_fails", lambda d: row(d, "lisa", "female").update(product_key="chernobog"))
add_failure_test("test_mara_in_male_base_row_fails", lambda d: row(d, "lisa", "male").update(product_key="mara"))
add_failure_test("test_zvezda_lady_in_male_base_row_fails", lambda d: row(d, "orel", "male").update(product_key="zvezda_lady"))
add_failure_test("test_lisa_male_locked_result_fails", lambda d: row(d, "lisa", "male").update(product_key="svarog"))
add_failure_test("test_lisa_female_locked_result_fails", lambda d: row(d, "lisa", "female").update(product_key="zvezda_lady"))
add_failure_test("test_orel_male_locked_result_fails", lambda d: row(d, "orel", "male").update(product_key="svarog"))
add_failure_test("test_orel_female_locked_result_fails", lambda d: row(d, "orel", "female").update(product_key="mara"))
add_failure_test("test_unapproved_marketplace_override_fails", lambda d: d["overrides"]["overrides"][0].update(effective_product_key="kolyadnik"))
add_failure_test("test_redundant_ozon_override_fails", lambda d: d["overrides"]["overrides"][0].update(marketplace="ozon", effective_product_key="kolyadnik"))
add_failure_test("test_override_base_product_mismatch_fails", lambda d: d["overrides"]["overrides"][0].update(base_product_key="alatyr"))
add_failure_test("test_missing_matrix_reason_code_fails", lambda d: row(d, "deva", "male").update(reason_code="MISSING"))
add_failure_test("test_missing_override_reason_code_fails", lambda d: d["overrides"]["overrides"][0].update(reason_code="MISSING"))
def duplicate_reason(d): d["copy"]["records"][1]["reason_code"] = d["copy"]["records"][0]["reason_code"]
add_failure_test("test_duplicate_reason_code_fails", duplicate_reason)
def base_reason_scoped(d): next(x for x in d["copy"]["records"] if x["reason_code"] == "DEVA_MALE")["marketplace"] = "ozon"
add_failure_test("test_base_reason_record_scoped_to_marketplace_fails", base_reason_scoped)
def voron_ozon(d): next(x for x in d["copy"]["records"] if x["reason_code"] == "VORON_MALE_KOLYADNIK")["marketplace"] = "ozon"
add_failure_test("test_voron_male_base_reason_becoming_ozon_scoped_fails", voron_ozon)
def extra_marketplace_reason(d):
    next(x for x in d["copy"]["records"] if x["reason_code"] == "DEVA_MALE")["marketplace"] = "ozon"
add_failure_test("test_extra_marketplace_scoped_reason_fails", extra_marketplace_reason)
def reserve_role_matrix_bypass(d):
    triglav = product(d, "triglav")
    triglav.update(active_for_recommendation=True, allowed_chertogs=["vepr"], gender_policy="any")
    row(d, "vepr", "male").update(product_key="triglav")
add_failure_test("test_reserve_role_matrix_bypass_fails", reserve_role_matrix_bypass)
def inactive_auto_role_matrix_bypass(d):
    belobog = product(d, "belobog")
    belobog.update(active_for_recommendation=True, allowed_chertogs=["vepr"], gender_policy="any")
    row(d, "vepr", "male").update(product_key="belobog")
add_failure_test("test_inactive_auto_role_matrix_bypass_fails", inactive_auto_role_matrix_bypass)
def reserve_role_override_bypass(d):
    triglav = product(d, "triglav")
    triglav.update(active_for_recommendation=True, allowed_chertogs=["voron"], gender_policy="male")
    d["overrides"]["overrides"][0]["effective_product_key"] = "triglav"
add_failure_test("test_reserve_role_override_bypass_fails", reserve_role_override_bypass)
def secondary_field(d): row(d, "deva", "male")["secondary_product"] = "alatyr"
add_failure_test("test_secondary_rank_two_style_field_is_rejected", secondary_field)
add_failure_test("test_full_dob_context_not_true_fails", lambda d: d["copy"].update(full_dob_supported_as_display_context=False))
add_failure_test("test_year_affects_selection_not_false_fails", lambda d: d["copy"].update(year_affects_selection=True))


if __name__ == "__main__":
    unittest.main()
