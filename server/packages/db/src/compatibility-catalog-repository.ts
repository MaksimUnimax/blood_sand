import {
  BlockedExtensionVersionSchema,
  CompatibilityPolicyRevisionSchema,
  ExtensionReleaseSchema,
  ReleaseBrowserSupportSchema,
  ReleaseContractSupportSchema,
  type CompatibilityCatalogRepository,
} from "@product/compatibility";
import type { DatabaseQuery } from "./index";

export function createCompatibilityCatalogRepository(
  db: DatabaseQuery,
): CompatibilityCatalogRepository {
  return {
    async findExtensionRelease(version) {
      const r = await db.query(
        'SELECT id,version,release_channel AS "releaseChannel",artifact_sha256 AS "artifactSha256",released_at AS "releasedAt",created_at AS "createdAt" FROM extension_releases WHERE version=$1',
        [version],
      );
      return r.rows[0] ? ExtensionReleaseSchema.parse(r.rows[0]) : undefined;
    },
    async listReleaseContracts(releaseId) {
      const r = await db.query(
        'SELECT release_id AS "releaseId",contract_version AS "contractVersion" FROM extension_release_contracts WHERE release_id=$1 ORDER BY contract_version',
        [releaseId],
      );
      return r.rows.map((row) => ReleaseContractSupportSchema.parse(row));
    },
    async listReleaseBrowsers(releaseId) {
      const r = await db.query(
        'SELECT release_id AS "releaseId",browser_family AS "browserFamily" FROM extension_release_browsers WHERE release_id=$1 ORDER BY browser_family',
        [releaseId],
      );
      return r.rows.map((row) => ReleaseBrowserSupportSchema.parse(row));
    },
    async listCompatibilityPolicyRevisions(contractVersion) {
      const r = await db.query(
        'SELECT id,policy_key AS "policyKey",revision,contract_version AS "contractVersion",browser_family AS "browserFamily",minimum_extension_version AS "minimumExtensionVersion",recommended_extension_version AS "recommendedExtensionVersion",minimum_browser_version AS "minimumBrowserVersion",maintenance_mode AS "maintenanceMode",maintenance_code AS "maintenanceCode",published_at AS "publishedAt",created_at AS "createdAt" FROM compatibility_policy_revisions WHERE contract_version=$1 ORDER BY policy_key,revision',
        [contractVersion],
      );
      return r.rows.map((row) => CompatibilityPolicyRevisionSchema.parse(row));
    },
    async listBlockedVersions(policyRevisionId) {
      const r = await db.query(
        'SELECT policy_revision_id AS "policyRevisionId",extension_version AS "extensionVersion" FROM compatibility_policy_blocked_versions WHERE policy_revision_id=$1 ORDER BY extension_version',
        [policyRevisionId],
      );
      return r.rows.map((row) => BlockedExtensionVersionSchema.parse(row));
    },
  };
}
