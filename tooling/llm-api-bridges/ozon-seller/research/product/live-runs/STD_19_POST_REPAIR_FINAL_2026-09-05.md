# STD-19 post-repair final

Date: 2026-09-05
Canonical question: `На какие товары я трачу рекламу, хотя карточка плохо заполнена, невидима или имеет ограничения?`

Result: PASS.

- Current advertised contour: 74 SKU from STD-17.
- Current `INVISIBLE` products: 0 (fresh STD-14 evidence).
- Current delivery-invalid warehouses/products: 0 (fresh STD-14/15 evidence).
- `VALIDATION_STATE_FAIL` filter returned 2 advertised SKU: `2184199958` (Мара) and `2184932293` (Даждьбог).
- Follow-up product-info read proved both are currently sellable: moderation approved, validation success, status `Продается`, availability `AVAILABLE`, stock present. Their issue is a failed/unapplied update (`status_failed=imported`, `status_description=Не обновлен`), not current invisibility or sale blocking; exact import-history cause is not exposed by the current Bridge read surface.
- `product_content_rating` for the full advertised 74-SKU set returned uniform rating `87.5/100`: media `100`, text `50`, other attributes `100`. Common gap: Rich content is absent; images/video and >70% attributes are present. This is a systematic optimization reserve, not evidence of isolated badly filled cards.

Classification: `PASS_WITH_TWO_ADVERTISED_FAILED_UPDATE_WARNINGS_AND_UNIFORM_RICH_CONTENT_GAP`.
Operational: PASS, one logical command -> one physical request on each run.

Checkpoint: `STD_19_PASS_STD_20_READY`.
