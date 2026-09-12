import {
  HealthClassificationInputSchema,
  type HealthContourDefinition,
  type HealthContourResult,
  type HealthState,
  type HealthSuiteDefinition,
} from "./types.js";

type ProductFinding = "BROKEN" | "DEGRADED" | "DRIFT";

function absenceAllowed(
  contour: HealthContourDefinition,
  suite: HealthSuiteDefinition,
): boolean {
  const required = isRequiredForScope(contour, suite);
  if (required || contour.absencePolicy.mode === "FORBIDDEN") return false;
  if (contour.absencePolicy.mode === "ALLOWED_FOR_SCOPE") return true;
  const variantKey = suite.scope.variant?.machineKey;
  return (
    variantKey !== undefined &&
    contour.absencePolicy.variantIds.includes(variantKey)
  );
}

function isRequiredForScope(
  contour: HealthContourDefinition,
  suite: HealthSuiteDefinition,
): boolean {
  const variantKey = suite.scope.variant?.machineKey;
  return (
    contour.required ||
    (variantKey !== undefined &&
      contour.requiredForVariantIds.includes(variantKey))
  );
}

function validateResultsAgainstSuite(
  suite: HealthSuiteDefinition,
  results: readonly HealthContourResult[],
): Map<string, HealthContourResult> {
  const definitions = new Map(
    suite.contours.map((contour) => [contour.key, contour]),
  );
  const byKey = new Map<string, HealthContourResult>();
  for (const result of results) {
    if (byKey.has(result.contourKey))
      throw new Error("DUPLICATE_CONTOUR_RESULT");
    const definition = definitions.get(result.contourKey);
    if (!definition) throw new Error("UNKNOWN_CONTOUR_RESULT");
    if (
      result.required !== isRequiredForScope(definition, suite) ||
      result.failureSeverity !== definition.failureSeverity ||
      result.primaryStrategyId !== definition.primaryStrategyId
    ) {
      throw new Error("CONTOUR_RESULT_DEFINITION_MISMATCH");
    }
    if (
      result.selectedStrategyId !== null &&
      result.selectedStrategyId !== result.primaryStrategyId
    ) {
      if (!definition.fallbackStrategyIds.includes(result.selectedStrategyId)) {
        throw new Error("SELECTED_FALLBACK_NOT_DECLARED");
      }
      const selectedFallbackResults = result.fallbackStrategyOutcomes.filter(
        (attempt) => attempt.strategyId === result.selectedStrategyId,
      );
      if (selectedFallbackResults.length !== 1) {
        throw new Error("SELECTED_FALLBACK_RESULT_MISSING");
      }
    }
    const fallbackIds = result.fallbackStrategyOutcomes.map(
      (attempt) => attempt.strategyId,
    );
    if (
      fallbackIds.some((id) => !definition.fallbackStrategyIds.includes(id))
    ) {
      throw new Error("CONTOUR_RESULT_UNKNOWN_FALLBACK");
    }
    byKey.set(result.contourKey, result);
  }
  for (const contour of suite.contours) {
    if (!byKey.has(contour.key) && !absenceAllowed(contour, suite)) {
      throw new Error("MISSING_REQUIRED_CONTOUR_RESULT");
    }
  }
  return byKey;
}

function contourFinding(
  contour: HealthContourDefinition,
  required: boolean,
  result: HealthContourResult,
): ProductFinding | undefined {
  if (result.observationStatus !== "PRESENT") {
    if (!required) return undefined;
    return contour.failureSeverity === "CORE" ? "BROKEN" : "DEGRADED";
  }
  const structuralPass = result.structuralOutcome === "PASS";
  const behavioralPass = result.behavioralOutcome === "PASS";
  const primaryPass = result.primaryStrategyOutcome === "PASS";
  if (primaryPass && structuralPass && behavioralPass) return undefined;
  const selectedFallback =
    result.selectedStrategyId !== null &&
    result.selectedStrategyId !== result.primaryStrategyId
      ? result.fallbackStrategyOutcomes.find(
          (attempt) => attempt.strategyId === result.selectedStrategyId,
        )
      : undefined;
  if (
    !primaryPass &&
    selectedFallback?.outcome === "PASS" &&
    result.fallbackQuality === "APPROVED_EQUIVALENT" &&
    structuralPass &&
    behavioralPass
  ) {
    return "DRIFT";
  }
  if (
    !primaryPass &&
    selectedFallback?.outcome === "PASS" &&
    result.fallbackQuality === "MATERIALLY_DEGRADED" &&
    structuralPass &&
    behavioralPass
  ) {
    return "DEGRADED";
  }
  if (required && contour.failureSeverity === "CORE") return "BROKEN";
  return "DEGRADED";
}

export function classifyHealth(input: unknown): HealthState {
  const parsed = HealthClassificationInputSchema.parse(input);
  const results = parsed.results;
  const byKey = validateResultsAgainstSuite(parsed.suite, results);
  if (parsed.operatorMaintenance) return "MAINTENANCE";
  if (results.some((result) => result.environmentStatus === "UNCERTAIN")) {
    return "UNKNOWN";
  }
  const findings = parsed.suite.contours
    .map((contour) => {
      const result = byKey.get(contour.key);
      return result
        ? contourFinding(
            contour,
            isRequiredForScope(contour, parsed.suite),
            result,
          )
        : undefined;
    })
    .filter((finding): finding is ProductFinding => finding !== undefined);
  if (findings.includes("BROKEN")) return "BROKEN";
  if (findings.includes("DEGRADED")) return "DEGRADED";
  if (findings.includes("DRIFT")) return "DRIFT";
  return "HEALTHY";
}

export function isHealthState(value: unknown): value is HealthState {
  return (
    value === "HEALTHY" ||
    value === "DRIFT" ||
    value === "DEGRADED" ||
    value === "BROKEN" ||
    value === "UNKNOWN" ||
    value === "MAINTENANCE"
  );
}
