"""Plain-text Telegram presentations; customer content is never parsed as markup."""

LIMIT = 4096


def _header(question):
    product = question.get("product_title") or question.get("product_article") or question.get("product_id")
    text = f"ID: {question['public_id']}\nMarketplace: {question['marketplace']}"
    if product:
        text += f"\nProduct: {product}"
    return text + f"\n\nВопрос покупателя:\n{question['question_text']}"


def split_card(question, body):
    """Return deterministic plain-text continuations without dropping content."""
    prefix = f"ID: {question['public_id']}\nMarketplace: {question['marketplace']}\n"
    text = _header(question) + ("\n\n" + body if body else "")
    if len(text) <= LIMIT:
        return [text]
    chunks = []
    room = LIMIT - len(prefix) - 28
    for offset in range(0, len(text), room):
        chunks.append(prefix + f"Continuation {offset // room + 1}:\n" + text[offset:offset + room])
    return chunks


def initial(question, profile):
    return split_card(question, f"🟢 Сейчас активен Codex: {profile}")


def review(question, revision, active_profile, generated_by=None):
    source = revision["source"] if hasattr(revision, "keys") else revision.get("source", "manual")
    answer = revision["text"] if hasattr(revision, "keys") else revision["text"]
    body = f"Ответ:\n{answer}\n\nИсточник: {source}"
    if generated_by:
        body += f"\n🤖 Подготовил: {generated_by}"
    body += f"\n🟢 Сейчас активен: {active_profile}"
    return split_card(question, body)


def running(question, profile):
    return split_card(question, f"🤖 Codex готовит черновик через {profile}. Ответ не публикуется автоматически.")


def codex_error(question, profile, error_type, message, active_profile):
    return split_card(question, f"⚠️ CODEX ERROR\nCodex: {profile}\nОшибка: {error_type}\n{message}\n\n🟢 Сейчас активен: {active_profile}")


def delivery(question, revision, state, detail=""):
    answer = revision["text"] if hasattr(revision, "keys") else revision["text"]
    return split_card(question, f"Ответ:\n{answer}\n\nДоставка: {state}" + (f"\n{detail}" if detail else ""))


# Compatibility for early tests/importers.
def card(q, answer=None, prepared=None, error=None):
    if error:
        return codex_error(q, prepared or "codex1", "PROCESS_ERROR", error, prepared or "codex1")
    if answer:
        return review(q, {"source": "codex" if prepared else "manual", "text": answer}, prepared or "codex1", prepared)
    return split_card(q, "")
