import fs from "node:fs";
import vm from "node:vm";

const root = process.argv[2];
if (!root) throw new Error("usage: node GUIDANCE_CORE_REGRESSION_2026-08-21.mjs <extension-root>");
const context = vm.createContext({ console, crypto: globalThis.crypto });
for (const rel of ["shared/runtime_names.js", "shared/ozon_contract.js", "shared/ozon_guidance.js"]) vm.runInContext(fs.readFileSync(`${root}/${rel}`, "utf8"), context, { filename: rel });
const { OzonContract: contract, OzonGuidance: guidance } = context;
const assert = (value, message) => { if (!value) throw new Error(message); };

const catalog = guidance.catalogValidation(contract);
assert(catalog.ok, JSON.stringify(catalog));
console.log("GUIDANCE_CATALOG_COVERS_ENABLED_OPERATIONS_PASS");
assert(!catalog.offered.includes("posting_fbs_get"), "PII operation offered");
console.log("GUIDANCE_BLOCKED_OPERATIONS_NEVER_OFFERED_PASS");
for (const card of Object.values(guidance.CARDS)) contract.normalizeCommand(card.template);
const alice = guidance.classify(guidance.descriptorFromObject({ method: "performance/v2/order", params: { date_from: "2026-08-10", date_to: "2026-08-17" } }, "UNKNOWN_TOP_LEVEL_FIELD"));
assert(alice.status === "cluster_identified" && alice.cluster === "sales_analytics", JSON.stringify(alice));
console.log("GUIDANCE_ALICE_SALES_ATTEMPT_CLASSIFIED_PASS");
const ambiguous = guidance.classify(guidance.descriptorFromObject({ operation: "get_data", params: {} }, "INVALID_OPERATION"));
assert(ambiguous.status === "cluster_required", JSON.stringify(ambiguous));
console.log("GUIDANCE_AMBIGUOUS_ATTEMPT_RETURNS_CLUSTERS_PASS");
for (const cluster of Object.keys(guidance.CLUSTERS)) {
  const parsed = guidance.parseHelp(`OZON_HELP_V1\n${JSON.stringify({ cluster })}`);
  assert(parsed.ok && parsed.cluster === cluster, cluster);
  const result = guidance.result({ status: "cluster_selected", cluster });
  assert(result.external_request_executed === false && result.physical_business_request_count === 0, cluster);
  assert(result.choices.every((card) => guidance.CLUSTERS[cluster].operations.includes(card.operation)), cluster);
}
console.log("GUIDANCE_CLUSTER_SELECTION_RETURNS_ONLY_CLUSTER_COMMANDS_PASS");
assert(!guidance.parseHelp('OZON_HELP_V1 {"cluster":"sales_analytics","x":1}').ok, "extra help field accepted");
assert(!guidance.parseHelp('OZON_HELP_V1 {"cluster":"sales_analytics"}\nOZON_HELP_V1 {"cluster":"sales_analytics"}').ok, "multiple markers accepted");
const blocked = guidance.classify(guidance.descriptorFromObject({ operation: "posting_fbs_get", params: {} }, "OPERATION_BLOCKED"));
assert(blocked.status === "unsupported_or_blocked", JSON.stringify(blocked));
const secret = guidance.descriptorFromObject({ operation: "x", params: { authorization: "never-retained" } }, "TRANSPORT_INJECTION_REJECTED");
assert(secret.sensitive && !JSON.stringify(secret).includes("never-retained"), "secret retained");
console.log("GUIDANCE_ZERO_PROVIDER_CALLS_PASS");
const valid = contract.parseCommand('OZON_API_V1 {"operation":"roles","params":{}}');
assert(valid.operation === "roles", "valid command regression");
console.log("GUIDANCE_VALID_COMMAND_REGRESSION_PASS");
console.log("GUIDANCE_CORE_REGRESSION_PASS");
