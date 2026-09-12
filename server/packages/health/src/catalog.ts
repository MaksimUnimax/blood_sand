import {
  BaselineContourKeySchema,
  type BaselineContourKey,
  HealthContourDefinitionSchema,
  HealthSuiteDefinitionSchema,
  type HealthContourDefinition,
  type HealthSuiteDefinition,
} from "./types.js";
export const BASELINE_CONTOUR_KEYS = BaselineContourKeySchema.options;

const BASELINE_SCOPE = {
  adapterFamilyId: "00000000-0000-4000-8000-000000000001",
  adapterFamilyKey: "fixture-ai",
  surfaceId: "00000000-0000-4000-8000-000000000002",
  surfaceKey: "contract",
  variant: null,
  browserFamily: "chrome",
  browserVersion: "120.0.0.0",
  extensionVersion: "1.0.0",
  adapterEngineVersion: "1.0.0",
  profile: {
    id: "00000000-0000-4000-8000-000000000003",
    revision: 1,
  },
  healthSuite: {
    machineKey: "baseline-contract-fixture",
    revision: 1,
  },
} as const;

type ContourSpec = {
  key: BaselineContourKey;
  purpose: string;
  required?: boolean;
  requiredForVariantIds?: string[];
  failureSeverity?: "CORE" | "IMPORTANT_NON_CORE";
  absencePolicy?:
    | { mode: "FORBIDDEN" }
    | { mode: "ALLOWED_FOR_SCOPE" }
    | { mode: "ALLOWED_FOR_VARIANTS"; variantIds: string[] };
  primaryStrategyId: HealthContourDefinition["primaryStrategyId"];
  fallbackStrategyIds: HealthContourDefinition["fallbackStrategyIds"];
  structuralAssertionIds: HealthContourDefinition["structuralAssertionIds"];
  behavioralAssertionIds: HealthContourDefinition["behavioralAssertionIds"];
  expectedTransitionIds: HealthContourDefinition["expectedTransitionIds"];
  safeEvidenceRuleIds: HealthContourDefinition["safeEvidenceRuleIds"];
  timeoutMs?: number;
  knownAcceptableVariantIds?: string[];
};

function defineContour(spec: ContourSpec): HealthContourDefinition {
  return HealthContourDefinitionSchema.parse({
    required: true,
    requiredForVariantIds: [],
    failureSeverity: "CORE",
    absencePolicy: { mode: "FORBIDDEN" },
    timeoutMs: 5_000,
    knownAcceptableVariantIds: ["baseline-contract"],
    ...spec,
  });
}

export const BASELINE_CONTOUR_CATALOG: readonly HealthContourDefinition[] = [
  defineContour({
    key: "C01_PAGE_IDENTITY",
    purpose: "Proves the expected packaged product surface is present.",
    primaryStrategyId: "PAGE_HOST_MARKER",
    fallbackStrategyIds: ["SURFACE_MARKER"],
    structuralAssertionIds: ["PAGE_PRESENT", "SURFACE_MATCH"],
    behavioralAssertionIds: ["ENVIRONMENT_PRECONDITION"],
    expectedTransitionIds: ["BLOCKING_DETECTED"],
    safeEvidenceRuleIds: ["SAFE_ELEMENT_METADATA"],
  }),
  defineContour({
    key: "C02_CONVERSATION_ROOT",
    purpose:
      "Finds the active conversation boundary for safe message ownership.",
    primaryStrategyId: "CONVERSATION_ANCHOR",
    fallbackStrategyIds: ["ACTIVE_CONVERSATION_REGION"],
    structuralAssertionIds: ["UNIQUE_ACTIVE_TARGET", "VISIBLE"],
    behavioralAssertionIds: ["CONVERSATION_ID_STABLE"],
    expectedTransitionIds: ["PROMPT_TO_ASSISTANT"],
    safeEvidenceRuleIds: ["SAFE_ELEMENT_METADATA", "BOUNDED_DOM_FRAGMENT"],
  }),
  defineContour({
    key: "C03_COMPOSER_ROOT",
    purpose:
      "Finds the active composer container without relying on live selectors.",
    primaryStrategyId: "COMPOSER_CONTAINER",
    fallbackStrategyIds: ["ACTIVE_COMPOSER_REGION"],
    structuralAssertionIds: ["UNIQUE_ACTIVE_TARGET", "VISIBLE"],
    behavioralAssertionIds: ["CONVERSATION_ID_STABLE"],
    expectedTransitionIds: ["PROMPT_TO_ASSISTANT"],
    safeEvidenceRuleIds: ["SAFE_ELEMENT_METADATA"],
  }),
  defineContour({
    key: "C04_COMPOSER_INPUT",
    purpose:
      "Finds the editable input target and proves safe test insertion semantics.",
    primaryStrategyId: "EDITABLE_INPUT",
    fallbackStrategyIds: ["ACCESSIBILITY_TEXTBOX"],
    structuralAssertionIds: ["EDITABLE", "VISIBLE"],
    behavioralAssertionIds: ["INSERT_READBACK"],
    expectedTransitionIds: ["PROMPT_TO_ASSISTANT"],
    safeEvidenceRuleIds: ["SAFE_ELEMENT_METADATA"],
  }),
  defineContour({
    key: "C05_SEND_CONTROL",
    purpose:
      "Finds the packaged send action associated with the active composer.",
    primaryStrategyId: "SEMANTIC_SEND_CONTROL",
    fallbackStrategyIds: ["COMPOSER_ACTION_CONTROL"],
    structuralAssertionIds: ["ACTIONABLE", "UNIQUE_ACTIVE_TARGET"],
    behavioralAssertionIds: ["SEND_TRANSITION"],
    expectedTransitionIds: ["SEND_TO_BUSY"],
    safeEvidenceRuleIds: ["SAFE_ELEMENT_METADATA", "STATE_TRANSITION_TRACE"],
  }),
  defineContour({
    key: "C06_BUSY_STOP_STATE",
    purpose: "Observes the bounded generating/busy state transition.",
    primaryStrategyId: "BUSY_INDICATOR",
    fallbackStrategyIds: ["RESPONSE_STATE_MARKER"],
    structuralAssertionIds: ["VISIBLE"],
    behavioralAssertionIds: ["BUSY_TRANSITION"],
    expectedTransitionIds: ["SEND_TO_BUSY", "BUSY_TO_IDLE"],
    safeEvidenceRuleIds: ["STATE_TRANSITION_TRACE"],
  }),
  defineContour({
    key: "C07_ASSISTANT_MESSAGE",
    purpose:
      "Associates an assistant response with the controlled health prompt.",
    primaryStrategyId: "ASSISTANT_MESSAGE_REGION",
    fallbackStrategyIds: ["MESSAGE_ASSOCIATION_MARKER"],
    structuralAssertionIds: ["MESSAGE_ASSOCIATED"],
    behavioralAssertionIds: ["RESPONSE_ASSOCIATED"],
    expectedTransitionIds: ["PROMPT_TO_ASSISTANT"],
    safeEvidenceRuleIds: ["BOUNDED_DOM_FRAGMENT"],
  }),
  defineContour({
    key: "C08_MESSAGE_COMPLETION",
    purpose:
      "Proves that the controlled assistant response reaches completion.",
    primaryStrategyId: "COMPLETION_MARKER",
    fallbackStrategyIds: ["RESPONSE_IDLE_STATE"],
    structuralAssertionIds: ["COMPLETION_MARKER_PRESENT"],
    behavioralAssertionIds: ["COMPLETION_TRANSITION"],
    expectedTransitionIds: ["ASSISTANT_TO_COMPLETE"],
    safeEvidenceRuleIds: ["STATE_TRANSITION_TRACE"],
  }),
  defineContour({
    key: "C09_COMMAND_CODE_BLOCK_SURFACE",
    purpose:
      "Checks discovery of a bounded bridge-shaped command surface fixture.",
    primaryStrategyId: "COMMAND_SURFACE",
    fallbackStrategyIds: ["CODE_BLOCK_DISCOVERY"],
    structuralAssertionIds: ["COMMAND_SHAPE_PRESENT"],
    behavioralAssertionIds: ["COMMAND_DISCOVERY"],
    expectedTransitionIds: ["ASSISTANT_TO_COMPLETE"],
    safeEvidenceRuleIds: ["BOUNDED_DOM_FRAGMENT"],
  }),
  defineContour({
    key: "C10_NATIVE_COPY_CONTROL",
    purpose:
      "Checks optional correlation of a native copy control to the command surface.",
    required: false,
    failureSeverity: "IMPORTANT_NON_CORE",
    absencePolicy: { mode: "ALLOWED_FOR_SCOPE" },
    primaryStrategyId: "NATIVE_COPY_CONTROL",
    fallbackStrategyIds: ["COPY_ANCHOR_ASSOCIATION"],
    structuralAssertionIds: ["ACTIONABLE", "COPY_CORRELATED"],
    behavioralAssertionIds: ["COPY_ANCHOR_CORRELATION"],
    expectedTransitionIds: ["ASSISTANT_TO_COMPLETE"],
    safeEvidenceRuleIds: ["SAFE_ELEMENT_METADATA"],
  }),
  defineContour({
    key: "C11_CONVERSATION_IDENTITY",
    purpose:
      "Establishes the current conversation identity for result ownership.",
    primaryStrategyId: "CONVERSATION_IDENTIFIER",
    fallbackStrategyIds: ["CONVERSATION_URL_IDENTITY"],
    structuralAssertionIds: ["CONVERSATION_ID_PRESENT"],
    behavioralAssertionIds: ["CONVERSATION_ID_STABLE"],
    expectedTransitionIds: ["PROMPT_TO_ASSISTANT"],
    safeEvidenceRuleIds: ["SAFE_ELEMENT_METADATA"],
  }),
  defineContour({
    key: "C12_DELIVERY_INSERTION_PATH",
    purpose:
      "Checks a safe fixture delivery target scoped to the active conversation.",
    primaryStrategyId: "DELIVERY_TARGET",
    fallbackStrategyIds: ["ACTIVE_COMPOSER_REGION"],
    structuralAssertionIds: ["DELIVERY_TARGET_SCOPED"],
    behavioralAssertionIds: ["DELIVERY_SCOPE"],
    expectedTransitionIds: ["RUN_TO_DELIVERY"],
    safeEvidenceRuleIds: ["STATE_TRANSITION_TRACE"],
  }),
  defineContour({
    key: "C13_BLOCKING_STATE",
    purpose:
      "Classifies login, checkpoint, account, network, and browser blockers.",
    primaryStrategyId: "BLOCKING_MARKER",
    fallbackStrategyIds: ["SESSION_PRECONDITION"],
    structuralAssertionIds: ["BLOCKER_CLASSIFIED"],
    behavioralAssertionIds: ["ENVIRONMENT_PRECONDITION"],
    expectedTransitionIds: ["BLOCKING_DETECTED"],
    safeEvidenceRuleIds: ["SAFE_ELEMENT_METADATA"],
  }),
] as const;

export const BASELINE_HEALTH_SUITE: HealthSuiteDefinition =
  HealthSuiteDefinitionSchema.parse({
    machineKey: "baseline-contract-fixture",
    revision: 1,
    suiteKind: "BASELINE_CONTRACT_FIXTURE",
    displayName: "Deterministic baseline contract fixture",
    description:
      "A non-live schema and classifier fixture; it contains no current provider selectors or navigation knowledge.",
    scope: BASELINE_SCOPE,
    contours: BASELINE_CONTOUR_CATALOG,
  });

export function validateHealthSuiteDefinition(
  input: unknown,
): HealthSuiteDefinition {
  return HealthSuiteDefinitionSchema.parse(input);
}

export function validateBaselineContourCatalog(
  input: readonly unknown[] = BASELINE_CONTOUR_CATALOG,
): readonly HealthContourDefinition[] {
  const parsed = input.map((value) =>
    HealthContourDefinitionSchema.parse(value),
  );
  const keys = parsed.map((value) => value.key);
  if (
    parsed.length !== BASELINE_CONTOUR_KEYS.length ||
    new Set(keys).size !== BASELINE_CONTOUR_KEYS.length ||
    BASELINE_CONTOUR_KEYS.some((key) => !keys.includes(key))
  ) {
    throw new Error("INVALID_BASELINE_CONTOUR_CATALOG");
  }
  return parsed;
}

export function createBaselineHealthSuite(): HealthSuiteDefinition {
  return HealthSuiteDefinitionSchema.parse(BASELINE_HEALTH_SUITE);
}
