import {
  type AdminSubscriptionCommandPort,
  type AdminSubscriptionCommandInput,
  type AdminSubscriptionCommandResult,
} from "@product/admin-billing";
import type { AdminPermission } from "@product/admin-auth";
import {
  authorizeAdminMutationInTransaction,
  AdminMutationAuthorizationError,
} from "./admin-mutation-authorization.js";
import {
  createP5SubscriptionRepository,
  type P5SubscriptionMutationOperation,
} from "./p5-subscription-repository.js";
import type { DatabaseRuntime } from "./index.js";

const permissions: Record<P5SubscriptionMutationOperation, AdminPermission> = {
  GRANT: "subscription.grant",
  EXTEND: "subscription.extend",
  SUSPEND: "subscription.suspend",
  RESTORE: "subscription.restore",
};

class AdminAccountBindingError extends Error {
  public readonly code = "ADMIN_RESOURCE_NOT_FOUND" as const;
}

export function createP6AdminSubscriptionCommandAdapter(
  runtime: DatabaseRuntime,
): AdminSubscriptionCommandPort {
  async function invoke(
    input: AdminSubscriptionCommandInput,
  ): Promise<AdminSubscriptionCommandResult> {
    const operation = input.operation;
    const repository = createP5SubscriptionRepository(runtime, {
      beforeMutation: async ({ tx, accountId }) => {
        await authorizeAdminMutationInTransaction(
          tx,
          input.actorId,
          permissions[operation],
        );
        if (accountId !== input.accountId) throw new AdminAccountBindingError();
      },
    });
    const context = {
      actorType: "ADMIN" as const,
      actorId: input.actorId,
      correlationId: input.correlationId,
      reason: input.reason,
    };
    try {
      if (operation === "GRANT")
        return await repository.grantSubscription(
          {
            accountId: input.accountId,
            planRevisionId: input.planRevisionId,
            currentPeriodEnd: input.currentPeriodEnd,
          },
          context,
        );
      if (operation === "EXTEND")
        return await repository.extendSubscription(
          {
            subscriptionId: input.subscriptionId,
            expectedStateRevision: input.expectedStateRevision,
            newCurrentPeriodEnd: input.newCurrentPeriodEnd,
          },
          context,
        );
      if (operation === "SUSPEND")
        return await repository.suspendSubscription(
          {
            subscriptionId: input.subscriptionId,
            expectedStateRevision: input.expectedStateRevision,
          },
          context,
        );
      return await repository.restoreSubscription(
        {
          subscriptionId: input.subscriptionId,
          expectedStateRevision: input.expectedStateRevision,
        },
        context,
      );
    } catch (error) {
      if (error instanceof AdminMutationAuthorizationError)
        return { kind: "ADMIN_FORBIDDEN" };
      if (error instanceof AdminAccountBindingError)
        return { kind: "ADMIN_RESOURCE_NOT_FOUND" };
      throw error;
    }
  }

  return {
    grant: (input) => invoke({ ...input, operation: "GRANT" }),
    extend: (input) => invoke({ ...input, operation: "EXTEND" }),
    suspend: (input) => invoke({ ...input, operation: "SUSPEND" }),
    restore: (input) => invoke({ ...input, operation: "RESTORE" }),
  };
}
