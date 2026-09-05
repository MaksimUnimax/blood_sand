# STD-18 post-repair final

Date: 2026-09-05
Canonical question: `Какие товары я сейчас рекламирую, хотя они заканчиваются или уже отсутствуют на нужных складах?`

Status: `PASS`.

Current advertising-to-stock join found:
- `12` advertised SKU with aggregate FBO `present=0` while FBS stock remains available;
- another `14` advertised SKU with only `1-3` aggregate FBO units;
- warehouse-level FBO pagination was completed to `has_next=false`, confirming the zero-FBO set is zero across all returned FBO warehouse rows and the low-FBO set is concentrated on very few warehouses.

Interpretation: this is a real current FBO availability/replenishment risk, not proof that the products are completely out of stock across all fulfillment channels.

Checkpoint:
`STD_18_PASS_ADVERTISED_SKUS_WITH_ZERO_OR_CRITICALLY_LOW_FBO_CONFIRMED_STD_19_READY`
