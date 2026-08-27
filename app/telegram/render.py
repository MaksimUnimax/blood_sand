LIMIT=4096
def card(q,answer=None,prepared=None,error=None):
 s=f'ID: {q["public_id"]}\nMarketplace: {q["marketplace"]}\n\nВопрос покупателя:\n{q["question_text"]}'
 if answer: s+=f'\n\nОтвет Codex:\n{answer}' if prepared else f'\n\nОтвет:\n{answer}'
 if prepared: s+=f'\n🤖 Подготовил: {prepared}'
 if error: s+=f'\n\n⚠️ CODEX ERROR\nОшибка: {error}'
 return [f'ID: {q["public_id"]}\n'+s[i:i+4050] for i in range(0,len(s),4050)]
