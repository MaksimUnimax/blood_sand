# CAP-03 — Content/card quality — FINAL

Status: PASS

Canonical job: identify the worst-filled current catalog cards and explain what should be improved using Ozon content diagnostics.

Evidence: one `product_content_rating` read over all 76 current catalog SKUs returned HTTP 200 with exactly one logical and one physical business request; exact request preserved.

Findings:
- SKU 1602711278 and 1602711870 are the lowest-rated cards at 82/100. Their media score is 60/100 because video/video-cover is absent; text and other attributes are 100/100.
- The remaining 74 cards are 87.5/100. Their common gap is text 50/100 because Rich content is absent; media and other attributes are 100/100.

Classification: capability_recognition PASS; operation_or_cluster_selection PASS; discovery_help_usage_when_needed NOT_NEEDED; multi_run_orchestration NOT_NEEDED; business_answer PASS; operator_intervention_required NO; bridge_guidance_gap NONE.

Checkpoint: `CAP_03_PASS_CAP_04_READY`
