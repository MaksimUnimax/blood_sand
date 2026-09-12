# F-01 — installed WB 0.2.1 ChatGPT cross-chat isolation

Date: 2026-09-12.
Status: PASS.

Operator opened a different ChatGPT conversation, requested one local `WB_HELP_V1 describe seller_info` command, and executed it with the WB page button in that second conversation.

Observed in operator screenshot:
- command appeared in the second conversation;
- resulting `WB_RESULT_V1` appeared in the second conversation;
- bridge version `0.2.1`;
- result was local HELP with no WB provider call (`physical_request_count=0`, `external_request_executed=false`);
- the current/original ChatGPT conversation did not receive an unsolicited result from the second conversation.

Acceptance: PASS for installed cross-chat routing/isolation for this local Manual HELP scenario. This does not certify route-change-during-delivery, file delivery, Alice, or live WB provider behavior.
