from __future__ import annotations
def present(result: dict) -> str:
    date=result['birth_date']['display']; ch=result['chertog']['name']; label=result['recommendation']['customer_label']
    gender='Мужчине' if result['gender']=='male' else 'Женщине'
    return f"Дата {date} относится к Чертогу {ch}. Этот Чертог связывают с силой, внутренней опорой и защитой близких.\n\n{gender} рекомендуем оберег «{label}». Его смысл хорошо соответствует темам этого Чертога.\n\nЧтобы начать новый подбор, напишите: Подобрать снова"
DATE_PROMPT="Укажите день и месяц рождения, например 13.10."
DATE_CORRECTION="Не удалось распознать дату. Укажите день и месяц, например 13.10."
GENDER_PROMPT="Для кого подбираем оберег? Напишите: Мужчине или Женщине."
