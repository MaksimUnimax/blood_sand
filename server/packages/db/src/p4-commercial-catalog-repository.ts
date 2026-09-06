import {
  CommercialCatalogIdentifierSchema,
  type CommercialCatalogInspectionReader,
  type InspectedEntitlement,
  type InspectedPlan,
  type InspectedPlanRevision,
  type InspectedPrice,
  type InspectedPriceRevision,
  type InspectedSaleAssignment,
  type PublicCommercialCatalogReader,
  type PublicCommercialOffer,
  type PurchasableOffer,
  type PurchasableOfferResolver,
  type PurchasableOfferResolution,
} from "@product/commercial-catalog";
import {
  computeP4PriceRevisionContentFingerprintV1,
  type BillingIntervalUnit,
} from "@product/pricing";
import type { DatabaseQuery, DatabaseRuntime } from "./index.js";

type Query = Pick<DatabaseQuery, "query">;
type Timestamp = Date | string;
type Integer = number | string;

type PublicOfferRow = {
  planId: string;
  planCode: string;
  priceId: string;
  priceCode: string;
  assignmentId: string | null;
  assignmentRevision: Integer | null;
  selectedPriceRevisionId: string | null;
  revisionId: string | null;
  revisionPriceId: string | null;
  priceRevisionId: string | null;
  priceRevision: Integer | null;
  priceRevisionState: "DRAFT" | "PUBLISHED" | null;
  amountMinor: Integer | null;
  currency: string | null;
  billingIntervalUnit: BillingIntervalUnit | null;
  billingIntervalCount: number | null;
  effectiveFrom: Timestamp | null;
  effectiveTo: Timestamp | null;
  planRevisionId: string | null;
  planRevisionPlanId: string | null;
  planRevision: Integer | null;
  planRevisionState: "DRAFT" | "PUBLISHED" | null;
  displayName: string | null;
  description: string | null;
};

type ExactRevisionRow = {
  revisionId: string;
  priceId: string;
  priceRevision: Integer;
  priceRevisionState: "DRAFT" | "PUBLISHED";
  amountMinor: Integer;
  currency: string;
  billingIntervalUnit: BillingIntervalUnit;
  billingIntervalCount: number;
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  priceCode: string;
  marketKey: string;
  channelKey: string;
  priceStatus: "DRAFT" | "ACTIVE" | "HIDDEN" | "ARCHIVED";
  planId: string;
  planCode: string;
  planStatus: "DRAFT" | "ACTIVE" | "HIDDEN" | "ARCHIVED";
  planRevisionId: string | null;
  planRevisionPlanId: string | null;
  planRevision: Integer | null;
  planRevisionState: "DRAFT" | "PUBLISHED" | null;
};

type AssignmentRow = {
  id: string;
  assignmentRevision: Integer;
  selectedPriceRevisionId: string | null;
  effectiveFrom: Timestamp;
};

type PlanRow = {
  id: string;
  code: string;
  status: "DRAFT" | "ACTIVE" | "HIDDEN" | "ARCHIVED";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type PlanRevisionRow = {
  id: string;
  revision: Integer;
  state: "DRAFT" | "PUBLISHED";
  displayName: string;
  description: string;
  createdAt: Timestamp;
  publishedAt: Timestamp | null;
};

type EntitlementRow = {
  planRevisionId: string | null;
  entitlementKey: string | null;
  valueType: "BOOLEAN" | "INTEGER" | null;
  securityClassification: "CAPABILITY" | "LIMIT" | null;
  deprecatedAt: Timestamp | null;
  booleanValue: boolean | null;
  integerValue: Integer | null;
};

type PriceRow = {
  id: string;
  planId: string;
  code: string;
  marketKey: string;
  channelKey: string;
  status: "DRAFT" | "ACTIVE" | "HIDDEN" | "ARCHIVED";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type PriceRevisionRow = {
  id: string;
  revision: Integer;
  planRevisionId: string;
  state: "DRAFT" | "PUBLISHED";
  amountMinor: Integer;
  currency: string;
  billingIntervalUnit: BillingIntervalUnit;
  billingIntervalCount: number;
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  createdAt: Timestamp;
  publishedAt: Timestamp | null;
};

type SaleAssignmentInspectionRow = {
  id: string;
  assignmentRevision: Integer;
  selectedPriceRevisionId: string | null;
  effectiveFrom: Timestamp;
  createdAt: Timestamp;
};

function date(value: Timestamp): Date {
  const result =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(result.getTime()))
    throw new Error("P4_CATALOG_TIMESTAMP_CORRUPTION");
  return result;
}

function optionalDate(value: Timestamp | null): Date | null {
  return value === null ? null : date(value);
}

function safeInteger(value: Integer, code: string): number {
  const result = Number(value);
  if (!Number.isSafeInteger(result)) throw new Error(code);
  return result;
}

function positiveInteger(value: Integer, code: string): number {
  const result = safeInteger(value, code);
  if (result < 1) throw new Error(code);
  return result;
}

function assertIdentifier(value: string, code: string): string {
  if (!CommercialCatalogIdentifierSchema.safeParse(value).success)
    throw new Error(code);
  return value;
}

async function coherentRead(q: Query): Promise<void> {
  await q.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
}

function compareOffers(
  left: PublicCommercialOffer,
  right: PublicCommercialOffer,
): number {
  const keys = [
    [left.plan.planCode, right.plan.planCode],
    [left.price.priceCode, right.price.priceCode],
    [left.plan.planRevisionId, right.plan.planRevisionId],
    [left.price.priceRevisionId, right.price.priceRevisionId],
  ] as const;
  for (const [a, b] of keys) {
    if (a < b) return -1;
    if (a > b) return 1;
  }
  return 0;
}

function mapOffer(row: PublicOfferRow): PublicCommercialOffer {
  if (
    !row.assignmentId ||
    row.assignmentRevision === null ||
    !row.selectedPriceRevisionId ||
    !row.revisionId ||
    !row.revisionPriceId ||
    row.priceRevisionId === null ||
    row.priceRevision === null ||
    row.priceRevisionState === null ||
    row.amountMinor === null ||
    row.currency === null ||
    row.billingIntervalUnit === null ||
    row.billingIntervalCount === null ||
    row.effectiveFrom === null ||
    row.planRevisionId === null ||
    row.planRevisionPlanId === null ||
    row.planRevision === null ||
    row.planRevisionState === null ||
    row.displayName === null ||
    row.description === null
  )
    throw new Error("P4_CATALOG_SELECTED_REVISION_MISSING");
  if (
    row.revisionId !== row.priceRevisionId ||
    row.revisionPriceId !== row.priceId
  )
    throw new Error("P4_CATALOG_PRICE_REVISION_PRICE_MISMATCH");
  if (row.priceRevisionState !== "PUBLISHED")
    throw new Error("P4_CATALOG_SELECTED_REVISION_NOT_PUBLISHED");
  if (row.planRevisionPlanId !== row.planId)
    throw new Error("P4_CATALOG_PLAN_REVISION_PLAN_MISMATCH");
  if (row.planRevisionState !== "PUBLISHED")
    throw new Error("P4_CATALOG_PLAN_REVISION_NOT_PUBLISHED");
  return {
    plan: {
      planId: row.planId,
      planCode: row.planCode,
      planRevisionId: row.planRevisionId,
      planRevision: positiveInteger(
        row.planRevision,
        "P4_CATALOG_PLAN_REVISION_UNSAFE",
      ),
      displayName: row.displayName,
      description: row.description,
    },
    price: {
      priceId: row.priceId,
      priceCode: row.priceCode,
      priceRevisionId: row.priceRevisionId,
      priceRevision: positiveInteger(
        row.priceRevision,
        "P4_CATALOG_PRICE_REVISION_UNSAFE",
      ),
      amountMinor: (() => {
        const amount = safeInteger(
          row.amountMinor!,
          "P4_CATALOG_AMOUNT_UNSAFE",
        );
        if (amount < 0) throw new Error("P4_CATALOG_AMOUNT_UNSAFE");
        return amount;
      })(),
      currency: row.currency,
      billingIntervalUnit: row.billingIntervalUnit,
      billingIntervalCount: row.billingIntervalCount,
      effectiveFrom: date(row.effectiveFrom),
      effectiveTo: optionalDate(row.effectiveTo),
    },
  };
}

function mapExactOffer(row: ExactRevisionRow): PurchasableOffer {
  if (
    row.planRevisionId === null ||
    row.planRevisionPlanId === null ||
    row.planRevision === null ||
    row.planRevisionState === null
  )
    throw new Error("P4_CATALOG_PLAN_REVISION_MISSING");
  if (row.planRevisionPlanId !== row.planId)
    throw new Error("P4_CATALOG_PLAN_REVISION_PLAN_MISMATCH");
  const amountMinor = safeInteger(row.amountMinor, "P4_CATALOG_AMOUNT_UNSAFE");
  if (amountMinor < 0) throw new Error("P4_CATALOG_AMOUNT_UNSAFE");
  return {
    planId: row.planId,
    planCode: row.planCode,
    planRevisionId: row.planRevisionId,
    planRevision: positiveInteger(
      row.planRevision,
      "P4_CATALOG_PLAN_REVISION_UNSAFE",
    ),
    priceId: row.priceId,
    priceCode: row.priceCode,
    priceRevisionId: row.revisionId,
    priceRevision: positiveInteger(
      row.priceRevision,
      "P4_CATALOG_PRICE_REVISION_UNSAFE",
    ),
    marketKey: row.marketKey,
    channelKey: row.channelKey,
    amountMinor,
    currency: row.currency,
    billingIntervalUnit: row.billingIntervalUnit,
    billingIntervalCount: row.billingIntervalCount,
    effectiveFrom: date(row.effectiveFrom),
    effectiveTo: optionalDate(row.effectiveTo),
  };
}

function mapEntitlement(row: EntitlementRow): InspectedEntitlement {
  if (
    row.entitlementKey === null ||
    row.valueType === null ||
    row.securityClassification === null
  )
    throw new Error("P6_CATALOG_ENTITLEMENT_DEFINITION_MISSING");
  let value: InspectedEntitlement["value"];
  if (row.valueType === "BOOLEAN") {
    if (row.booleanValue === null || row.integerValue !== null)
      throw new Error("P6_CATALOG_BOOLEAN_VALUE_CORRUPTION");
    value = { kind: "BOOLEAN", value: row.booleanValue };
  } else {
    if (row.booleanValue !== null || row.integerValue === null)
      throw new Error("P6_CATALOG_INTEGER_VALUE_CORRUPTION");
    const integerValue = safeInteger(
      row.integerValue,
      "P6_CATALOG_INTEGER_UNSAFE",
    );
    value = { kind: "INTEGER", value: integerValue };
  }
  return {
    entitlementKey: row.entitlementKey,
    value,
    definition: {
      valueType: row.valueType,
      securityClassification: row.securityClassification,
      deprecatedAt: optionalDate(row.deprecatedAt),
    },
  };
}

function mapPriceRevision(
  row: PriceRevisionRow,
  priceId: string,
): InspectedPriceRevision {
  const amountMinor = safeInteger(row.amountMinor, "P6_CATALOG_AMOUNT_UNSAFE");
  if (amountMinor < 0) throw new Error("P6_CATALOG_AMOUNT_UNSAFE");
  const revision = positiveInteger(
    row.revision,
    "P6_CATALOG_PRICE_REVISION_UNSAFE",
  );
  return {
    id: row.id,
    revision,
    planRevisionId: row.planRevisionId,
    state: row.state,
    amountMinor,
    currency: row.currency,
    billingIntervalUnit: row.billingIntervalUnit,
    billingIntervalCount: row.billingIntervalCount,
    effectiveFrom: date(row.effectiveFrom),
    effectiveTo: optionalDate(row.effectiveTo),
    createdAt: date(row.createdAt),
    publishedAt: optionalDate(row.publishedAt),
    contentFingerprintSha256: computeP4PriceRevisionContentFingerprintV1({
      id: row.id,
      priceId,
      planRevisionId: row.planRevisionId,
      revision,
      amountMinor,
      currency: row.currency,
      billingIntervalUnit: row.billingIntervalUnit,
      billingIntervalCount: row.billingIntervalCount,
      effectiveFrom: date(row.effectiveFrom),
      effectiveTo: optionalDate(row.effectiveTo),
    }),
  };
}

export function createP4CommercialCatalogRepository(
  runtime: DatabaseRuntime,
): PublicCommercialCatalogReader &
  PurchasableOfferResolver &
  CommercialCatalogInspectionReader {
  return {
    async listPublicOffers({ marketKey, channelKey, at }) {
      assertIdentifier(marketKey, "P4_CATALOG_MARKET_KEY_INVALID");
      assertIdentifier(channelKey, "P4_CATALOG_CHANNEL_KEY_INVALID");
      const evaluatedAt = date(at);
      const offers = await runtime.transaction(async (q) => {
        await coherentRead(q);
        const result = await q.query<PublicOfferRow>(
          `SELECT p.plan_id AS "planId",pl.code AS "planCode",p.id AS "priceId",p.code AS "priceCode",
                  a.id AS "assignmentId",a.assignment_revision AS "assignmentRevision",
                  a.selected_price_revision_id AS "selectedPriceRevisionId",
                  r.id AS "revisionId",r.price_id AS "revisionPriceId",r.id AS "priceRevisionId",
                  r.revision AS "priceRevision",r.state AS "priceRevisionState",r.amount_minor AS "amountMinor",
                  r.currency,r.billing_interval_unit AS "billingIntervalUnit",r.billing_interval_count AS "billingIntervalCount",
                  r.effective_from AS "effectiveFrom",r.effective_to AS "effectiveTo",
                  pr.id AS "planRevisionId",pr.plan_id AS "planRevisionPlanId",pr.revision AS "planRevision",
                  pr.state AS "planRevisionState",pr.display_name AS "displayName",pr.description
             FROM prices p
             JOIN plans pl ON pl.id=p.plan_id
             LEFT JOIN LATERAL (
               SELECT id,assignment_revision,selected_price_revision_id
                 FROM price_sale_assignments
                WHERE price_id=p.id AND effective_from <= $3
                ORDER BY assignment_revision DESC
                LIMIT 1
             ) a ON true
             LEFT JOIN price_revisions r ON r.id=a.selected_price_revision_id
             LEFT JOIN plan_revisions pr ON pr.id=r.plan_revision_id
            WHERE p.market_key=$1 AND p.channel_key=$2
              AND p.status='ACTIVE' AND pl.status='ACTIVE'`,
          [marketKey, channelKey, evaluatedAt],
        );
        const mapped: PublicCommercialOffer[] = [];
        for (const row of result.rows) {
          if (!row.assignmentId || row.selectedPriceRevisionId === null)
            continue;
          const offer = mapOffer(row);
          const from = offer.price.effectiveFrom;
          const to = offer.price.effectiveTo;
          if (from > evaluatedAt || (to !== null && evaluatedAt >= to))
            continue;
          mapped.push(offer);
        }
        return mapped.sort(compareOffers);
      });
      return offers;
    },

    async resolvePurchasableOffer({
      priceRevisionId,
      at,
    }): Promise<PurchasableOfferResolution> {
      const evaluatedAt = date(at);
      return runtime.transaction(async (q) => {
        await coherentRead(q);
        const exact = await q.query<ExactRevisionRow>(
          `SELECT r.id AS "revisionId",r.price_id AS "priceId",r.revision AS "priceRevision",r.state AS "priceRevisionState",
                  r.amount_minor AS "amountMinor",r.currency,r.billing_interval_unit AS "billingIntervalUnit",
                  r.billing_interval_count AS "billingIntervalCount",r.effective_from AS "effectiveFrom",r.effective_to AS "effectiveTo",
                  p.code AS "priceCode",p.market_key AS "marketKey",p.channel_key AS "channelKey",p.status AS "priceStatus",
                  p.plan_id AS "planId",pl.code AS "planCode",pl.status AS "planStatus",
                  pr.id AS "planRevisionId",pr.plan_id AS "planRevisionPlanId",pr.revision AS "planRevision",pr.state AS "planRevisionState"
             FROM price_revisions r
             JOIN prices p ON p.id=r.price_id
             JOIN plans pl ON pl.id=p.plan_id
             LEFT JOIN plan_revisions pr ON pr.id=r.plan_revision_id
            WHERE r.id=$1`,
          [priceRevisionId],
        );
        const row = exact.rows[0];
        if (!row) return { kind: "REJECTED", code: "PRICE_REVISION_NOT_FOUND" };
        if (row.planStatus !== "ACTIVE")
          return { kind: "REJECTED", code: "PLAN_NOT_ACTIVE" };
        if (row.priceStatus !== "ACTIVE")
          return { kind: "REJECTED", code: "PRICE_NOT_ACTIVE" };
        if (row.priceRevisionState !== "PUBLISHED")
          return { kind: "REJECTED", code: "PRICE_REVISION_NOT_PUBLISHED" };
        const assignmentResult = await q.query<AssignmentRow>(
          `SELECT id,assignment_revision AS "assignmentRevision",selected_price_revision_id AS "selectedPriceRevisionId",effective_from AS "effectiveFrom"
             FROM price_sale_assignments
            WHERE price_id=$1 AND effective_from <= $2
            ORDER BY assignment_revision DESC
            LIMIT 1`,
          [row.priceId, evaluatedAt],
        );
        const assignment = assignmentResult.rows[0];
        if (!assignment)
          return { kind: "REJECTED", code: "NO_EFFECTIVE_ASSIGNMENT" };
        if (assignment.selectedPriceRevisionId === null)
          return { kind: "REJECTED", code: "EXPLICITLY_CLOSED" };
        if (assignment.selectedPriceRevisionId !== row.revisionId)
          return { kind: "REJECTED", code: "PRICE_REVISION_NOT_SELECTED" };
        const from = date(row.effectiveFrom);
        const to = optionalDate(row.effectiveTo);
        if (from > evaluatedAt || (to !== null && evaluatedAt >= to))
          return {
            kind: "REJECTED",
            code: "REVISION_OUTSIDE_EFFECTIVE_WINDOW",
          };
        if (row.planRevisionId === null || row.planRevisionPlanId === null)
          throw new Error("P5_PLAN_REVISION_MISSING");
        if (row.planRevisionPlanId !== row.planId)
          return { kind: "REJECTED", code: "PLAN_REVISION_PLAN_MISMATCH" };
        if (row.planRevisionState !== "PUBLISHED")
          return { kind: "REJECTED", code: "PLAN_REVISION_NOT_PUBLISHED" };
        return { kind: "OK", value: mapExactOffer(row) };
      });
    },

    async inspectPlan(planId): Promise<InspectedPlan | null> {
      return runtime.transaction(async (q) => {
        await coherentRead(q);
        const planResult = await q.query<PlanRow>(
          'SELECT id,code,status,created_at AS "createdAt",updated_at AS "updatedAt" FROM plans WHERE id=$1',
          [planId],
        );
        const plan = planResult.rows[0];
        if (!plan) return null;
        const revisionsResult = await q.query<PlanRevisionRow>(
          `SELECT id,revision,state,display_name AS "displayName",description,created_at AS "createdAt",published_at AS "publishedAt"
             FROM plan_revisions WHERE plan_id=$1 ORDER BY revision ASC`,
          [planId],
        );
        const entitlementsResult = await q.query<EntitlementRow>(
          `SELECT pe.plan_revision_id AS "planRevisionId",pe.entitlement_key AS "entitlementKey",
                  ed.value_type AS "valueType",ed.security_classification AS "securityClassification",ed.deprecated_at AS "deprecatedAt",
                  pe.boolean_value AS "booleanValue",pe.integer_value AS "integerValue"
             FROM plan_entitlements pe
             LEFT JOIN entitlement_definitions ed ON ed.entitlement_key=pe.entitlement_key
            WHERE pe.plan_revision_id IN (SELECT id FROM plan_revisions WHERE plan_id=$1)
            ORDER BY pe.plan_revision_id,pe.entitlement_key ASC`,
          [planId],
        );
        const byRevision = new Map<string, InspectedEntitlement[]>();
        for (const row of entitlementsResult.rows) {
          if (row.planRevisionId === null)
            throw new Error("P6_CATALOG_ENTITLEMENT_REVISION_MISSING");
          const values = byRevision.get(row.planRevisionId) ?? [];
          values.push(mapEntitlement(row));
          byRevision.set(row.planRevisionId, values);
        }
        const revisions: InspectedPlanRevision[] = revisionsResult.rows.map(
          (row) => ({
            id: row.id,
            revision: positiveInteger(
              row.revision,
              "P6_CATALOG_PLAN_REVISION_UNSAFE",
            ),
            state: row.state,
            displayName: row.displayName,
            description: row.description,
            createdAt: date(row.createdAt),
            publishedAt: optionalDate(row.publishedAt),
            entitlements: byRevision.get(row.id) ?? [],
          }),
        );
        return {
          id: plan.id,
          code: plan.code,
          status: plan.status,
          createdAt: date(plan.createdAt),
          updatedAt: date(plan.updatedAt),
          revisions,
        };
      });
    },

    async inspectPrice(priceId): Promise<InspectedPrice | null> {
      return runtime.transaction(async (q) => {
        await coherentRead(q);
        const priceResult = await q.query<PriceRow>(
          `SELECT id,plan_id AS "planId",code,market_key AS "marketKey",channel_key AS "channelKey",status,
                  created_at AS "createdAt",updated_at AS "updatedAt"
             FROM prices WHERE id=$1`,
          [priceId],
        );
        const price = priceResult.rows[0];
        if (!price) return null;
        const revisionsResult = await q.query<PriceRevisionRow>(
          `SELECT id,revision,plan_revision_id AS "planRevisionId",state,amount_minor AS "amountMinor",currency,
                  billing_interval_unit AS "billingIntervalUnit",billing_interval_count AS "billingIntervalCount",
                  effective_from AS "effectiveFrom",effective_to AS "effectiveTo",created_at AS "createdAt",published_at AS "publishedAt"
             FROM price_revisions WHERE price_id=$1 ORDER BY revision ASC`,
          [priceId],
        );
        const assignmentsResult = await q.query<SaleAssignmentInspectionRow>(
          `SELECT id,assignment_revision AS "assignmentRevision",selected_price_revision_id AS "selectedPriceRevisionId",
                  effective_from AS "effectiveFrom",created_at AS "createdAt"
             FROM price_sale_assignments WHERE price_id=$1 ORDER BY assignment_revision ASC`,
          [priceId],
        );
        const revisions = revisionsResult.rows.map((row) =>
          mapPriceRevision(row, price.id),
        );
        const saleAssignments: InspectedSaleAssignment[] =
          assignmentsResult.rows.map((row) => ({
            id: row.id,
            assignmentRevision: positiveInteger(
              row.assignmentRevision,
              "P6_CATALOG_ASSIGNMENT_REVISION_UNSAFE",
            ),
            selectedPriceRevisionId: row.selectedPriceRevisionId,
            effectiveFrom: date(row.effectiveFrom),
            createdAt: date(row.createdAt),
          }));
        return {
          id: price.id,
          planId: price.planId,
          code: price.code,
          marketKey: price.marketKey,
          channelKey: price.channelKey,
          status: price.status,
          createdAt: date(price.createdAt),
          updatedAt: date(price.updatedAt),
          revisions,
          saleAssignments,
        };
      });
    },
  };
}
