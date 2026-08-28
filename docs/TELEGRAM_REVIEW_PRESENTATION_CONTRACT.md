# Shared Telegram REVIEW presentation contract

This contract applies to **all marketplaces** and every publish mode.

`answer_revision.text` is the canonical customer answer authority. A successful
REVIEW is delivered as two separate projections: an operator projection with
question, marketplace, revision provenance/profile and local business-state
context, followed by a clean customer-answer message. The clean message text is
exactly the revision text: it has no prefix, suffix, label, delivery/state text,
or application metadata. Telegram's normal text selection/copy is the copy
mechanism; there is no `CopyTextButton` dependency.

New revisions, whether Codex-generated, manual, or edited, must contain 1 to
4096 characters because the clean customer answer is one normal Telegram text
message. Paragraphs and newlines are preserved exactly. Controls attach to the
clean answer message, never the operator projection.

Business actions can differ while presentation does not: Ozon `MANUAL_COPY`
offers Edit, Close, and Switch Codex, and never gains Send. Wildberries
`MARKETPLACE_API` retains Send, Edit, Ignore, and Switch Codex.

Historical revisions over 4096 characters are neither changed nor truncated.
They are losslessly projected as clean text chunks with no technical prefixes;
controls attach only to the final chunk.
