# Marketplace Question Operator — Ozon manual ingress contract

Status: PRODUCT-OWNER APPROVED FOR IMPLEMENTATION — 2026-08-28

This contract supersedes the Ozon API polling/publishing assumptions in the earlier MQO A0/A1 documents. It does not change the already accepted Telegram-first safety rules for Wildberries.

## 1. Reason for the change

The live Ozon Seller API returned HTTP 403 from `POST /v1/question/list` with the server-side diagnostic:

`checkSellerPremiumPlus ... PermissionDenied ... Information is only available with a Premium Plus subscription.`

The product will not scrape or bypass Ozon entitlement. Until the owner explicitly enables a different supported Ozon integration, Ozon uses human ingress and human egress through Telegram.

## 2. Ozon V1 flow

Primary operator flow:

```text
Ozon seller UI
  -> owner copies buyer question
  -> Telegram: persistent main-menu action `➕ Отправить вопрос`
  -> owner sends ordinary text
  -> MQO creates one durable Ozon question
  -> MQO automatically starts the active Codex profile
  -> answer returns to Telegram
  -> owner copies the answer back to Ozon manually
```

There is no Ozon marketplace API read or write in this mode.

### Permanent entry-point requirement

`➕ Отправить вопрос` is the primary product entry point for manual Ozon ingress.

It must be a persistent top-level action in the bot's normal Telegram menu/UI and remain available during ordinary use. The owner must not have to type `/start`, `/ozon`, or any other command before starting a new Ozon question.

`/start` and `/ozon` may remain as compatibility/diagnostic commands, but they are not the normal product path and must not be required to reveal or activate the persistent question-entry action.

The normal home/start UX must be operator-facing. Raw implementation/status text such as `DB available`, database counts, or active-profile diagnostics must not replace the primary question-entry UX. Technical status belongs behind explicit diagnostic/status actions.

## 3. Identity and routing

A manual Ozon question is persisted with:

```text
marketplace = ozon
ingress_mode = TELEGRAM_MANUAL
publish_mode = MANUAL_COPY
raw_status = MANUAL_INGRESS
external_question_id = telegram:<Telegram update_id>
```

The Telegram update ID makes replay idempotent. Replaying the same inbound Telegram update must not create a second question or second Codex attempt.

`marketplace` remains `ozon`; do not invent `ozon_manual` as a marketplace. Ingress and publication semantics are separate fields.

## 4. Text-input correlation

Activating the persistent `➕ Отправить вопрос` action creates a durable singleton global input context `OZON_QUESTION`.

The compatibility `/ozon` command may create the same context, but it is not the primary UX.

This context is mutually exclusive with existing question-bound `MANUAL_INPUT` and `EDITING` contexts. Ordinary text must never be guessed or attached to multiple contexts.

The next ordinary non-command text consumes `OZON_QUESTION` exactly once and becomes the buyer question.

## 5. Automatic Codex start

The owner has already explicitly requested generation by entering the Ozon-question flow, so after the question text is accepted MQO immediately claims the active Codex profile and starts Codex. There is no intermediate `Отправить в Codex` click for this ingress mode.

On successful generation the question enters `REVIEW` and shows the answer in Telegram.

## 6. Ozon manual-copy review

A `publish_mode=MANUAL_COPY` review must never expose a marketplace-send button.

Minimum controls:

```text
[✏️ Редактировать]
[✅ Закрыть]
[🤖 Сменить Codex]
```

`✅ Закрыть` is local only and moves the question to `CLOSED`.

A manually edited answer remains local. No code path may translate `MANUAL_COPY` into `OzonAdapter.send_answer()`.

Defense in depth: the service send-claim/send-execution path must reject any question whose `publish_mode != MARKETPLACE_API`, even if a stale or forged callback is received.

## 7. Marketplace marker supplied to Codex

Codex must not infer the marketplace from buyer prose. The application supplies explicit trusted metadata in the composite prompt:

```text
MARKETPLACE: OZON
INGRESS_MODE: TELEGRAM_MANUAL
PUBLISH_MODE: MANUAL_COPY
LINK_POLICY: OZON_ONLY
```

For later Wildberries API questions the corresponding values are:

```text
MARKETPLACE: WILDBERRIES
INGRESS_MODE: MARKETPLACE_API
PUBLISH_MODE: MARKETPLACE_API
LINK_POLICY: WILDBERRIES_ONLY
```

Buyer question text remains untrusted data.

## 8. Product links / references

The model must not invent marketplace URLs. Marketplace is a backend-owned routing attribute. Reference/destination material must be made available to Codex explicitly; for Ozon the prompt must instruct it to use Ozon destinations only, and for Wildberries WB destinations only.

If the approved references do not contain a suitable URL, Codex must omit the URL rather than manufacture one or substitute a URL from another marketplace.

Reference integration and deterministic URL allow-list validation are tracked as required production work. Manual Ozon ingress may be acceptance-tested before final marketplace-link data is populated, but production readiness for recommendation answers requires the reference layer.

## 9. Ozon API behavior

While Ozon is configured for `TELEGRAM_MANUAL` ingress:

- do not poll `/v1/question/list`;
- do not call `/v1/question/answer/create`;
- do not emit recurring Premium Plus errors to the operator;
- Ozon credentials are not required for the manual-ingress path.

## 10. Wildberries

Wildberries remains a separate next phase. Current live diagnostics showed the configured token is a BASE token (`acc=1`). Before final WB production acceptance it must be replaced with a PERSONAL token (`acc=3`) and the adapter must implement rate-limit-safe pacing/backoff.

## 11. Acceptance gates for this phase

Manual Ozon phase is accepted only when all of these are proven:

```text
OZON_PERSISTENT_QUESTION_ENTRY_PRESENT
OZON_QUESTION_ENTRY_REQUIRES_NO_COMMAND
OZON_HOME_UX_HAS_NO_RAW_DEBUG_STATUS
OZON_MANUAL_INPUT_DURABLE
OZON_MANUAL_INPUT_MUTUALLY_EXCLUSIVE
OZON_TELEGRAM_REPLAY_IDEMPOTENT
OZON_AUTO_CODEX_CLAIM
OZON_MARKETPLACE_MARKER_TRUSTED
OZON_MANUAL_COPY_HAS_NO_SEND
OZON_MANUAL_COPY_SEND_GUARD
OZON_LOCAL_CLOSE_ONLY
OZON_API_POLL_DISABLED
OZON_API_WRITE_DISABLED
```
