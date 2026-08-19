# Ozon Bridge — RERUN16 CFT inventory evidence correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_CORRECTION`

Production, candidate, dependencies and browser behavior are unchanged.

RERUN16 report `ec7dbd70642a43cb958534bcf4ee855faf59f4bb` observed 308 source-CFT files but an aggregate SHA-256 `804a1b53827196c89cb7e4f6a251d82d727d845744aacd00c65e5630c7049faa` instead of canonical `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`. It did not publish the exact inventory implementation or any per-file difference list. Therefore the aggregate mismatch alone is insufficient to classify source byte drift.

Canonical algorithm remains exactly commit `36b20ff0c84b791f3418b1f51c23e52e571c8ef3` / preflight6:
1. `fs.readdirSync(dir).sort()` recursively;
2. `lstatSync`, regular files only;
3. POSIX-normalized relative path;
4. record exactly `{path,size,sha256}`;
5. final `a.path.localeCompare(b.path)` sort;
6. `JSON.stringify(record)` per record;
7. LF join plus one final LF;
8. SHA-256 UTF-8 text.
Expected count 308 and digest `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`.

Any future integrated runner must record both canonical count/digest and the exact canonical records when the digest mismatches. It must not stop on aggregate mismatch without attempting a per-file explanation.

For diagnosis in the same integrated run only, it may also execute the historical RERUN8 algorithm from forensic `60acc40aa484087f4c408d03611597625f2dab33`; this control digest cannot qualify the environment.

If the canonical source digest mismatches, the runner must read-only scan the existing QA root for another CFT `151.0.7922.47` `chrome-win64` tree. A replacement validation source is acceptable only if it independently has exactly 308 files and canonical digest `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`. Do not modify, repair, overwrite or delete the mismatching source tree.

If a pristine byte-identical authority tree is found, use a fresh validation-owned copy of that tree and continue the same consolidated gate. Record its absolute source path and prove the expected canonical digest before setup.

If no pristine authority tree exists, report the canonical current records and concrete differing-path evidence available from any known-good authority comparison; if no per-file baseline is available, classify `ENVIRONMENT_CFT_AUTHORITY_DRIFT_UNRESOLVED` rather than claiming specific byte drift.

No separate operator-visible preflight is required. This correction is intended to be embedded in the next single consolidated full-gate execution.