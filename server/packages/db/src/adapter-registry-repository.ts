import {
  AdapterProfileSchema,
  AdapterRegistryRepository,
  AdapterSchema,
  PersistedProfileRevisionSchema,
  ProfileRevisionCreateInputSchema,
  SurfaceSchema,
  VariantSchema,
  profileRevisionFingerprint,
  type Adapter,
  type AdapterProfile,
  type PersistedProfileRevision,
  type ProfileRevisionCreateInput,
  type Surface,
  type Variant,
} from "@product/adapter-registry";
import type { DatabaseRuntime } from "./index.js";

type IdentityRow = {
  id: string;
  adapterId?: string;
  surfaceId?: string;
  variantId?: string | null;
  machineKey: string;
  displayName: string;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type RevisionRow = {
  id: string;
  profileId: string;
  adapterId: string;
  surfaceId: string;
  variantId: string | null;
  revision: number;
  schemaVersion: string;
  state: string;
  content: unknown;
  compatibility: unknown;
  contentSha256: string;
  createdAt: Date;
  publishedAt: Date | null;
  createdByAdminPrincipalId: string | null;
  publishedByAdminPrincipalId: string | null;
};

function mapAdapter(row: IdentityRow): Adapter {
  return AdapterSchema.parse(row);
}

function mapSurface(row: IdentityRow): Surface {
  return SurfaceSchema.parse(row);
}

function mapVariant(row: IdentityRow): Variant {
  return VariantSchema.parse(row);
}

function mapProfile(row: IdentityRow): AdapterProfile {
  return AdapterProfileSchema.parse(row);
}

function mapRevision(row: RevisionRow): PersistedProfileRevision {
  return PersistedProfileRevisionSchema.parse(row);
}

const revisionProjection =
  'SELECT id, profile_id AS "profileId", adapter_id AS "adapterId",' +
  ' surface_id AS "surfaceId", variant_id AS "variantId", revision,' +
  ' schema_version AS "schemaVersion", state, content,' +
  " compatibility_constraints AS compatibility," +
  ' content_sha256 AS "contentSha256", created_at AS "createdAt",' +
  ' published_at AS "publishedAt",' +
  ' created_by_admin_principal_id AS "createdByAdminPrincipalId",' +
  ' published_by_admin_principal_id AS "publishedByAdminPrincipalId"' +
  " FROM adapter_profile_revisions";

export function createAdapterRegistryRepository(
  runtime: DatabaseRuntime,
): AdapterRegistryRepository {
  return {
    async findAdapter(id) {
      const result = await runtime.query<IdentityRow>(
        'SELECT id, machine_key AS "machineKey", display_name AS "displayName",' +
          ' description, status, created_at AS "createdAt", updated_at AS "updatedAt"' +
          " FROM ai_adapters WHERE id = $1",
        [id],
      );
      const row = result.rows[0];
      return row ? mapAdapter(row) : undefined;
    },

    async findSurface(id) {
      const result = await runtime.query<IdentityRow>(
        'SELECT id, adapter_id AS "adapterId", machine_key AS "machineKey",' +
          ' display_name AS "displayName", status,' +
          ' created_at AS "createdAt", updated_at AS "updatedAt"' +
          " FROM ai_surfaces WHERE id = $1",
        [id],
      );
      const row = result.rows[0];
      return row ? mapSurface(row) : undefined;
    },

    async findVariant(id) {
      const result = await runtime.query<IdentityRow>(
        'SELECT id, surface_id AS "surfaceId", machine_key AS "machineKey",' +
          ' display_name AS "displayName", status,' +
          ' created_at AS "createdAt", updated_at AS "updatedAt"' +
          " FROM ai_variants WHERE id = $1",
        [id],
      );
      const row = result.rows[0];
      return row ? mapVariant(row) : undefined;
    },

    async findProfile(id) {
      const result = await runtime.query<IdentityRow>(
        'SELECT id, adapter_id AS "adapterId", surface_id AS "surfaceId",' +
          ' variant_id AS "variantId", machine_key AS "machineKey",' +
          ' display_name AS "displayName", status,' +
          ' created_at AS "createdAt", updated_at AS "updatedAt"' +
          " FROM adapter_profiles WHERE id = $1",
        [id],
      );
      const row = result.rows[0];
      return row ? mapProfile(row) : undefined;
    },

    async createProfileRevision(input: ProfileRevisionCreateInput) {
      const parsed = ProfileRevisionCreateInputSchema.parse(input);
      const contentSha256 = profileRevisionFingerprint(parsed);
      const result = await runtime.query<RevisionRow>(
        "INSERT INTO adapter_profile_revisions" +
          " (id, profile_id, adapter_id, surface_id, variant_id, revision," +
          " schema_version, state, content, compatibility_constraints," +
          " content_sha256, created_at, published_at," +
          " created_by_admin_principal_id, published_by_admin_principal_id)" +
          " VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11,$12,$13,$14,$15)" +
          ' RETURNING id, profile_id AS "profileId", adapter_id AS "adapterId",' +
          ' surface_id AS "surfaceId", variant_id AS "variantId", revision,' +
          ' schema_version AS "schemaVersion", state, content,' +
          " compatibility_constraints AS compatibility," +
          ' content_sha256 AS "contentSha256", created_at AS "createdAt",' +
          ' published_at AS "publishedAt",' +
          ' created_by_admin_principal_id AS "createdByAdminPrincipalId",' +
          ' published_by_admin_principal_id AS "publishedByAdminPrincipalId"',
        [
          parsed.id,
          parsed.profileId,
          parsed.adapterId,
          parsed.surfaceId,
          parsed.variantId,
          parsed.revision,
          parsed.schemaVersion,
          parsed.state,
          JSON.stringify(parsed.content),
          JSON.stringify(parsed.compatibility),
          contentSha256,
          parsed.createdAt,
          parsed.publishedAt,
          parsed.createdByAdminPrincipalId,
          parsed.publishedByAdminPrincipalId,
        ],
      );
      const row = result.rows[0];
      if (!row) throw new Error("ADAPTER_PROFILE_REVISION_INSERT_FAILED");
      return mapRevision(row);
    },

    async findProfileRevision(profileId, revision) {
      const result = await runtime.query<RevisionRow>(
        revisionProjection + " WHERE profile_id = $1 AND revision = $2",
        [profileId, revision],
      );
      const row = result.rows[0];
      return row ? mapRevision(row) : undefined;
    },
  };
}
