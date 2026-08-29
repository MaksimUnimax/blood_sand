from __future__ import annotations
import json
from pathlib import Path

_COPY = json.loads((Path(__file__).parents[1] / "data" / "reason_copy.v2.json").read_text(encoding="utf-8"))
_BY_REASON = {record["reason_code"]: record for record in _COPY["records"]}
def present(result: dict) -> str:
    date=result['birth_date']['display']; ch=result['chertog']['name']; label=result['recommendation']['customer_label']
    record = _BY_REASON[result['recommendation']['reason_code']]
    themes = ", ".join(record['themes'])
    recommendation = record['recommendation_template'].format(customer_label=label)
    why = record['why_it_fits_template'].format(customer_label=label)
    return f"Дата {date} относится к Чертогу {ch}. Этот Чертог связывают с {themes}.\n\n{recommendation} {why}\n\nЧтобы начать новый подбор, используйте кнопку ниже."
DATE_PROMPT="Введите дату рождения в формате ДД.ММ.ГГГГ."
DATE_CORRECTION="Не удалось распознать дату. Введите дату рождения в формате ДД.ММ.ГГГГ."
GENDER_PROMPT="Для кого подбираем оберег?"
