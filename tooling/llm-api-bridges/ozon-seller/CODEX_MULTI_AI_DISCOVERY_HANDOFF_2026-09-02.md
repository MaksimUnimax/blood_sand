# Codex handoff — Ozon Bridge Multi-AI Tier A browser discovery

Date: 2026-09-02  
Status: READY_FOR_BROWSER_DISCOVERY  
Repository: `MaksimUnimax/blood_sand`

## 1. Incident and correction

A previous Codex handoff incorrectly pointed at stale design commit `a6f12f171975eb7512273c4f6edb58876364263c`, where two required authority files did not yet exist. That handoff was invalid and must not be reused.

The missing authority files were subsequently published:

- `f6d1d7905fb3254d2d4897106c64af4e23d3c9b8` — publishes `OZON_MULTI_AI_EXPANSION_TZ_2026-09-02.md`;
- `828142b04937e563317647fdf2270bc01a9962a4` — publishes the self-contained `CODEX_MULTI_AI_DOM_DISCOVERY_PROMPT_2026-09-02.md`.

The immutable authority base for discovery is therefore:

`828142b04937e563317647fdf2270bc01a9962a4`

Do not use production commit `516ecf140538ad2838d39dcd01c7428efc1880d3`, stale design commit `a6f12f...`, or a locally cached branch state as the discovery authority.

## 2. Active authority files at the immutable base

All four files below exist at commit `828142b04937e563317647fdf2270bc01a9962a4`:

1. `tooling/llm-api-bridges/ozon-seller/OZON_MULTI_AI_EXPANSION_TZ_2026-09-02.md`
2. `tooling/llm-api-bridges/ozon-seller/CODEX_MULTI_AI_DOM_DISCOVERY_PROMPT_2026-09-02.md`
3. `tooling/llm-api-bridges/ozon-seller/OZON_MULTI_AI_AUTODETECT_MULTICHANNEL_PATCH_2026-09-02.md`
4. `tooling/llm-api-bridges/ozon-seller/CODEX_MULTI_AI_TIER_A_SCOPE_CORRECTION_2026-09-02.md`

The first three are the active authority set. The fourth records the already-applied scope correction and agrees with them.

## 3. Scope authority

The only active scope is:

- existing baseline: ChatGPT and Yandex Alice;
- Tier A: Claude, Google Gemini, DeepSeek, Qwen, Kimi, Grok, Mistral Vibe / Le Chat, Microsoft Copilot, Perplexity, Meta AI, GigaChat, Duck.ai, OpenRouter Chat, Poe, Proton Lumo and T3 Chat.

Tier B and Tier C are out of scope. Any older prompt or note requiring Tier B/C is superseded.

## 4. Exact Codex start procedure

From the repository checkout:

```bash
git fetch origin
git cat-file -e 828142b04937e563317647fdf2270bc01a9962a4^{commit}
git checkout -B research/ozon-multi-ai-tier-a-dom-2026-09-02 828142b04937e563317647fdf2270bc01a9962a4
```

Verify the authority files from the exact commit, not merely from a branch name:

```bash
for f in \
  tooling/llm-api-bridges/ozon-seller/OZON_MULTI_AI_EXPANSION_TZ_2026-09-02.md \
  tooling/llm-api-bridges/ozon-seller/CODEX_MULTI_AI_DOM_DISCOVERY_PROMPT_2026-09-02.md \
  tooling/llm-api-bridges/ozon-seller/OZON_MULTI_AI_AUTODETECT_MULTICHANNEL_PATCH_2026-09-02.md \
  tooling/llm-api-bridges/ozon-seller/CODEX_MULTI_AI_TIER_A_SCOPE_CORRECTION_2026-09-02.md
do
  git cat-file -e "828142b04937e563317647fdf2270bc01a9962a4:$f" || exit 1
done
```

Then read all four files and execute `CODEX_MULTI_AI_DOM_DISCOVERY_PROMPT_2026-09-02.md` in full.

## 5. Required first checkpoint

Before opening a provider page, create/update:

`tooling/llm-api-bridges/ozon-seller/research/multi-ai/PROGRESS.md`

Record:

- exact base commit `828142b04937e563317647fdf2270bc01a9962a4`;
- all four authority paths verified;
- active scope `baseline + Tier A only`;
- production files unchanged;
- next provider/test case.

After that checkpoint, begin browser discovery. Do not return the previous missing-document blocker unless one of the four `git cat-file` checks against the immutable commit actually fails.
