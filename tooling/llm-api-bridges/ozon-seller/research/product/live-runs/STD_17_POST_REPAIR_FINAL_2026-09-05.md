# STD-17 post-repair final

Date: 2026-09-05
Canonical question: `Какие кампании и товары сейчас больше всего съедают рекламный бюджет и где результат слабый?`

Status: `PASS`.

Result summary:
- CPC campaign and SKU waste was identified from live Performance data.
- strongest weak campaign signals include `37130638` (zero orders), `37130644` (DRR 114.1%), `37130631` (DRR 103.1%), `37130595` (DRR 95.7%), and `37130604` (DRR 63.4%);
- near-current SKU statistics provided concrete zero-order spend candidates;
- CPO campaign `10384311` is the largest spend line but is not waste: 7-day spend `17,834 RUB`, 106 orders, `178,340 RUB` attributed order money, aggregate DRR `10.0%`;
- current CPO product surface contains 74 SKU but does not expose per-SKU paid-order attribution, so no unsupported split of CPO spend was made.

Operational invariant: all successful benchmark reads preserved one logical business command -> one physical business request.

Checkpoint: `STD_17_PASS_STD_18_READY`
