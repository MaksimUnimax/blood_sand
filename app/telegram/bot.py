"""Telegram edge: authenticate, correlate and acknowledge; SQLite is authoritative."""
import asyncio

from telegram import ForceReply, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup

from app.copy_contract import CUSTOMER_ANSWER_TEXT_LIMIT
from telegram.ext import CallbackQueryHandler, CommandHandler, MessageHandler, filters

from app.state_machine import StaleState
from app.telegram.callbacks import decode, encode
from app.telegram import render
from app.telegram.edge import TelegramEdge, Operation, Outcome


OZON_BUTTON = '➕ Отправить вопрос'
CHECK_QUESTIONS_BUTTON = '🔎 Проверить вопросы'


class OperatorBot:
    def __init__(self, operator_user_id, service):
        self.operator_user_id = str(operator_user_id)
        self.service = service
        self.edge = TelegramEdge()

    async def _telegram(self, operation, call):
        result = await self.edge.mutate(operation, call)
        if result.outcome is not Outcome.SUCCESS:
            await self.service.repo.record_error('telegram', result.outcome.value, str(result.error))
        return result

    async def _ack(self, query, *args, **kwargs):
        return await self._telegram(Operation.CALLBACK_ACK, lambda: query.answer(*args, **kwargs))

    async def _standalone_send(self, message, text, reply_markup=None, **kwargs):
        """Create an operator message without Telegram reply semantics."""
        if isinstance(reply_markup, ForceReply):
            raise ValueError('ForceReply is not permitted for operator messages')
        if kwargs.get('reply_parameters') is not None or kwargs.get('reply_to_message_id') is not None:
            raise ValueError('reply parameters are not permitted for operator messages')
        return await self._telegram(
            Operation.MESSAGE_CREATE,
            lambda: message.get_bot().send_message(
                chat_id=message.chat_id, text=text, reply_markup=reply_markup, **kwargs
            ),
        )

    async def _reply(self, message, text, reply_markup=None, **kwargs):
        return await self._standalone_send(message, text, reply_markup=reply_markup, **kwargs)

    @staticmethod
    def main_menu():
        return ReplyKeyboardMarkup(
            [[OZON_BUTTON], [CHECK_QUESTIONS_BUTTON]],
            resize_keyboard=True,
            is_persistent=True,
            one_time_keyboard=False,
        )

    def authorized(self, update):
        user = update.effective_user
        chat = update.effective_chat
        return bool(
            user and chat
            and str(user.id) == self.operator_user_id
            and str(chat.id) == self.operator_user_id
            and getattr(chat, 'type', None) == 'private'
        )

    async def _denied(self, u):
        if self.authorized(u):
            return False
        if getattr(u, 'callback_query', None):
            await self._ack(u.callback_query, 'Access denied', show_alert=True)
        return True

    def buttons(self, q, state=None, revision=None):
        state = state or q['status']
        qid = q['id']
        rid = q['current_answer_revision_id']
        switch = InlineKeyboardButton(
            '🤖 Сменить Codex', callback_data=encode('choose_codex', qid, rid, 'menu')
        )
        if state == 'NEW':
            rows = [
                [InlineKeyboardButton('✍️ Ответить самому', callback_data=encode('manual', qid)),
                 InlineKeyboardButton('🤖 Отправить в Codex', callback_data=encode('codex', qid))],
                [InlineKeyboardButton('🚫 Игнорировать', callback_data=encode('ignore', qid))],
                [switch],
            ]
        elif state == 'REVIEW' and q['publish_mode'] == 'MANUAL_COPY':
            rows = [
                [InlineKeyboardButton('✏️ Редактировать', callback_data=encode('edit', qid, rid)),
                 InlineKeyboardButton('✅ Закрыть', callback_data=encode('close', qid, rid))],
                [switch],
            ]
        elif state == 'REVIEW':
            rows = [
                [InlineKeyboardButton('✅ Отправить', callback_data=encode('send', qid, rid)),
                 InlineKeyboardButton('✏️ Редактировать', callback_data=encode('edit', qid, rid))],
                [InlineKeyboardButton('🚫 Игнорировать', callback_data=encode('ignore', qid, rid))],
                [switch],
            ]
        elif state == 'CODEX_ERROR':
            rows = [
                [InlineKeyboardButton('🔄 Повторить', callback_data=encode('retry_codex', qid))],
                [InlineKeyboardButton('✍️ Ответить самому', callback_data=encode('manual', qid)),
                 InlineKeyboardButton('🚫 Игнорировать', callback_data=encode('ignore', qid))],
                [switch],
            ]
        elif state == 'SEND_FAILED':
            rows = [[InlineKeyboardButton('🔄 Повторить отправку', callback_data=encode('retry_send', qid, rid))], [switch]]
        elif state == 'SEND_UNKNOWN':
            rows = [[switch]]
        else:
            rows = [[switch]]
        return InlineKeyboardMarkup(rows)

    def profile_buttons(self, q, active):
        return InlineKeyboardMarkup([
            [InlineKeyboardButton(
                f'{p}{" ✓" if p == active else ""}',
                callback_data=encode('choose_codex', q['id'], q['current_answer_revision_id'], p),
            )]
            for p in ('codex1', 'codex2', 'codex3')
        ])

    async def review_presentation(self, q):
        rev = await self.service.repo.get_current_answer_revision(q['id'])
        attempt = await self.service.repo.get_draft_attempt(rev['draft_attempt_id']) if rev and rev['draft_attempt_id'] else None
        return (
            render.review_projection(q, rev, await self.service.repo.active_codex_profile(), attempt['codex_profile'] if attempt else None),
            render.customer_answer(rev), rev,
        )

    async def deliver_review(self, message, q):
        projection, customer_chunks, revision = await self.review_presentation(q)
        for text in projection:
            outcome = await self._reply(message, text)
            if outcome.outcome is not Outcome.SUCCESS:
                await self.service.repo.record_error('telegram', 'REVIEW_PROJECTION_DELIVERY', str(outcome.error))
                return False
        for i, text in enumerate(customer_chunks):
            outcome = await self._reply(message, text, reply_markup=self.buttons(q, revision=revision) if i == len(customer_chunks) - 1 else None)
            if outcome.outcome is not Outcome.SUCCESS:
                await self.service.repo.record_error('telegram', 'REVIEW_PROJECTION_DELIVERY', str(outcome.error))
                return False
        return True

    async def show_question(self, message, qid, force_initial=False):
        q = await self.service.repo.get_question(qid)
        revision = None
        active = await self.service.repo.active_codex_profile()
        if q['status'] == 'NEW':
            cards = render.initial(q, active)
        elif q['status'] == 'CODEX_RUNNING':
            attempt = await self.service.repo.get_current_draft_attempt(qid)
            cards = render.running(q, attempt['codex_profile'])
        elif q['status'] == 'CODEX_ERROR':
            attempt = await self.service.repo.get_current_draft_attempt(qid)
            cards = render.codex_error(q, attempt['codex_profile'], attempt['error_type'], attempt['error_message'], active)
        elif q['status'] == 'CLOSED':
            cards = render.closed(q)
        elif q['current_answer_revision_id']:
            revision = await self.service.repo.get_current_answer_revision(qid)
            cards = (
                render.delivery(q, revision, q['status'])
                if q['status'] in {'SENDING', 'SENT', 'SEND_FAILED', 'SEND_UNKNOWN', 'ANSWERED_EXTERNALLY'}
                else None
            )
        else:
            cards = render.split_card(q, f'Состояние: {q["status"]}\n🟢 Сейчас активен: {active}')
        if q['status'] == 'REVIEW':
            await self.deliver_review(message, q)
        elif q['status'] == 'NEW' and force_initial:
            first = None
            for i, text in enumerate(cards):
                outcome = await self._reply(message, text, reply_markup=self.buttons(q) if i == 0 else None)
                if outcome.outcome is not Outcome.SUCCESS:
                    await self.service.repo.record_delivery_failure(qid, 'INITIAL_CARD', outcome.outcome.value, str(outcome.error))
                    return False
                if first is None:
                    first = outcome.value.message_id
            await self.service.repo.persist_question_message_id(qid, first)
            await self.service.repo.clear_delivery_failure(qid, 'INITIAL_CARD')
            return True
        else:
            await self.cards(message, cards, self.buttons(q, revision=revision), qid,
                             operation='CODEX_RUNNING_CARD' if q['status'] == 'CODEX_RUNNING' else 'STATUS_CARD')

    async def cards(self, message, cards, markup=None, qid=None, operation='STATUS_CARD'):
        for i, text in enumerate(cards):
            outcome = await self._reply(message, text, reply_markup=markup if i == 0 else None)
            if qid and outcome.outcome is not Outcome.SUCCESS:
                if operation in {'INITIAL_CARD', 'MANUAL_PROMPT', 'EDIT_PROMPT', 'CODEX_RUNNING_CARD'}:
                    await self.service.repo.record_delivery_failure(qid, operation, outcome.outcome.value, str(outcome.error))
                return False
        if qid and operation in {'INITIAL_CARD', 'MANUAL_PROMPT', 'EDIT_PROMPT', 'CODEX_RUNNING_CARD'}:
            await self.service.repo.clear_delivery_failure(qid, operation)
        return True

    async def begin_ozon(self, u, c=None):
        if await self._denied(u):
            return
        try:
            await self.service.begin_ozon_question()
        except StaleState:
            await self._reply(u.message, 'Сначала завершите текущий ввод ответа или вопроса.', reply_markup=self.main_menu())
            return
        await self._reply(
            u.message,
            'Вставьте следующим обычным сообщением вопрос покупателя с Ozon. После отправки Codex запустится автоматически.',
            reply_markup=self.main_menu(),
        )

    async def check_questions(self, u, c=None):
        if await self._denied(u):
            return
        try:
            questions = await self.service.check_wildberries_unanswered()
        except Exception:
            await self._reply(u.message, 'Проверка вопросов WB не удалась.', reply_markup=self.main_menu())
            return
        if not questions:
            await self._reply(u.message, 'Неотвеченных вопросов WB нет.', reply_markup=self.main_menu())
            return
        for question in questions:
            await self.show_question(u.message, question['id'], force_initial=True)

    async def command(self, u, c):
        if await self._denied(u):
            return
        cmd = u.message.text.split()[0]
        if cmd == '/start':
            await self._reply(
                u.message,
                'Готов. Для нового вопроса используйте «➕ Отправить вопрос».',
                reply_markup=self.main_menu(),
            )
        elif cmd == '/status':
            await self._reply(
                u.message,
                f"Open questions: {len(await self.service.repo.list_open_questions())}\n"
                f"Active Codex: {await self.service.repo.active_codex_profile()}",
                reply_markup=self.main_menu(),
            )
        elif cmd == '/ozon':
            await self.begin_ozon(u, c)
        elif cmd == '/codex':
            active = await self.service.repo.active_codex_profile()
            await self._reply(u.message, f'🤖 CODEX\nАктивен: {active}\nСмените профиль из меню конкретного вопроса.', reply_markup=self.main_menu())
        elif cmd == '/questions':
            await self.check_questions(u, c)
        elif cmd == '/errors':
            rows = await self.service.repo.recent_errors()
            await self._reply(
                u.message,
                '\n'.join(f"{x['component']}: {x['error_type']} ({x['occurrence_count']})" for x in rows) or 'No recent errors',
                reply_markup=self.main_menu(),
            )
        elif cmd == '/recover' and len(u.message.text.split()) in {2, 3}:
            q = await self.service.repo.get_question_by_public_id(u.message.text.split()[1])
            if not q:
                await self._reply(u.message, 'Unknown question')
                return
            if await self.service.repo.get_delivery_failure(q['id'], 'INITIAL_CARD'):
                if len(u.message.text.split()) != 3 or u.message.text.split()[2] != 'DUPLICATE_RISK_ACKNOWLEDGED':
                    await self._reply(u.message, 'Confirm duplicate risk: /recover Q-ID DUPLICATE_RISK_ACKNOWLEDGED')
                    return
                if await self.service.recover_initial_card(q['id']):
                    await self._reply(u.message, 'Initial card resent and delivery confirmed.')
                else:
                    await self._reply(u.message, 'Initial resend was not confirmed.')
            elif q['status'] in {'REVIEW', 'CODEX_ERROR'}:
                await self.show_codex(u.message, q['id'])
            else:
                await self._reply(u.message, 'No recoverable card for this question state.')
        else:
            await self._reply(u.message, 'Unknown command', reply_markup=self.main_menu())

    async def prompt(self, message, q, mode, revision_id=None):
        based_on_revision_id = revision_id if mode == 'edit_answer' else None
        if await self.service.repo.get_telegram_input_for_context(q['id'], mode, based_on_revision_id):
            return
        current = await self.service.repo.get_current_answer_revision(q['id'])
        extra = f"\n\nТекущий ответ:\n{current['text']}" if mode == 'edit_answer' and current else ''
        if mode == 'edit_answer' and (not current or current['id'] != revision_id):
            raise StaleState('STALE_STATE')
        text = (
            'Введите ответ' if mode == 'manual_answer'
            else f"ID: {q['public_id']}\nMarketplace: {q['marketplace']}\n\nВопрос:\n{q['question_text']}{extra}\n\nВведите новый ответ"
        )
        outcome = await self._reply(message, text, reply_markup=self.buttons(q))
        operation = 'EDIT_PROMPT' if mode == 'edit_answer' else 'MANUAL_PROMPT'
        if outcome.outcome is not Outcome.SUCCESS:
            await self.service.repo.record_delivery_failure(q['id'], operation, outcome.outcome.value, str(outcome.error))
            return False
        sent = outcome.value
        if not isinstance(sent.message_id, int) or sent.message_id <= 0:
            await self.service.repo.record_error('telegram', 'INVALID_MESSAGE_ID', 'prompt did not return positive message_id')
            await self.service.repo.record_delivery_failure(q['id'], operation, 'INVALID_MESSAGE_ID', 'prompt did not return positive message_id')
            return False
        await self.service.repo.create_telegram_input(
            sent.message_id, q['id'], mode, revision_id if mode == 'edit_answer' else None
        )
        await self.service.repo.clear_delivery_failure(q['id'], operation)
        return True

    async def show_codex(self, message, qid):
        q = await self.service.repo.get_question(qid)
        if q['status'] == 'REVIEW':
            await self.deliver_review(message, q)
        elif q['status'] == 'CODEX_ERROR':
            active = await self.service.repo.active_codex_profile()
            attempt = await self.service.repo.get_current_draft_attempt(qid)
            await self.cards(
                message,
                render.codex_error(q, attempt['codex_profile'], attempt['error_type'], attempt['error_message'], active),
                self.buttons(q), qid,
            )

    async def run_codex(self, message, qid, claim):
        try:
            await self.service.codex(qid, claim=claim)
        except Exception:
            pass
        await self.show_codex(message, qid)

    async def _disable(self, query):
        await self._telegram(Operation.UI_EDIT, lambda: query.message.edit_reply_markup(reply_markup=None))

    async def callback(self, u, c):
        query = u.callback_query
        if await self._denied(u):
            return
        try:
            x = decode(query.data)
        except ValueError:
            await self._ack(query, 'Invalid action', show_alert=True)
            return
        action, qid, rid = x['action'], x['question_id'], x['revision_id']
        try:
            if action == 'choose_codex':
                if not qid:
                    raise StaleState('STALE_STATE')
                q = await self.service.repo.get_question(qid)
                if not q:
                    raise StaleState('STALE_STATE')
                if ((rid is None and q['current_answer_revision_id'] is not None)
                        or (rid is not None and q['current_answer_revision_id'] != rid)):
                    raise StaleState('STALE_STATE')
                if x['arg'] == 'menu':
                    active = await self.service.repo.active_codex_profile()
                    await self._ack(query)
                    await self._reply(
                        query.message, f'🤖 СМЕНИТЬ CODEX\n\nСейчас: {active}',
                        reply_markup=self.profile_buttons(q, active),
                    )
                    return
                if x['arg'] not in {'codex1', 'codex2', 'codex3'}:
                    raise StaleState('STALE_STATE')
                await self.service.repo.set_active_codex_profile(x['arg'])
                await self._ack(query)
                if q['status'] == 'CODEX_ERROR':
                    old = (await self.service.repo.get_current_draft_attempt(qid))['codex_profile']
                    markup = InlineKeyboardMarkup([
                        [InlineKeyboardButton('🔄 Перегенерировать', callback_data=encode('confirm_regenerate', qid))],
                        [InlineKeyboardButton('✍️ Ответить самому', callback_data=encode('manual', qid)),
                         InlineKeyboardButton('🚫 Игнорировать', callback_data=encode('ignore', qid))],
                        [InlineKeyboardButton('🤖 Сменить Codex', callback_data=encode('choose_codex', qid, q['current_answer_revision_id'], 'menu'))],
                    ])
                    await self._reply(query.message, f'🤖 Codex изменён: {old} → {x["arg"]}', reply_markup=markup)
                else:
                    await self.show_question(query.message, qid)
                return

            if not qid:
                raise StaleState('STALE_STATE')
            q = await self.service.repo.get_question(qid)
            if not q:
                raise StaleState('STALE_STATE')

            if action in {'codex', 'retry_codex', 'confirm_regenerate'}:
                claim = await self.service.repo.claim_codex(qid)
                await self._ack(query, 'Codex started')
                await self._disable(query)
                await self.show_question(query.message, qid)
                asyncio.create_task(self.run_codex(query.message, qid, claim))
                return

            if action == 'manual':
                await self.service.begin_manual(qid)
                await self._ack(query)
                created = await self.prompt(
                    query.message, await self.service.repo.get_question(qid), 'manual_answer'
                )
                if created:
                    await self._disable(query)
            elif action == 'edit':
                q = await self.service.begin_edit(qid, rid)
                await self._ack(query)
                created = await self.prompt(query.message, q, 'edit_answer', rid)
                if created:
                    await self._disable(query)
            elif action == 'ignore':
                if rid is not None and (q['status'] != 'REVIEW' or q['current_answer_revision_id'] != rid):
                    raise StaleState('STALE_STATE')
                await self.service.ignore(qid)
                await self._ack(query, 'Ignored')
                await self._disable(query)
            elif action == 'close':
                await self.service.close_manual_copy(qid, rid)
                await self._ack(query, 'Closed')
                await self._disable(query)
                await self.show_question(query.message, qid)
            elif action == 'send':
                claim = await self.service.claim_send(qid, rid)
                await self._ack(query)
                outcome = await self.service.execute_send(qid, claim)
                current = await self.service.repo.get_question(qid)
                rev = await self.service.repo.get_answer_revision(rid)
                await self.cards(query.message, render.delivery(current, rev, outcome), self.buttons(current))
                await self._disable(query)
            elif action == 'retry_send':
                claim = await self.service.claim_retry_send(qid, rid)
                await self._ack(query)
                outcome = await self.service.execute_send(qid, claim)
                current = await self.service.repo.get_question(qid)
                rev = await self.service.repo.get_answer_revision(rid)
                await self.cards(query.message, render.delivery(current, rev, outcome), self.buttons(current))
                await self._disable(query)
            else:
                raise StaleState('STALE_STATE')
        except (StaleState, ValueError):
            await self._ack(query, 'This action is stale', show_alert=True)
        except Exception as exc:
            await self.service.repo.record_error('telegram', 'CALLBACK_ERROR', str(exc))
            await self._ack(query, 'Action failed', show_alert=True)

    async def ordinary_text(self, u, c):
        if await self._denied(u):
            return
        try:
            operator_text = getattr(self.service, 'operator_text', None)
            if operator_text is not None:
                result = await operator_text(u.message.text, u.update_id)
            else:
                rid = await self.service.ordinary_text(u.message.text)
                result = None if rid is None else {'kind': 'revision', 'revision_id': rid}
        except StaleState:
            return
        except ValueError as exc:
            if str(exc) == 'CUSTOMER_ANSWER_TEXT_TOO_LONG':
                await self._reply(u.message, f'Ответ покупателю должен быть не длиннее {CUSTOMER_ANSWER_TEXT_LIMIT} символов.')
                return
            raise
        if result is None:
            return
        if result['kind'] == 'revision':
            rev = await self.service.repo.get_answer_revision(result['revision_id'])
            q = await self.service.repo.get_question(rev['question_id'])
            await self.deliver_review(u.message, q)
            return
        qid = result['question_id']
        claim = result.get('claim')
        if claim:
            await self.show_question(u.message, qid)
            asyncio.create_task(self.run_codex(u.message, qid, claim))
        else:
            await self.show_question(u.message, qid)

    async def _tracked(self, method, update, context):
        await method(update, context)
        await self.service.repo.complete_telegram_update(getattr(update, 'update_id', None))

    async def ignored_message(self, u, c):
        return None

    def handlers(self):
        return [
            CommandHandler(
                ['start', 'questions', 'codex', 'errors', 'status', 'ozon', 'recover'],
                lambda u, c: self._tracked(self.command, u, c),
            ),
            CallbackQueryHandler(lambda u, c: self._tracked(self.callback, u, c)),
            MessageHandler(
                filters.TEXT & ~filters.COMMAND & filters.Regex(r'^➕ Отправить вопрос$'),
                lambda u, c: self._tracked(self.begin_ozon, u, c),
            ),
            MessageHandler(
                filters.TEXT & ~filters.COMMAND & filters.Regex(r'^🔎 Проверить вопросы$'),
                lambda u, c: self._tracked(self.check_questions, u, c),
            ),
            MessageHandler(
                filters.TEXT & ~filters.COMMAND,
                lambda u, c: self._tracked(self.ordinary_text, u, c),
            ),
            MessageHandler(filters.ALL, lambda u, c: self._tracked(self.ignored_message, u, c)),
        ]
