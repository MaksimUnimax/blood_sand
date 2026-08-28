import asyncio

from app.state_machine import StaleState


class QuestionService:
    def __init__(self, repo, adapters, transport, runner=None, prompts=None):
        self.repo = repo
        self.adapters = adapters
        self.transport = transport
        self.runner = runner
        self.prompts = prompts
        self.busy = set()

    async def poll(self, name):
        if name in self.busy:
            return False
        self.busy.add(name)
        try:
            for raw in await self.adapters[name].fetch_unanswered_questions():
                q, new = await self.repo.insert_question(raw)
                if new:
                    mid = await self.transport.question(q)
                    if mid:
                        await self.repo.persist_question_message_id(q['id'], mid)
                        await self.repo.clear_delivery_failure(q['id'], 'INITIAL_CARD')
            return True
        finally:
            self.busy.discard(name)

    async def recover_initial_card(self, qid):
        q = await self.repo.get_question(qid)
        if not q or not await self.repo.get_delivery_failure(qid, 'INITIAL_CARD'):
            raise StaleState('STALE_STATE')
        mid = await self.transport.question(q)
        if mid:
            await self.repo.persist_question_message_id(qid, mid)
            await self.repo.clear_delivery_failure(qid, 'INITIAL_CARD')
        return bool(mid)

    async def manual(self, qid, prompt_id=None):
        return await self.begin_manual(qid)

    async def begin_manual(self, qid):
        return await self.repo.start_manual_input(qid)

    async def edit(self, qid, prompt_id=None, expected_revision_id=None):
        return await self.begin_edit(qid, expected_revision_id)

    async def begin_edit(self, qid, expected_revision_id):
        return await self.repo.start_edit_input(qid, expected_revision_id)

    async def begin_ozon_question(self):
        return await self.repo.start_ozon_question_input()

    async def ordinary_text(self, text):
        """Compatibility path for existing question-bound manual/edit input."""
        return await self.repo.consume_active_text(text)

    async def operator_text(self, text, update_id):
        """Route ordinary operator text deterministically; never infer its purpose."""
        rid = await self.repo.consume_active_text(text)
        if rid is not None:
            return {'kind': 'revision', 'revision_id': rid}

        q, created = await self.repo.consume_ozon_question_input(update_id, text)
        if q is None:
            return None

        # Telegram update replay is keyed by external_question_id=telegram:<update_id>.
        # Only a still-NEW row may claim a Codex attempt; replay observes the
        # persisted state and must not create a second attempt.
        if q['status'] == 'NEW':
            claim = await self.repo.claim_codex(q['id'])
            return {'kind': 'ozon_question', 'question_id': q['id'], 'claim': claim, 'created': created}
        return {'kind': 'ozon_question', 'question_id': q['id'], 'claim': None, 'created': False}

    async def ignore(self, qid):
        await self.repo.ignore_question(qid)

    async def close_manual_copy(self, qid, rid):
        await self.repo.close_manual_copy_question(qid, rid)

    async def send(self, qid, rid):
        return await self.execute_send(qid, await self.claim_send(qid, rid))

    async def claim_send(self, qid, rid):
        return await self.repo.claim_send(qid, rid)

    async def claim_retry_send(self, qid, rid):
        q = await self.repo.get_question(qid)
        if q['publish_mode'] != 'MARKETPLACE_API':
            raise StaleState('STALE_STATE')
        if q['status'] == 'SEND_FAILED':
            await self.repo.transition(qid, 'SEND_FAILED', 'REVIEW')
        elif q['status'] == 'SEND_UNKNOWN':
            await self.repo.transition(qid, 'SEND_UNKNOWN', 'REVIEW')
        else:
            raise StaleState('STALE_STATE')
        return await self.repo.claim_send(qid, rid)

    async def execute_send(self, qid, rev):
        q = await self.repo.get_question(qid)
        # Defense in depth: MANUAL_COPY can never reach a marketplace adapter,
        # even if a stale/forged callback bypassed the renderer.
        if not q or q['publish_mode'] != 'MARKETPLACE_API' or q['marketplace'] not in self.adapters:
            raise StaleState('STALE_STATE')
        result = await self.adapters[q['marketplace']].send_answer(q, rev['text'])
        if result['status'] == 'SUCCESS':
            await self.repo.mark_sent(qid, result.get('answer_id'))
            return 'SENT'
        if result['status'] == 'CLEAR_FAILURE':
            await self.repo.mark_send_failed(qid)
            return 'SEND_FAILED'
        await self.repo.mark_send_unknown(qid)
        outcome = await self.adapters[q['marketplace']].reconcile_answer(q, rev['text'], None)
        if outcome == 'MATCHED':
            await self.repo.transition(
                qid, 'SEND_UNKNOWN', 'SENT',
                {'sent_at': __import__('app.db.repository', fromlist=['now']).now()},
            )
            return 'SENT'
        return 'SEND_UNKNOWN' if outcome == 'UNKNOWN' else 'NOT_FOUND'

    async def retry_send(self, qid, rid):
        return await self.execute_send(qid, await self.claim_retry_send(qid, rid))

    async def codex(self, qid, expected_revision_id=None, claim=None):
        aid, profile = claim or await self.repo.claim_codex(qid, expected_revision_id)
        q = await self.repo.get_question(qid)
        try:
            text = await self.runner.run(profile, self.prompts.build(q), str(aid))
            current = await self.repo.get_question(qid)
            if current['current_draft_attempt_id'] != aid or current['status'] != 'CODEX_RUNNING':
                return None
            await self.repo.finish_draft_success(aid, text)
            rid = await self.repo.create_answer_revision(qid, 'codex', text, draft_attempt_id=aid)
            await self.repo.set_current_answer_revision(qid, rid)
            await self.repo.transition(qid, 'CODEX_RUNNING', 'REVIEW')
            return rid
        except Exception as e:
            current = await self.repo.get_question(qid)
            if current['current_draft_attempt_id'] == aid and current['status'] == 'CODEX_RUNNING':
                await self.repo.finish_draft_error(aid, getattr(e, 'kind', 'PROCESS_ERROR'), str(e))
                await self.repo.transition(qid, 'CODEX_RUNNING', 'CODEX_ERROR')
            raise

    async def poll_all(self):
        names = tuple(self.adapters)
        results = await asyncio.gather(*(self.poll(n) for n in names), return_exceptions=True)
        return dict(zip(names, results))
