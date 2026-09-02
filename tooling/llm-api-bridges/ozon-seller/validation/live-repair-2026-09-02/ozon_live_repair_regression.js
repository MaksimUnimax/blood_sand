#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const OZON_ROOT = path.resolve(__dirname, "../..");
const DEFAULT_BASE = path.join(OZON_ROOT, "dist-step7-candidate", "shared");
const BASE = path.resolve(process.env.OZON_BRIDGE_BASE || DEFAULT_BASE);
const CAMPAIGN_ID = "37130644";
const TEST_DATE = "2026-09-01";

function loadRuntime() {
  for (const key of ["OzonRuntimeNames", "OzonOperationRegistry", "OzonEntitlements", "OzonContract", "OzonContractFactory", "OzonGuidance"]) {
    try { delete globalThis[key]; } catch (_) { /* isolated node process normally has no prior runtime */ }
  }
  for (const file of ["runtime_names.js", "ozon_operation_registry.js", "ozon_entitlements.js", "ozon_contract.js", "ozon_guidance.js"]) {
    const filePath = path.join(BASE, file);
    vm.runInThisContext(fs.readFileSync(filePath, "utf8"), { filename: filePath });
  }
  assert(globalThis.OzonContract, "OzonContract did not load");
  assert(globalThis.OzonEntitlements, "OzonEntitlements did not load");
  assert(globalThis.OzonOperationRegistry, "OzonOperationRegistry did not load");
}

function assertJsonTreeWithoutSharedReferences(root, label) {
  const seen = new WeakSet();
  const stack = [{ value: root, path: label }];
  while (stack.length) {
    const { value, path: currentPath } = stack.pop();
    if (!value || typeof value !== "object") continue;
    if (seen.has(value)) throw new Error(`${currentPath}: repeated object identity is not a JSON tree`);
    seen.add(value);
    if (Array.isArray(value)) {
      value.forEach((child, index) => stack.push({ value: child, path: `${currentPath}[${index}]` }));
    } else {
      Object.entries(value).forEach(([key, child]) => stack.push({ value: child, path: `${currentPath}.${key}` }));
    }
  }
  JSON.stringify(root);
}

function fixtureCampaignResult() {
  return {
    list: [
      {
        id: CAMPAIGN_ID,
        title: "Live repair fixture campaign",
        state: "CAMPAIGN_STATE_RUNNING",
        advObjectType: "SKU",
        fromDate: "2026-08-27",
        toDate: "",
        createdAt: "2026-08-27T01:33:28.548525Z",
        updatedAt: "2026-08-27T01:33:30.995496Z"
      }
    ],
    total: "1"
  };
}

function campaignCommand() {
  return {
    operation: "performance_campaigns",
    params: {
      campaignIds: [CAMPAIGN_ID],
      page: 1,
      pageSize: 100
    }
  };
}

function choicesFromSpecificCommand() {
  const C = globalThis.OzonContract;
  const normalized = C.normalizeCommand(campaignCommand());
  const result = C.sanitizeResult(normalized, fixtureCampaignResult());
  assert.deepStrictEqual(result.list.map((item) => String(item.id)), [CAMPAIGN_ID]);
  assert.strictEqual(result.bridge_view.hidden_pagination_requests, 0);
  assert.strictEqual(result.bridge_view.automatic_retry_requests, 0);
  assert.strictEqual(result.bridge_view.provider_page, 1);
  assert.strictEqual(result.bridge_view.provider_page_size, 100);
  assertJsonTreeWithoutSharedReferences(result, "performance_campaigns.result");
  return { normalized, result, choices: result.refinement_choices };
}

function instantiateRefinement(choice) {
  const source = choice.command || choice.template;
  assert(source, `refinement ${choice.id} has neither command nor template`);
  const command = JSON.parse(JSON.stringify(source));
  const stack = [command];
  while (stack.length) {
    const current = stack.pop();
    if (Array.isArray(current)) {
      for (let index = 0; index < current.length; index += 1) {
        if (current[index] === "CAMPAIGN_ID") current[index] = CAMPAIGN_ID;
        else if (current[index] === "YYYY-MM-DD") current[index] = TEST_DATE;
        else if (current[index] && typeof current[index] === "object") stack.push(current[index]);
      }
      continue;
    }
    for (const key of Object.keys(current || {})) {
      if (current[key] === "CAMPAIGN_ID") current[key] = CAMPAIGN_ID;
      else if (current[key] === "YYYY-MM-DD") current[key] = TEST_DATE;
      else if (current[key] && typeof current[key] === "object") stack.push(current[key]);
    }
  }
  return command;
}

function testSpecificCampaignIdsRepair() {
  const C = globalThis.OzonContract;
  const { choices } = choicesFromSpecificCommand();
  const expectedIds = [
    "next_page", "active_campaigns", "latest_created", "latest_updated",
    "specific_campaign_ids", "campaign_products", "campaign_product_statistics", "sku_statistics"
  ];
  assert.deepStrictEqual(choices.map((choice) => choice.id), expectedIds);

  const inheritedArrays = choices
    .filter((choice) => choice.command?.params?.campaignIds)
    .map((choice) => choice.command.params.campaignIds);
  assert.strictEqual(inheritedArrays.length, 4, "expected four generated commands that inherit campaignIds");
  assert.strictEqual(new Set(inheritedArrays).size, inheritedArrays.length, "each generated command must own a detached campaignIds array");
  for (const ids of inheritedArrays) assert.deepStrictEqual(ids, [CAMPAIGN_ID]);

  const specific = choices.find((choice) => choice.id === "specific_campaign_ids");
  const generated = instantiateRefinement(specific);
  const normalizedGenerated = C.normalizeCommand(generated);
  assert.deepStrictEqual(normalizedGenerated.params.campaignIds, [CAMPAIGN_ID]);
  assert.strictEqual(normalizedGenerated.params.page, 1);
  assert.strictEqual(normalizedGenerated.params.pageSize, 100);

  const request = C.buildPerformanceRequest(normalizedGenerated, { "Client-Id": "fixture", "Api-Key": "fixture" });
  assert.strictEqual(request.method, "GET");
  assert.strictEqual(request.host_alias, "performance_api");
  assert(request.url.includes(CAMPAIGN_ID), `campaign ID missing from request URL: ${request.url}`);

  const sanitized = C.sanitizeResult(normalizedGenerated, fixtureCampaignResult());
  assert.deepStrictEqual(sanitized.list.map((item) => String(item.id)), [CAMPAIGN_ID]);
  assertJsonTreeWithoutSharedReferences(sanitized, "specific_campaign_ids.sanitized_result");

  console.log("OZON_SPECIFIC_CAMPAIGN_IDS_REPAIR_PASS");
  return {
    marker: "OZON_SPECIFIC_CAMPAIGN_IDS_REPAIR_PASS",
    refinement_count: choices.length,
    detached_inherited_campaign_id_arrays: inheritedArrays.length,
    generated_request_method: request.method,
    generated_request_path: request.path
  };
}

function testAllGeneratedRefinements() {
  const C = globalThis.OzonContract;
  const { choices } = choicesFromSpecificCommand();
  assertJsonTreeWithoutSharedReferences(choices, "refinement_choices");

  const built = [];
  for (const choice of choices) {
    assertJsonTreeWithoutSharedReferences(choice, `refinement.${choice.id}`);
    const generated = instantiateRefinement(choice);
    assertJsonTreeWithoutSharedReferences(generated, `generated.${choice.id}`);
    const normalized = C.normalizeCommand(generated);
    const request = C.buildPerformanceRequest(normalized, { "Client-Id": "fixture", "Api-Key": "fixture" });
    assert.strictEqual(request.host_alias, "performance_api", `${choice.id}: wrong provider`);
    assert(["GET", "POST"].includes(request.method), `${choice.id}: unexpected method ${request.method}`);
    assert(!request.url.includes("local_sort"), `${choice.id}: local_sort leaked to provider URL`);
    assert(!request.url.includes("local_limit"), `${choice.id}: local_limit leaked to provider URL`);
    built.push({ id: choice.id, operation: normalized.operation, method: request.method, path: request.path });
  }

  assert.strictEqual(built.length, 8);
  assert.deepStrictEqual(built.map((item) => item.id), [
    "next_page", "active_campaigns", "latest_created", "latest_updated",
    "specific_campaign_ids", "campaign_products", "campaign_product_statistics", "sku_statistics"
  ]);
  assert.strictEqual(built.filter((item) => item.id === "specific_campaign_ids")[0].operation, "performance_campaigns");
  assert.strictEqual(built.filter((item) => item.id === "campaign_products")[0].operation, "performance_campaign_products");
  assert.strictEqual(built.filter((item) => item.id === "campaign_product_statistics")[0].operation, "performance_campaign_product");
  assert.strictEqual(built.filter((item) => item.id === "sku_statistics")[0].operation, "performance_sku_statistics");

  console.log("OZON_GENERATED_REFINEMENT_EXECUTABILITY_PASS");
  return {
    marker: "OZON_GENERATED_REFINEMENT_EXECUTABILITY_PASS",
    generated_command_count: built.length,
    generated_requests: built
  };
}

function assertThrowsCode(fn, expectedCode, label) {
  let thrown = null;
  try { fn(); } catch (error) { thrown = error; }
  assert(thrown, `${label}: expected an exception`);
  assert.strictEqual(thrown.code, expectedCode, `${label}: wrong error code (${thrown.code})`);
}

function assertAllAccountsEntitlement(command, expectedPath) {
  const C = globalThis.OzonContract;
  const E = globalThis.OzonEntitlements;
  const normalized = C.normalizeCommand(command);
  const requirement = E.requirementFor(normalized, null, Date.UTC(2026, 8, 2));
  assert.strictEqual(requirement.known, true, `${command.operation}: entitlement must be known`);
  assert.strictEqual(requirement.required, false, `${command.operation}: capability must not be required`);
  assert.strictEqual(requirement.default_access, "ALL_ACCOUNTS", `${command.operation}: wrong default access`);
  assert.strictEqual(requirement.entitlement_key, `POST ${expectedPath}`);

  const plan = C.planCommandForSellerCapability(normalized, null, Date.UTC(2026, 8, 2), null);
  assert.strictEqual(plan.action, "execute");
  assert.strictEqual(plan.planning.entitlement.status, "SUPPORTED_AND_ENTITLED");
  assert.strictEqual(plan.planning.entitlement.reason, "all_accounts");
  assert.strictEqual(plan.planning.entitlement.capability_required, false);
  assert.strictEqual(plan.planning.entitlement.exact_request_preserved, true);

  const request = C.buildRequest(normalized, { "Client-Id": "fixture", "Api-Key": "fixture" });
  assert.strictEqual(request.method, "POST");
  assert.strictEqual(request.path, expectedPath);
  assert.strictEqual(request.host_alias, "seller_api");
  return { normalized, requirement, plan, request };
}

function testDependentAttributeEntitlementsAndContract() {
  const C = globalThis.OzonContract;
  const first = assertAllAccountsEntitlement({
    operation: "description_category_dependent_attributes",
    params: { description_category_id: 87515080, type_id: 93733 }
  }, "/v1/description-category/dependent-attributes");
  const firstResult = C.sanitizeResult(first.normalized, {
    result: [{ parent_attribute_id: 8229, child_attribute_id: 23348 }]
  });
  assert.deepStrictEqual(firstResult.result, [{ parent_attribute_id: 8229, child_attribute_id: 23348 }]);

  const secondCommand = {
    operation: "description_category_dependent_attribute_values",
    params: {
      parent_attribute_id: 8229,
      child_attribute_id: 23348,
      description_category_id: 87515080,
      type_id: 93733,
      limit: 4,
      cursor: ""
    }
  };
  const second = assertAllAccountsEntitlement(secondCommand, "/v1/description-category/dependent-attributes/values");
  const requestBody = JSON.parse(second.request.body);
  assert.deepStrictEqual(requestBody, second.normalized.params);
  assert.strictEqual(requestBody.limit, 4);
  assert.strictEqual(requestBody.cursor, "");

  const providerFixture = {
    cursor: "eyJwYXJlbnRfdmFsdWVfaWQiOjEwMDIsImNoaWxkX2luZGV4IjowfQ==",
    result: [
      {
        parent_value_id: 1001,
        parent_value: "Лада",
        children: [
          { child_value_id: 2001, child_value: "Гранта" },
          { child_value_id: 2002, child_value: "Приора" }
        ]
      }
    ]
  };
  const secondResult = C.sanitizeResult(second.normalized, providerFixture);
  assert.deepStrictEqual(secondResult, providerFixture);
  assertJsonTreeWithoutSharedReferences(secondResult, "dependent_attribute_values.result");

  assertThrowsCode(() => C.normalizeCommand({
    operation: "description_category_dependent_attribute_values",
    params: { child_attribute_id: 23348 }
  }), "INVALID_OPERATION_PARAMS", "missing parent_attribute_id");
  assertThrowsCode(() => C.normalizeCommand({
    operation: "description_category_dependent_attribute_values",
    params: { parent_attribute_id: 8229 }
  }), "INVALID_OPERATION_PARAMS", "missing child_attribute_id");
  assertThrowsCode(() => C.normalizeCommand({
    operation: "description_category_dependent_attribute_values",
    params: { parent_attribute_id: 8229, child_attribute_id: 23348, limit: 0 }
  }), "OZON_LIMIT_VIOLATION", "limit below minimum");
  assertThrowsCode(() => C.normalizeCommand({
    operation: "description_category_dependent_attribute_values",
    params: { parent_attribute_id: 8229, child_attribute_id: 23348, limit: 1001 }
  }), "OZON_LIMIT_VIOLATION", "limit above maximum");

  console.log("OZON_DEPENDENT_ATTRIBUTE_ENTITLEMENTS_AND_CONTRACT_PASS");
  return {
    marker: "OZON_DEPENDENT_ATTRIBUTE_ENTITLEMENTS_AND_CONTRACT_PASS",
    operations: [
      {
        alias: first.normalized.operation,
        entitlement_key: first.requirement.entitlement_key,
        status: first.plan.planning.entitlement.status,
        path: first.request.path
      },
      {
        alias: second.normalized.operation,
        entitlement_key: second.requirement.entitlement_key,
        status: second.plan.planning.entitlement.status,
        path: second.request.path,
        cursor_preserved: secondResult.cursor === providerFixture.cursor,
        limit_bounds_verified: [1, 1000]
      }
    ]
  };
}

function writeEvidence(mode, details) {
  const out = process.env.OZON_REPAIR_EVIDENCE;
  if (!out) return;
  const payload = {
    schema: "OZON_CURRENT_SWAGGER_CLUSTER_AD_LIVE_REPAIR_REGRESSION_V1",
    date: "2026-09-02",
    mode,
    bridge_base: BASE,
    details
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

function main() {
  const mode = process.argv[2] || "full";
  if (!["specific", "refinements", "entitlements", "full"].includes(mode)) {
    throw new Error(`unsupported mode: ${mode}`);
  }
  loadRuntime();
  const details = {};
  if (mode === "specific" || mode === "full") details.specific = testSpecificCampaignIdsRepair();
  if (mode === "refinements" || mode === "full") details.refinements = testAllGeneratedRefinements();
  if (mode === "entitlements" || mode === "full") details.entitlements = testDependentAttributeEntitlementsAndContract();
  if (mode === "full") console.log("OZON_CURRENT_SWAGGER_CLUSTER_AD_LIVE_REPAIR_REGRESSION_PASS");
  writeEvidence(mode, details);
}

main();
