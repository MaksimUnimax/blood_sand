(() => {
  "use strict";

  function makeError(code, message, extra = {}) {
    const error = new Error(message || code);
    error.code = code;
    Object.assign(error, extra);
    return error;
  }

  function create({ provider, protocol, transport, runtimeModel, storage, storageKey, getCredentials, workerSessionId,
                    makeId = () => crypto.randomUUID(), now = Date.now, maxResponseBytes, timeoutMs }) {
    if (!protocol || !transport || !runtimeModel || !storage) throw makeError("INVALID_CORE_CONFIG", "Core dependencies missing.");
    const providerName = String(provider || "").trim();
    if (!providerName) throw makeError("INVALID_CORE_CONFIG", "provider missing.");
    const key = String(storageKey || `${providerName}_operations`);
    const session = String(workerSessionId || "").trim();
    if (!session) throw makeError("INVALID_CORE_CONFIG", "workerSessionId missing.");
    if (typeof getCredentials !== "function") throw makeError("INVALID_CORE_CONFIG", "getCredentials missing.");

    let writeTail = Promise.resolve();
    function withWrite(fn) {
      const run = writeTail.then(fn, fn);
      writeTail = run.catch(() => {});
      return run;
    }
    async function readMap() {
      const raw = await storage.get(key);
      const value = raw?.[key];
      return value && typeof value === "object" && !Array.isArray(value) ? structuredClone(value) : {};
    }
    async function writeMap(map) { await storage.set({ [key]: map }); }
    async function getOperation(conversationKey) { return (await readMap())[String(conversationKey || "")] || null; }

    async function claimOperation({ conversationKey, tabId, requestId, command }) {
      return withWrite(async () => {
        const map = await readMap();
        const existing = map[conversationKey] || null;
        const operationId = makeId();
        const decision = runtimeModel.claim(existing, {
          operationId,
          requestId,
          provider: providerName,
          conversationKey,
          tabId,
          commandFingerprint: protocol.commandFingerprint(command),
          normalizedCommand: command,
          workerSessionId: session
        }, { now });
        if (!decision.granted) return decision;
        map[conversationKey] = decision.operation;
        await writeMap(map);
        return decision;
      });
    }

    async function mutateMatching(conversationKey, operationId, mutator) {
      return withWrite(async () => {
        const map = await readMap();
        const current = map[conversationKey] || null;
        if (!current || current.operation_id !== operationId) throw makeError("OPERATION_STALE", "Operation ownership changed.");
        const next = mutator(current);
        map[conversationKey] = next;
        await writeMap(map);
        return next;
      });
    }

    function providerResultBody(network) {
      if (network.body?.kind === "BINARY") {
        return {
          bridge_binary: true,
          content_type: network.body.contentType,
          byte_length: network.body.byteLength,
          error: "BINARY_ARTIFACT_HANDLER_REQUIRED"
        };
      }
      if (network.body?.parsed !== null && network.body?.parsed !== undefined) return network.body.parsed;
      return { bridge_raw_text: String(network.body?.rawText || "") };
    }

    async function execute({ commandText, conversationKey, tabId, requestId, outgoingPrefix = "" }) {
      const conv = String(conversationKey || "").trim();
      const rid = String(requestId || "").trim();
      if (!conv) throw makeError("CONVERSATION_KEY_MISSING", "conversationKey missing.");
      if (!rid) throw makeError("REQUEST_ID_MISSING", "requestId missing.");
      const command = protocol.parseCommand(commandText);
      const claimed = await claimOperation({ conversationKey: conv, tabId, requestId: rid, command });
      if (!claimed.granted) throw makeError(claimed.code, claimed.code, { operation: claimed.operation, duplicate: claimed.duplicate });
      const opId = claimed.operation.operation_id;

      try {
        // Credentials are loaded only after durable claim. They never enter stored operation/command.
        const credentials = await getCredentials();
        let request = protocol.buildRequest(command);
        request = protocol.attachCredentials(request, credentials);
        const network = await transport.executeOne(request, { timeoutMs, maxResponseBytes, now });
        const result = providerResultBody(network);
        const reportText = protocol.formatResultReport({
          requestId: rid,
          command,
          httpStatus: network.status,
          result,
          elapsedMs: network.elapsedMs,
          rateLimit: network.rateLimit
        });
        const prefix = String(outgoingPrefix || "").trim();
        const outgoingText = prefix ? `${prefix}\n\n${reportText}` : reportText;
        const deliveryId = makeId();
        const delivering = await mutateMatching(conv, opId, current => runtimeModel.markDelivering(current, {
          deliveryId,
          reportText,
          outgoingText,
          httpStatus: network.status,
          elapsedMs: network.elapsedMs
        }, { now }));
        return Object.freeze({
          ok: true,
          operation_id: delivering.operation_id,
          request_id: delivering.request_id,
          delivery_id: delivering.delivery_id,
          report_text: delivering.report_text,
          outgoing_text: delivering.outgoing_text,
          http_status: delivering.http_status,
          elapsed_ms: delivering.elapsed_ms
        });
      } catch (error) {
        const code = String(error?.code || "PROVIDER_EXECUTION_FAILED");
        const outcomeUnknown = code === "NETWORK_ERROR" || code === "REQUEST_TIMEOUT";
        try {
          await mutateMatching(conv, opId, current => runtimeModel.markFailed(current, {
            code,
            message: String(error?.message || code),
            outcomeUnknown
          }, { now }));
        } catch (markError) {
          if (markError?.code !== "OPERATION_STALE") throw markError;
        }
        throw error;
      }
    }

    async function completeDelivery({ conversationKey, operationId, deliveryId, confirmedTurnId = null }) {
      const conv = String(conversationKey || "").trim();
      return mutateMatching(conv, String(operationId || ""), current => {
        if (current.delivery_id !== String(deliveryId || "")) throw makeError("DELIVERY_ID_MISMATCH", "deliveryId mismatch.");
        return runtimeModel.markCompleted(current, { confirmedTurnId }, { now });
      });
    }

    async function failDelivery({ conversationKey, operationId, deliveryId, code = "DELIVERY_FAILED", message = "Delivery failed" }) {
      const conv = String(conversationKey || "").trim();
      return mutateMatching(conv, String(operationId || ""), current => {
        if (current.delivery_id !== String(deliveryId || "")) throw makeError("DELIVERY_ID_MISMATCH", "deliveryId mismatch.");
        return runtimeModel.markFailed(current, { code, message, outcomeUnknown: false }, { now });
      });
    }

    async function recoverConversation({ conversationKey, candidateTabId, liveOwnerTabId = null }) {
      const conv = String(conversationKey || "").trim();
      return withWrite(async () => {
        const map = await readMap();
        let op = map[conv] || null;
        if (!op) return Object.freeze({ action: "none" });
        const recovered = runtimeModel.recoverAfterWorkerStart(op, session, { now });
        if (recovered.operation && recovered.operation !== op) {
          op = recovered.operation;
          map[conv] = op;
          await writeMap(map);
        }
        if (recovered.action !== "recover_delivery") return recovered;
        const owner = runtimeModel.ownerDecision(op, { candidateTabId, liveOwnerTabId, candidateConversationKey: conv });
        if (!owner.owner) return Object.freeze({ action: owner.reason, operation: op });
        if (owner.rebound) {
          op = runtimeModel.rebindOwner(op, candidateTabId, { now });
          map[conv] = op;
          await writeMap(map);
        }
        return Object.freeze({ action: "recover_delivery", rebound: owner.rebound, operation: op, recovery: Object.freeze({
          operation_id: op.operation_id,
          request_id: op.request_id,
          provider: op.provider,
          conversation_key: op.conversation_key,
          delivery_id: op.delivery_id,
          outgoing_text: op.outgoing_text,
          report_text: op.report_text
        }) });
      });
    }

    return Object.freeze({ execute, completeDelivery, failDelivery, recoverConversation, getOperation });
  }

  globalThis.LLMProviderExecutionCore = Object.freeze({ create });
})();
