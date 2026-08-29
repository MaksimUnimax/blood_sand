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

    async def check_wildberries_unanswered(self):
        """Provider-authoritative WB scan used only by the operator recovery path."""
        adapter = self.adapters.get('wildberries')
        if adapter is None:
            raise RuntimeError('Wildberries question check is unavailable')
        try:
            rows = await adapter.fetch_unanswered_questions()
        except Exception as exc:
            await self.repo.record_error('wildberries', 'MANUAL_QUESTION_CHECK', str(exc))
            raise
        questions = []
        for raw in rows:
            question, _new = await self.repo.insert_question(raw)
            # INSERT OR IGNORE leaves SQLite in an implicit transaction when
            # the identity already exists; finish that read before the bounded
            # reconciliation transaction below.
            await self.repo.db.commit()
            questions.append(await self.repo.recover_provider_unanswered(question['id']))
        return questions

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
        return await self.repo.consume_active_text(text)

    async def operator_text(self, text, update_id):
        """Route ordinary operator text deterministically; never infer its purpose."""
        rid = await self.repo.consume_active_text(text)
        if rid is not None:
            return {'kind': 'revision', 'revision_id': rid}

        q, created = await self.repo.consume_ozon_question_input(update_id, text)
        if q is None:
            return None
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
        else:
            raise StaleState('STALE_STATE')
        return await self.repo.claim_send(qid, rid)

    async def execute_send(self, qid, rev):
        q = await self.repo.get_question(qid)
        if not q or q['publish_mode'] != 'MARKETPLACE_API' or q['marketplace'] not in self.adapters:
            raise StaleState('STALE_STATE')
        adapter = self.adapters[q['marketplace']]
        inspect = getattr(adapter, 'inspect_answer', None)
        # WB must never overwrite an existing public answer.  The durable
        # SENDING claim exists before this guard, so exactly one operator claim
        # has one possible PATCH.
        if inspect is not None:
            preflight = await inspect(q, rev['text'])
            if preflight == 'MATCHED':
                await self.repo.mark_sent(qid, None)
                return 'SENT'
            if preflight == 'DIFFERENT':
                await self.repo.mark_answered_externally(qid)
                return 'ANSWERED_EXTERNALLY'
            if preflight == 'UNKNOWN':
                await self.repo.mark_send_failed(qid)
                return 'SEND_FAILED'
            if preflight != 'ABSENT':
                await self.repo.mark_send_failed(qid)
                return 'SEND_FAILED'
        result = await adapter.send_answer(q, rev['text'])
        if result['status'] == 'SUCCESS':  # legacy non-WB adapter compatibility
            await self.repo.mark_sent(qid, result.get('answer_id'))
            return 'SENT'
        if result['status'] == 'CLEAR_FAILURE':
            await self.repo.mark_send_failed(qid)
            return 'SEND_FAILED'
        # Both accepted-but-unverified and ambiguous writes require readback.
        await self.repo.mark_send_unknown(qid)
        outcome = await inspect(q, rev['text']) if inspect is not None else 'UNKNOWN'
        if outcome == 'MATCHED':
            await self.repo.transition(
                qid, 'SEND_UNKNOWN', 'SENT',
                {'sent_at': __import__('app.db.repository', fromlist=['now']).now()},
            )
            return 'SENT'
        if outcome == 'DIFFERENT':
            await self.repo.mark_answered_externally(qid, 'SEND_UNKNOWN')
            return 'ANSWERED_EXTERNALLY'
        return 'SEND_UNKNOWN'

    async def retry_send(self, qid, rid):
        return await self.execute_send(qid, await self.claim_retry_send(qid, rid))

    async def codex(self, qid, expected_revision_id=None, claim=None):
        aid, profile = claim or await self.repo.claim_codex(qid, expected_revision_id)
        q = await self.repo.get_question(qid)
        try:
            text = await self.runner.run(profile, self.prompts.build(q), str(aid))
            validator = getattr(self.prompts, 'validate_output', None)
            if validator is not None:
                text = validator(q, text)
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
