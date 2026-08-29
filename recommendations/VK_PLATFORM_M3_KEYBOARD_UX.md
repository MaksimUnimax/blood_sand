# VK Platform M3 text keyboard UX

Status: **KIP_VK_M3_TEXT_KEYBOARD_UX_V1**
Date: 2026-08-29

## Official authority

Verified only against `VKCOM/vk-api-schema` commit
`333481bd082ad747d4873ef4a77f9247097eeef0` at VK API `5.199`:
`messages.send.keyboard` is a string referencing `messages_keyboard`; that
object defines `one_time`, `buttons`, and `inline`. A keyboard button has an
`action`, and `messages_keyboard_button_action_text` defines `type = text`,
`label`, and string `payload`. The inbound message payload field is a string.

## Input policy

```text
TEXT_REQUIRED_INPUTS = birth date only
BUTTON_REQUIRED_INPUTS = gender, restart
FUTURE_FINITE_CHOICE_DEFAULT = clickable VK text keyboard controls
```

Manual labels remain a compatibility fallback only. Bot copy must not instruct a
user to type `Мужчине`, `Женщине`, or `Подобрать снова`.

## Gender keyboard

```text
one_time = true
inline = false
```

One row contains these `text` actions:

| Label | Payload |
|---|---|
| Мужчине | `{"kip":"gender","value":"male","v":1}` |
| Женщине | `{"kip":"gender","value":"female","v":1}` |

## Restart keyboard

```text
one_time = true
inline = false
label = Подобрать снова
payload = {"kip":"restart","v":1}
```

All actions use `type = text`. This V1 slice does not use callback actions,
`message_event`, or Callback subscription changes.

## Payload security and semantic precedence

Keyboard payload is user-returned input. A future parser may prefer its
semantic action/value only when it is a valid, exact V1 whitelisted object for
the current Bot state. It must validate object shape, `v`, action name, allowed
values, and state transition. Unknown payload fails closed or falls back under
the exact input contract.

Payload must not select a `product_key`, marketplace override, method name, or
arbitrary command. The visible text labels remain compatibility fallbacks, not
the instructed primary interaction.
