import {
  AdapterProfileSchema,
  AdapterSchema,
  ProfileCompatibilityConstraintsV1Schema,
  AdapterProfileContentV1Schema,
  SurfaceSchema,
  VariantSchema,
  type Adapter,
  type AdapterProfile,
  type Surface,
  type Variant,
} from "@product/adapter-registry";
import type {
  AdminAiAssignment,
  AdminAiAssignmentRevision,
  AdminAiRevision,
  AdminAiRegistryReadRepository,
  AdminAiPage,
} from "@product/admin-ai";
import type { DatabaseRuntime } from "./index.js";

type Row = Record<string, unknown>;
const date = (value: unknown): Date =>
  value instanceof Date ? value : new Date(String(value));
function page<T>(
  items: T[],
  limit: number,
  idOf: (value: T) => string,
): AdminAiPage<T> {
  return {
    items,
    nextCursor: items.length === limit ? idOf(items[items.length - 1]!) : null,
  };
}
function mapAdapter(row: Row): Adapter {
  return AdapterSchema.parse({
    ...row,
    createdAt: date(row.createdAt),
    updatedAt: date(row.updatedAt),
  });
}
function mapSurface(row: Row): Surface {
  return SurfaceSchema.parse({
    ...row,
    createdAt: date(row.createdAt),
    updatedAt: date(row.updatedAt),
  });
}
function mapVariant(row: Row): Variant {
  return VariantSchema.parse({
    ...row,
    createdAt: date(row.createdAt),
    updatedAt: date(row.updatedAt),
  });
}
function mapProfile(row: Row): AdapterProfile {
  return AdapterProfileSchema.parse({
    ...row,
    createdAt: date(row.createdAt),
    updatedAt: date(row.updatedAt),
  });
}
function mapRevision(row: Row): AdminAiRevision {
  return {
    ...row,
    id: String(row.id),
    profileId: String(row.profileId),
    adapterId: String(row.adapterId),
    surfaceId: String(row.surfaceId),
    variantId: row.variantId === null ? null : String(row.variantId),
    revision: Number(row.revision),
    schemaVersion: "adapter_profile_v1",
    state: row.state as AdminAiRevision["state"],
    content: AdapterProfileContentV1Schema.parse(row.content),
    compatibility: ProfileCompatibilityConstraintsV1Schema.parse(
      row.compatibility,
    ),
    contentSha256: String(row.contentSha256),
    createdAt: date(row.createdAt).toISOString(),
    publishedAt:
      row.publishedAt === null ? null : date(row.publishedAt).toISOString(),
  };
}
function mapAssignmentRevision(row: Row): AdminAiAssignmentRevision {
  return {
    id: String(row.id),
    assignmentId: String(row.assignmentId),
    revision: Number(row.revision),
    mode: row.mode as AdminAiAssignmentRevision["mode"],
    baselineProfileRevisionId: String(row.baselineProfileRevisionId),
    candidateProfileRevisionId:
      row.candidateProfileRevisionId === null
        ? null
        : String(row.candidateProfileRevisionId),
    percentageBps: Number(row.percentageBps),
    createdAt: date(row.createdAt).toISOString(),
  };
}
function mapAssignment(row: Row): AdminAiAssignment {
  const latest = row.latest as Row | null;
  return {
    id: String(row.id),
    adapterId: String(row.adapterId),
    surfaceId: String(row.surfaceId),
    variantId: row.variantId === null ? null : String(row.variantId),
    browserFamily: row.browserFamily as AdminAiAssignment["browserFamily"],
    subjectKind: row.subjectKind as AdminAiAssignment["subjectKind"],
    createdAt: date(row.createdAt).toISOString(),
    latest: latest
      ? {
          revision: Number(latest.revision),
          mode: latest.mode as AdminAiAssignment["latest"] extends infer T
            ? T extends { mode: infer M }
              ? M
              : never
            : never,
          baselineProfileRevisionId: String(latest.baselineProfileRevisionId),
          candidateProfileRevisionId:
            latest.candidateProfileRevisionId === null
              ? null
              : String(latest.candidateProfileRevisionId),
          percentageBps: Number(latest.percentageBps),
          createdAt: date(latest.createdAt).toISOString(),
        }
      : null,
  };
}

const identityColumns = `id, machine_key AS "machineKey", display_name AS "displayName", status, created_at AS "createdAt", updated_at AS "updatedAt"`;
const revisionColumns = `id, profile_id AS "profileId", adapter_id AS "adapterId", surface_id AS "surfaceId", variant_id AS "variantId", revision, schema_version AS "schemaVersion", state, content, compatibility_constraints AS compatibility, content_sha256 AS "contentSha256", created_at AS "createdAt", published_at AS "publishedAt"`;

export function createP7AdminAiReadRepository(
  runtime: DatabaseRuntime,
): AdminAiRegistryReadRepository {
  return {
    async listAdapters(input) {
      const result = await runtime.query<Row>(
        `SELECT ${identityColumns}, description FROM ai_adapters WHERE ($1::uuid IS NULL OR id > $1::uuid) ORDER BY id LIMIT $2`,
        [input.cursor ?? null, input.limit],
      );
      return page(
        result.rows.map(mapAdapter),
        input.limit,
        (value) => value.id,
      );
    },
    async listSurfaces(input) {
      const result = await runtime.query<Row>(
        `SELECT ${identityColumns}, adapter_id AS "adapterId" FROM ai_surfaces WHERE adapter_id=$1 AND ($2::uuid IS NULL OR id > $2::uuid) ORDER BY id LIMIT $3`,
        [input.adapterId, input.cursor ?? null, input.limit],
      );
      return page(
        result.rows.map(mapSurface),
        input.limit,
        (value) => value.id,
      );
    },
    async listVariants(input) {
      const result = await runtime.query<Row>(
        `SELECT ${identityColumns}, surface_id AS "surfaceId" FROM ai_variants WHERE surface_id=$1 AND ($2::uuid IS NULL OR id > $2::uuid) ORDER BY id LIMIT $3`,
        [input.surfaceId, input.cursor ?? null, input.limit],
      );
      return page(
        result.rows.map(mapVariant),
        input.limit,
        (value) => value.id,
      );
    },
    async listProfiles(input) {
      const result = await runtime.query<Row>(
        `SELECT ${identityColumns}, adapter_id AS "adapterId", surface_id AS "surfaceId", variant_id AS "variantId" FROM adapter_profiles WHERE ($1::uuid IS NULL OR id > $1::uuid) AND ($2::uuid IS NULL OR adapter_id=$2) AND ($3::uuid IS NULL OR surface_id=$3) AND ($4::uuid IS NULL OR variant_id=$4) ORDER BY id LIMIT $5`,
        [
          input.cursor ?? null,
          input.adapterId ?? null,
          input.surfaceId ?? null,
          input.variantId ?? null,
          input.limit,
        ],
      );
      return page(
        result.rows.map(mapProfile),
        input.limit,
        (value) => value.id,
      );
    },
    async getProfile(id) {
      const result = await runtime.query<Row>(
        `SELECT ${identityColumns}, adapter_id AS "adapterId", surface_id AS "surfaceId", variant_id AS "variantId" FROM adapter_profiles WHERE id=$1`,
        [id],
      );
      return result.rows[0] ? mapProfile(result.rows[0]) : null;
    },
    async listProfileRevisions(input) {
      const result = await runtime.query<Row>(
        `SELECT ${revisionColumns} FROM adapter_profile_revisions WHERE profile_id=$1 AND ($2::uuid IS NULL OR id > $2::uuid) ORDER BY id LIMIT $3`,
        [input.profileId, input.cursor ?? null, input.limit],
      );
      return page(
        result.rows.map(mapRevision),
        input.limit,
        (value) => value.id,
      );
    },
    async getProfileRevision(input) {
      const result = await runtime.query<Row>(
        `SELECT ${revisionColumns} FROM adapter_profile_revisions WHERE profile_id=$1 AND revision=$2`,
        [input.profileId, input.revision],
      );
      return result.rows[0] ? mapRevision(result.rows[0]) : null;
    },
    async listAssignments(input) {
      const result = await runtime.query<Row>(
        `SELECT a.id, a.adapter_id AS "adapterId", a.surface_id AS "surfaceId", a.variant_id AS "variantId", a.browser_family AS "browserFamily", a.subject_kind AS "subjectKind", a.created_at AS "createdAt", (SELECT json_build_object('revision',r.revision,'mode',r.mode,'baselineProfileRevisionId',r.baseline_profile_revision_id,'candidateProfileRevisionId',r.candidate_profile_revision_id,'percentageBps',r.percentage_bps,'createdAt',r.created_at) FROM adapter_profile_assignment_revisions r WHERE r.assignment_id=a.id ORDER BY r.revision DESC LIMIT 1) AS latest FROM adapter_profile_assignments a WHERE ($1::uuid IS NULL OR a.id > $1::uuid) AND ($2::uuid IS NULL OR a.adapter_id=$2) AND ($3::uuid IS NULL OR a.surface_id=$3) AND ($4::uuid IS NULL OR a.variant_id=$4) AND ($5::text IS NULL OR a.browser_family=$5) AND ($6::text IS NULL OR a.subject_kind::text=$6) ORDER BY a.id LIMIT $7`,
        [
          input.cursor ?? null,
          input.adapterId ?? null,
          input.surfaceId ?? null,
          input.variantId ?? null,
          input.browserFamily ?? null,
          input.subjectKind ?? null,
          input.limit,
        ],
      );
      return page(
        result.rows.map(mapAssignment),
        input.limit,
        (value) => value.id,
      );
    },
    async getAssignment(id) {
      const result = await runtime.query<Row>(
        `SELECT a.id, a.adapter_id AS "adapterId", a.surface_id AS "surfaceId", a.variant_id AS "variantId", a.browser_family AS "browserFamily", a.subject_kind AS "subjectKind", a.created_at AS "createdAt", (SELECT json_build_object('revision',r.revision,'mode',r.mode,'baselineProfileRevisionId',r.baseline_profile_revision_id,'candidateProfileRevisionId',r.candidate_profile_revision_id,'percentageBps',r.percentage_bps,'createdAt',r.created_at) FROM adapter_profile_assignment_revisions r WHERE r.assignment_id=a.id ORDER BY r.revision DESC LIMIT 1) AS latest FROM adapter_profile_assignments a WHERE a.id=$1`,
        [id],
      );
      return result.rows[0] ? mapAssignment(result.rows[0]) : null;
    },
    async listAssignmentRevisions(input) {
      const result = await runtime.query<Row>(
        `SELECT id, assignment_id AS "assignmentId", revision, mode, baseline_profile_revision_id AS "baselineProfileRevisionId", candidate_profile_revision_id AS "candidateProfileRevisionId", percentage_bps AS "percentageBps", created_at AS "createdAt" FROM adapter_profile_assignment_revisions WHERE assignment_id=$1 AND ($2::uuid IS NULL OR id > $2::uuid) ORDER BY id LIMIT $3`,
        [input.assignmentId, input.cursor ?? null, input.limit],
      );
      return page(
        result.rows.map(mapAssignmentRevision),
        input.limit,
        (value) => value.id,
      );
    },
  };
}
