from pathlib import Path

root = Path('.')
entitlements = root / 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/ozon_entitlements.js'
provider = root / 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/ozon_provider.js'
taxonomy_gate = root / 'tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_provider_taxonomy_gate.mjs'
defect_doc = root / 'tooling/llm-api-bridges/ozon-seller/research/product/OZON_AI_WORKER_REPAIRED_26_READS_LIVE_DEFECT_014_2026-09-04.md'
closure_doc = root / 'tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/DEFECT_014_DEPENDENCY_CLOSURE_2026-09-04.md'


def replace_once(path, old, new):
    text = path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected exactly one match, got {count}')
    path.write_text(text.replace(old, new, 1), encoding='utf-8', newline='\n')


replace_once(
    entitlements,
    '''  function requirementFor(command, snapshot = null, atMs = Date.now()) {\n    const registryMeta = globalThis.OzonOperationRegistry?.operation?.(command?.operation) || null;\n    if (!registryMeta || registryMeta.provider === "performance_api") return deepFreeze({ required: false, known: true, allowed_subscription_types: [], reasons: [], rule_source: "not_seller_or_missing" });\n    const active = normalizeSnapshot(snapshot);''',
    '''  function requirementFor(command, snapshot = null, atMs = Date.now()) {\n    const registryMeta = globalThis.OzonOperationRegistry?.operation?.(command?.operation) || null;\n    if (!registryMeta) return deepFreeze({ required: false, known: true, allowed_subscription_types: [], reasons: [], rule_source: "not_seller_or_missing" });\n    const provider = String(registryMeta.provider || "seller_api");\n    if (provider === "performance_api" || provider === "report_file") return deepFreeze({ required: false, known: true, allowed_subscription_types: [], reasons: [], rule_source: "not_seller_or_missing" });\n    if (provider !== "seller_api") return deepFreeze({ required: false, known: false, allowed_subscription_types: [], reasons: ["unknown_provider"], rule_source: "unknown_provider" });\n    const active = normalizeSnapshot(snapshot);'''
)

replace_once(
    provider,
    '''      const preflight = contract.preflightExecution(command);\n      const provider = String(preflight.meta.provider || "seller_api");\n      const execution = provider === "report_file"\n        ? await executeReportFileCommand(command)\n        : (provider === "performance_api"\n          ? await executePerformanceCommand(command, rawPerformanceCredentials)\n          : await executeSellerCommand(command, rawCredentials));\n      const { request, response } = execution;''',
    '''      const preflight = contract.preflightExecution(command);\n      const provider = String(preflight.meta.provider || "seller_api");\n      let execution;\n      if (provider === "report_file") execution = await executeReportFileCommand(command);\n      else if (provider === "performance_api") execution = await executePerformanceCommand(command, rawPerformanceCredentials);\n      else if (provider === "seller_api") execution = await executeSellerCommand(command, rawCredentials);\n      else {\n        const error = new Error(`Неизвестный provider ${provider}; выполнение запрещено.`);\n        error.code = "INVALID_PROVIDER_DISPATCH";\n        error.external_request_executed = false;\n        throw error;\n      }\n      const { request, response } = execution;'''
)

replace_once(
    taxonomy_gate,
    '''const C = globalThis.OzonContract;\nconst R = globalThis.OzonOperationRegistry;\nassert.ok(C && R);''',
    '''const C = globalThis.OzonContract;\nconst R = globalThis.OzonOperationRegistry;\nconst E = globalThis.OzonEntitlements;\nassert.ok(C && R && E);'''
)

replace_once(
    taxonomy_gate,
    '''const reportRequirement = C.sellerCapabilityRequirement(reportCommand);\nassert.equal(reportRequirement.required, false);\nassert.equal(reportRequirement.known, true);\nconst reportPlan = C.planCommandForSellerCapability(reportCommand, { status: "unknown", subscription_type: "UNKNOWN" });''',
    '''const reportRequirement = C.sellerCapabilityRequirement(reportCommand);\nassert.equal(reportRequirement.required, false);\nassert.equal(reportRequirement.known, true);\nconst directReportEntitlement = E.requirementFor(reportCommand);\nassert.equal(directReportEntitlement.required, false);\nassert.equal(directReportEntitlement.known, true);\nassert.equal(directReportEntitlement.rule_source, "not_seller_or_missing");\nassert.deepEqual(directReportEntitlement.reasons, []);\nconst reportPlan = C.planCommandForSellerCapability(reportCommand, { status: "unknown", subscription_type: "UNKNOWN" });'''
)

replace_once(
    taxonomy_gate,
    '''const performanceCommand = { operation: "performance_campaigns", params: {} };\nconst performancePlan = C.planCommandForSellerCapability(performanceCommand, { status: "unknown", subscription_type: "UNKNOWN" });\nassert.equal(performancePlan.action, "execute");\nassert.equal(performancePlan.planning.entitlement.reason, "performance_provider_not_seller_subscription");''',
    '''const performanceCommand = { operation: "performance_campaigns", params: {} };\nconst directPerformanceEntitlement = E.requirementFor(performanceCommand);\nassert.equal(directPerformanceEntitlement.required, false);\nassert.equal(directPerformanceEntitlement.known, true);\nassert.equal(directPerformanceEntitlement.rule_source, "not_seller_or_missing");\nconst performancePlan = C.planCommandForSellerCapability(performanceCommand, { status: "unknown", subscription_type: "UNKNOWN" });\nassert.equal(performancePlan.action, "execute");\nassert.equal(performancePlan.planning.entitlement.reason, "performance_provider_not_seller_subscription");'''
)

replace_once(
    taxonomy_gate,
    '''assert.throws(() => globalThis.OzonContractFactory.createOzonContract({\n  operations: {\n    future_provider_probe: {\n      ...reportMeta,\n      provider: "future_provider"\n    }\n  }\n}), (error) => error?.code === "INVALID_REGISTRY_PROVIDER");\n\nconsole.log("OZON_PROVIDER_TAXONOMY_EXHAUSTIVE_PASS");''',
    '''assert.throws(() => globalThis.OzonContractFactory.createOzonContract({\n  operations: {\n    future_provider_probe: {\n      ...reportMeta,\n      provider: "future_provider"\n    }\n  }\n}), (error) => error?.code === "INVALID_REGISTRY_PROVIDER");\n\nconst realRegistry = globalThis.OzonOperationRegistry;\nglobalThis.OzonOperationRegistry = Object.freeze({ operation: () => ({ provider: "future_provider", method: "GET", path: "/future" }) });\nconst unknownEntitlement = E.requirementFor({ operation: "future_provider_probe", params: {} });\nassert.equal(unknownEntitlement.known, false);\nassert.deepEqual(unknownEntitlement.reasons, ["unknown_provider"]);\nglobalThis.OzonOperationRegistry = realRegistry;\n\nload("ozon_credentials.js");\nglobalThis.ProviderTransportCore = Object.freeze({});\nload("ozon_provider.js");\nconst fakeContract = Object.freeze({\n  normalizeCommand: (command) => command,\n  preflightExecution: () => ({ meta: { provider: "future_provider" } })\n});\nconst fakeProvider = globalThis.OzonProviderFactory.createOzonProvider({ contract: fakeContract, fetchImpl: async () => { throw new Error("network must not execute"); }, uuid: () => "aaaaaaaaaaaa", now: () => 1 });\nawait assert.rejects(\n  fakeProvider.executeCommandObject({ operation: "future_provider_probe", params: {} }, {}, {}),\n  (error) => error?.code === "INVALID_PROVIDER_DISPATCH" && error?.external_request_executed === false\n);\n\nconst providerSource = fs.readFileSync(path.join(shared, "ozon_provider.js"), "utf8");\nassert.match(providerSource, /else if \(provider === "seller_api"\)/);\nassert.match(providerSource, /INVALID_PROVIDER_DISPATCH/);\nconst serviceWorkerSource = fs.readFileSync(path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "service_worker.js"), "utf8");\nassert.match(serviceWorkerSource, /if \(String\(preflight\.meta\.provider \|\| "seller_api"\) !== "seller_api"\) \{\s*return Object\.freeze\(\{ required: false, allowed: true, quota: null \}\);/);\n\nconsole.log("OZON_PROVIDER_TAXONOMY_EXHAUSTIVE_PASS");'''
)

replace_once(
    taxonomy_gate,
    '''console.log("OZON_REPORT_FILE_ENTITLEMENT_REASON_PASS");\nconsole.log("OZON_PROVIDER_BUILDER_ERROR_CLASSIFICATION_PASS");\nconsole.log("OZON_PROVIDER_UNKNOWN_FAIL_CLOSED_PASS");''',
    '''console.log("OZON_REPORT_FILE_ENTITLEMENT_REASON_PASS");\nconsole.log("OZON_NON_SELLER_DIRECT_ENTITLEMENT_CLASSIFICATION_PASS");\nconsole.log("OZON_PROVIDER_BUILDER_ERROR_CLASSIFICATION_PASS");\nconsole.log("OZON_PROVIDER_EXECUTION_DISPATCH_EXHAUSTIVE_PASS");\nconsole.log("OZON_PROVIDER_UNKNOWN_FAIL_CLOSED_PASS");'''
)

replace_once(
    defect_doc,
    '''The repair removes binary/catch-all assumptions from provider-sensitive contract paths:\n\n- planning metadata;\n- Seller request-builder rejection;\n- Performance request-builder rejection;\n- binary response-style validation.\n\nSeller capability probing and Seller quota bypass remain intentionally shared for all non-Seller providers because neither Performance nor report-file execution uses Seller subscription probing or Seller analytics quota state. Provider execution dispatch already distinguishes all three providers explicitly and is unchanged.''',
    '''The repair removes binary/catch-all assumptions from all provider-sensitive paths found in the packaged runtime:\n\n- planning metadata;\n- Seller request-builder rejection;\n- Performance request-builder rejection;\n- binary response-style validation;\n- direct entitlement classification;\n- provider execution dispatch.\n\nSeller capability probing and Seller quota bypass remain intentionally shared for all non-Seller providers because neither Performance nor report-file execution uses Seller subscription probing or Seller analytics quota state. Unknown provider categories now fail honest/closed instead of falling into Seller execution.'''
)

replace_once(
    defect_doc,
    '''- unknown/future provider fails closed;\n- report-file workflow gate checks planning metadata as part of the full output contract;''',
    '''- direct entitlement classification explicitly recognizes both non-Seller providers;\n- provider execution dispatch explicitly recognizes all three providers;\n- unknown/future provider fails closed before any network request;\n- report-file workflow gate checks planning metadata as part of the full output contract;'''
)

replace_once(
    closure_doc,
    '''7. provider execution dispatch in `ozon_provider.js`;\n8. Seller quota bypass for non-Seller providers in `service_worker.js`;''',
    '''7. direct entitlement classification in `ozon_entitlements.js`;\n8. provider execution dispatch in `ozon_provider.js`;\n9. Seller quota bypass for non-Seller providers in `service_worker.js`;'''
)

replace_once(
    closure_doc,
    '''9. credential selection / isolation;\n10. report-file provenance and personal-data policy;\n11. report-file trusted-host transport and parsing;\n12. user-visible planning/execution metadata;\n13. report-file workflow tests and the package effect-repair gate.''',
    '''10. credential selection / isolation;\n11. report-file provenance and personal-data policy;\n12. report-file trusted-host transport and parsing;\n13. user-visible planning/execution metadata;\n14. report-file workflow tests and the package effect-repair gate.'''
)

replace_once(
    closure_doc,
    '''Executable change is limited to `dist-step7-candidate/shared/ozon_contract.js`:''',
    '''Executable changes are limited to `dist-step7-candidate/shared/ozon_contract.js`, `shared/ozon_entitlements.js`, and `shared/ozon_provider.js`:'''
)

replace_once(
    closure_doc,
    '''- unknown provider categories fail closed;\n- wrong request-builder errors identify the actual provider;\n- binary response-style validation no longer treats every non-Seller provider as Performance.\n\n`ozon_provider.js`, `service_worker.js`, credentials, transport, storage, manifest, report parser, personal-data policy, and Ozon request schemas are not changed by DEFECT-014.''',
    '''- direct entitlement lookup explicitly treats both `performance_api` and `report_file` as non-Seller;\n- provider execution dispatch explicitly handles all three categories;\n- unknown provider categories fail closed before network execution;\n- wrong request-builder errors identify the actual provider;\n- binary response-style validation no longer treats every non-Seller provider as Performance.\n\n`service_worker.js`, credentials, transport, storage, manifest, report parser, personal-data policy, and Ozon request schemas are not changed by DEFECT-014.'''
)

replace_once(
    closure_doc,
    '''`run_provider_taxonomy_gate.mjs` proves all three provider categories explicitly, checks report-file/Performance/Seller planning independently, checks builder isolation, and rejects an unknown future provider.''',
    '''`run_provider_taxonomy_gate.mjs` proves all three provider categories explicitly, checks direct entitlement lookup and report-file/Performance/Seller planning independently, checks builder isolation, proves explicit provider execution dispatch, proves unknown provider zero-network fail-closed behavior, and records the intentional non-Seller Seller-quota bypass.'''
)
