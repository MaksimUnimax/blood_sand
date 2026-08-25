# Ozon Bridge v0.1.19 — Personal-Data READ Policy Expansion for Full Seller API Coverage

Date: 2026-08-25  
Status: design amendment; implementation not yet completed  
Repository: `MaksimUnimax/blood_sand`  
Parent authority: `OZON_BRIDGE_SESSION_LIFECYCLE_AND_PERSONAL_DATA_POLICY_SPEC_2026-08-21.md`

## 1. Purpose

This amendment applies the already-approved Patch B personal-data READ policy to the full Seller API coverage inventory.

It corrects the temporary 2026-08-25 catalog filtering decision that treated ten additional personal-data/unstructured-customer READ operations as permanently excluded.

These operations are **not permanent exclusions** merely because they may contain, return, or require personal customer data. They are conditionally available READ operations governed by the global operator setting `Показывать личные данные`.

Mutation/write operations remain permanently unavailable to the AI surface.

## 2. Existing policy remains authoritative

The parent specification already defines the required behavior:

- add one global `Показывать личные данные` setting;
- default is OFF;
- when ON, configured personal-data READ operations are accepted as ordinary valid READ operations and their authorized personal-data result may be delivered only to the bound AI conversation;
- when OFF, the personal-data READ command is completed locally and is not sent to Ozon;
- the local result tells the AI that the operator must enable `Показывать личные данные`;
- Manual returns to ready;
- zero provider requests are made while blocked;
- quota/timing/cache state is unchanged by the blocked attempt;
- the blocked operation is never replayed automatically;
- after the operator enables the setting, the operator explicitly submits/clicks a new command;
- diagnostics remain payload-free;
- durable personal payload is scrubbed after confirmed delivery according to the parent policy.

This is an operator-consent gate. OFF means explicit permission is still required; ON is the operator's standing permission for configured personal-data READ operations.

## 3. Required OFF contract

For every configured personal-data READ operation, the local result while the setting is OFF must use the same semantic contract as Patch B, for example:

```json
{
  "status": "personal_data_setting_required",
  "operation": "<bridge_alias>",
  "error": "OPERATION_DISABLED_BY_USER",
  "message": "Операция может передать личные данные в AI-чат. Чтобы выполнить запрос, включите «Показывать личные данные» в настройках Ozon Bridge.",
  "external_request_executed": false,
  "physical_business_request_count": 0
}
```

The exact message may identify whether the operation returns personal data or requires personal data as request input, but it must always make the operator action explicit.

## 4. Additional Seller READ operations covered by the gate

The following ten operations must move from `PERMANENTLY_EXCLUDED_PERSONAL_DATA` (or equivalent temporary catalog status) to `PERSONAL_DATA_READ_GATED`:

1. `POST /v1/carriage/courier-contact/get` — contact data.
2. `POST /v1/review/comment/list` — customer free text may contain personal data.
3. `POST /v1/review/info` — review/customer free text may contain personal data.
4. `POST /v1/review/list` — review/customer free text may contain personal data.
5. `POST /v1/question/answer/list` — customer/question free text may contain personal data.
6. `POST /v1/question/info` — customer question/free text may contain personal data.
7. `POST /v1/question/list` — customer question/free text may contain personal data.
8. `POST /v3/chat/history` — chat content may contain personal data.
9. `POST /v1/delivery/check` — request may require customer delivery/location data.
10. `POST /v2/delivery/checkout` — request may require customer delivery/location data.

The already-designed `posting_fbs_get` personal-data READ policy remains covered by the parent specification and is not replaced by this list.

## 5. Full-coverage count correction

For the 2026-08-25 463-operation Seller API filtering snapshot, moving these ten operations from permanent exclusion into conditional personal-data READ changes the top-level counts from:

- rollout: 268;
- excluded: 195;

into:

- **rollout/conditionally implementable READ surface: 278**;
- **permanently excluded: 185**.

The permanent exclusion set then consists of:

- **173** operations that mutate Ozon data or business state;
- **12** operations explicitly deprecated by the current Swagger snapshot.

No personal-data READ operation is permanently excluded solely because personal data is involved when the operator-consent gate can safely control its execution and delivery.

## 6. Guidance behavior

Guidance/catalog generation must distinguish at least:

- ordinary READ;
- structured/field-allowlisted READ;
- `PERSONAL_DATA_READ_GATED`;
- explicit read workflow;
- mutation/write blocked;
- deprecated.

When `Показывать личные данные` is OFF, guidance may still describe a personal-data READ operation as known/implemented, but execution must terminate locally with `personal_data_setting_required` and zero provider requests.

When the setting is ON, the operation is offered/executed according to its ordinary contract and other capability/entitlement rules.

The AI must never infer that an OFF-gated operation is unsupported by Ozon or unsupported by Bridge. It is conditionally disabled by operator policy.

## 7. No hidden consent or replay

Turning the setting ON does not resume or replay a previously blocked command. The operator must explicitly issue/click a new command after granting permission.

Turning the setting OFF prevents any new personal-data READ provider request from being dispatched. It does not rewrite prior provider history or pretend that an already-started request never occurred.

## 8. Implementation status

As of this amendment, the repository contains the design authority for Patch B, but the intended feature branch `feature/ozon-personal-data-read-policy-2026-08-21` is not present. Therefore the policy is considered **designed but not yet implemented and browser-accepted**.

Implementation must be performed as a separate production patch and then independently browser-tested. Existing lifecycle/Autorun/provider timing/no-replay behavior must not be changed merely to add this policy.
