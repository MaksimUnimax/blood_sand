# Public Alice source probe plan

Purpose: determine the current first-party active-send Oknyx contract without using seller/provider credentials and without guessing from a screenshot.

The probe may read only public `https://alice.yandex.ru/` HTML and public first-party JS assets linked from that page. It must not use the owner's cookies, account session, Ozon credentials, Seller API, Performance API, or browser-private data.

Search targets are limited to the Alice composer/Oknyx component contract: `oknyx`, `oknyx-button`, `alice-oknyx-button`, `StandaloneOknyx`, send/stop/listen state strings, and attributes or state variables that choose the active arrow/send representation.

Output must be concise snippets around matched component/source tokens plus source URL/SHA-256. It must not dump unrelated application source.

Provider calls: 0.
