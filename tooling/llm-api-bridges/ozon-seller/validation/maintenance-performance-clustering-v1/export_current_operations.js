#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const extensionRoot = path.resolve(process.argv[2] || ".");
const outputPath = path.resolve(process.argv[3] || "OZON_CURRENT_OPERATIONS_EXPORT.json");
const installablePath = process.argv[4] ? path.resolve(process.argv[4]) : null;
const shared = path.join(extensionRoot, "shared");

for (const file of ["runtime_names.js", "ozon_operation_registry.js", "ozon_contract.js", "ozon_guidance.js"]) {
  const full = path.join(shared, file);
  if (!fs.existsSync(full)) throw new Error(`Missing production file: ${full}`);
  vm.runInThisContext(fs.readFileSync(full, "utf8"), { filename: full });
}

const Registry = globalThis.OzonOperationRegistry;
const Contract = globalThis.OzonContract;
if (!Registry || !Contract) throw new Error("Ozon registry/contract did not initialize.");

const jsonVariants = {
  performance_media: { authority_alias: "performance_media_csv", authority_path: "/api/client/statistics/campaign/media" },
  performance_campaign_product: { authority_alias: "performance_campaign_product_csv", authority_path: "/api/client/statistics/campaign/product" },
  performance_expense: { authority_alias: "performance_expense_csv", authority_path: "/api/client/statistics/expense" },
  performance_daily: { authority_alias: "performance_daily_csv", authority_path: "/api/client/statistics/daily" }
};

const operations = Object.entries(Registry.OPERATIONS).map(([alias, meta], index) => ({
  index: index + 1,
  alias,
  provider: meta.provider,
  method: meta.method,
  path: meta.path,
  effect: meta.effect,
  currentness: meta.currentness,
  execution_enabled: meta.execution_enabled === true,
  safety_class: meta.safety_class,
  privacy_policy: meta.privacy_policy,
  policy_group: meta.policy_group || null,
  default_allowed: meta.default_allowed ?? null,
  cluster: meta.cluster,
  section: meta.section,
  guidance_visibility: meta.guidance_visibility,
  workflow_role: meta.workflow_role,
  entitlement_key: meta.entitlement_key,
  response_style: meta.response_style || "json",
  response_content_types: meta.response_content_types || [],
  purpose: meta.purpose,
  template: meta.template,
  performance_authority_relation: jsonVariants[alias]
    ? { type: "documented_json_variant", ...jsonVariants[alias] }
    : null
}));

const clusterCounts = {};
for (const operation of operations) {
  clusterCounts[operation.cluster] ||= { operation_aliases: 0, sections: {} };
  clusterCounts[operation.cluster].operation_aliases += 1;
  clusterCounts[operation.cluster].sections[operation.section] = (clusterCounts[operation.cluster].sections[operation.section] || 0) + 1;
}

const sellerAliases = operations.filter((item) => item.provider === "seller_api").length;
const performanceAliases = operations.filter((item) => item.provider === "performance_api").length;
const source = { bridge_version: globalThis.OzonRuntime.RUNTIME.version };
if (installablePath && fs.existsSync(installablePath)) {
  source.installable_file = path.basename(installablePath);
  source.installable_sha256 = crypto.createHash("sha256").update(fs.readFileSync(installablePath)).digest("hex");
}

const payload = {
  schema: "OZON_CURRENT_OPERATIONS_EXPORT_V1",
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source,
  counts: {
    command_aliases_total: operations.length,
    seller_command_aliases: sellerAliases,
    performance_command_aliases: performanceAliases,
    current_authority_endpoint_reads_total: 266,
    seller_authority_endpoint_reads: 245,
    performance_authority_endpoint_reads: 21,
    performance_documented_json_variant_aliases: 4
  },
  note: "270 executable aliases represent 266 accepted authority endpoint reads because four Performance JSON-suffix aliases are documented variants and do not inflate the 48-operation Performance authority universe.",
  performance_documented_json_variants: jsonVariants,
  cluster_definitions: Registry.CLUSTERS,
  cluster_aliases: Registry.CLUSTER_ALIASES,
  cluster_counts: clusterCounts,
  registry_contract_validation: Registry.catalogValidation(Contract.OPERATIONS),
  operations
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
const digest = crypto.createHash("sha256").update(fs.readFileSync(outputPath)).digest("hex");
console.log(`WROTE ${outputPath}`);
console.log(`COMMAND_ALIASES ${operations.length}`);
console.log(`SELLER_ALIASES ${sellerAliases}`);
console.log(`PERFORMANCE_ALIASES ${performanceAliases}`);
console.log(`CATALOG_VALID ${payload.registry_contract_validation.ok}`);
console.log(`SHA256 ${digest}`);
