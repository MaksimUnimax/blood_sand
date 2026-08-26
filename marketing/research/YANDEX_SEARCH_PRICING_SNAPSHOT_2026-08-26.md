# Yandex Search API pricing snapshot — 2026-08-26

Status: **FRESH VERIFIED BEFORE SECONDARY SEARCH A1**

Official source:

https://aistudio.yandex.ru/docs/ru/search-api/pricing.html

Fresh verification date: 2026-08-26.

Current official RUB prices, VAT included:

- daytime synchronous: `488 RUB / 1000 requests` = `0.488 RUB/request`;
- nighttime synchronous: `366 RUB / 1000 requests` = `0.366 RUB/request`;
- daytime deferred: `30.5 RUB / 1000 requests`;
- nighttime deferred: `25.41 RUB / 1000 requests`.

Official reduced-tariff window:

`00:00:00–07:59:59 UTC+3`.

The next Roadmap-04 secondary measurement uses the existing synchronous text Search first slice. At the time of this fresh check the tariff class is daytime, therefore the expected provider price for one accepted A1 synchronous initiation is approximately:

`0.488 RUB`.

Requests that finish with an internal server error or authentication error are documented by Yandex as non-billable, but research accounting must still preserve the distinction between provider initiation and final billing outcome.

Next authorized secondary query:

`оберег по знаку зодиака`

Only one A1 request is authorized before normalization/review. No automatic A2/A3 continuation.