# Ozon Bridge reference 0.1.8

Immutable evidence snapshot for Ozon Bridge v0.1.8.

Release purpose: scan a complete assistant message for multiple `OZON_API_V1` commands, execute their provider requests strictly sequentially with durable no-replay recovery, collect all results without intermediate ChatGPT delivery, and perform one final combined delivery using a size-independent Send/Microphone watcher.

Key invariants:

- command discovery is structural and formatting-independent;
- one discovered valid `OZON_API_V1` command performs at most one external Ozon request;
- provider concurrency for a batch is exactly one;
- malformed items become local pre-execution results and do not erase later valid markers;
- no intermediate result is inserted into ChatGPT;
- completed provider requests are never replayed by collection or delivery recovery;
- an unknown in-flight provider outcome after worker restart fails closed with `REQUEST_OUTCOME_UNKNOWN_NO_RETRY`;
- final report insertion occurs once, then batch delivery never verifies composer/report contents;
- final delivery polls only current control state every 2 seconds after an initial blind 2-second wait;
- only an active strictly recognized Send is clicked; disabled Send, Stop, Unknown and Microphone are never clicked;
- Microphone is the sole final success marker and is never clicked;
- temporary batch/results state is cleared after confirmed final delivery or explicit stop;
- no historical batch store, new batch ID hierarchy, hidden provider retry, hidden pagination/fan-out, mutation, new host permission or credential exposure was introduced.

Evidence:

- `OZON_BRIDGE_V0.1.8_CHANGELOG_AND_TEST_EVIDENCE.md`
- `OZON_BRIDGE_V0.1.8_REPRODUCIBLE_EVIDENCE.md`
- `OZON_BRIDGE_V0.1.8_PATCH.diff.gz.b64`

Release ZIP SHA-256:

`79b750b2d16b0f765af674181ea41894681aa778db27e11fb87760960912a5fa`

Automated acceptance evidence: source 174/174 PASS; fresh ZIP extraction 174/174 PASS; exactly 16 production files; all production JS parses; Chromium 144 `--pack-extension` exit 0; deterministic ZIP rebuild byte-identical.

The Chrome Extension Lab connector was unavailable in this session and the local headless CDP target list did not expose an MV3 service-worker target. Therefore this reference does not claim a logged-in live ChatGPT field run. Installation/live continuation acceptance remains pending.
