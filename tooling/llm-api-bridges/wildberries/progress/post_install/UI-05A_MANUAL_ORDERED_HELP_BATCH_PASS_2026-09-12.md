# UI-05A — installed WB 0.2.1 Manual ordered HELP batch

Date: 2026-09-12
Status: PASS

Operator executed one Manual block containing three local HELP envelopes in source order:
1. describe cards_list
2. describe subscriptions
3. catalog offset=5 limit=2

Observed WB_RESULT_V1:
- version 0.2.1
- operation explicit_batch
- logical_command_count=3
- physical_request_count=0, min/max=0/0
- external_request_executed=false
- automatic_retry=false
- batch.status=completed
- item order preserved exactly as indexes 0,1,2
- all three items state=success and kind=help
- subscriptions remained execution_enabled=false with blocked_reason SERVICE_TOKEN_ONLY_PERSONAL_BUILD
- catalog returned offset=5 limit=2 and next_offset=7

Acceptance: installed Manual parser/batch path preserves explicit order and executes local HELP without WB provider calls. Autorun is excluded from production acceptance by operator decision and is not required for next production patch.
