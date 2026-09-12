# F-02 correction — installed WB 0.2.1 local error delivery

Date: 2026-09-12.
Status: **FAIL_LOCAL_ERROR_NOT_DELIVERED_TO_CHAT**.

This file corrects the assistant's earlier incorrect PASS classification. Historical evidence is not deleted.

## Installed observation

Command:

`WB_API_V1` + `{ "operation": "definitely_unknown_operation", "params": {} }`

Observed installed behavior: only a transient page toast `Wildberries: Operation blocked locally.` was shown. No durable `WB_RESULT_V1` / structured Bridge error was delivered back into the AI conversation.

## Ozon reference contract

Final Ozon Bridge does not treat pre-execution/local admission failures as toast-only terminal UX. Manual execution converts Work/manual/Autorun/parser/discovery/admission failures into batch `pre_execution_error`/guidance entries, stores a local result/report with `external_request_executed=false`, terminalizes the batch and delivers the structured result into the AI chat. Toast/UI status may supplement that result but is not the only output.

## Root cause in WB 0.2.1

WB `executeWorkPlan()` parses and preflights entries before creating the durable manual operation. A parser/preflight/local-admission exception propagates back to content script, whose manual handler catches it and shows a toast. Because no durable batch/result operation exists yet, there is nothing to deliver back into the chat.

## Required next-patch behavior

- Every command-level local error that can be represented safely must become a durable structured Bridge result item and be delivered into the originating AI conversation.
- This includes malformed/invalid command, unknown operation, disabled/unsupported operation, Personal Data gate, entitlement/policy/planning rejection and other pre-execution failures.
- Provider calls must remain zero for such errors.
- Toast may remain as supplemental UI feedback only.
- Error delivery must preserve conversation ownership/generation rules and must itself recover durably without retrying the provider.

This defect invalidates the previous PASS classification and is a parity gap against the Ozon reference runtime.
