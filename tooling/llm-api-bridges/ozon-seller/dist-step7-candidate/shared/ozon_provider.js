(() => {
  "use strict";

  function findFirstField(value, keyName, depth = 0) {
    if (depth > 8 || value === null || value === undefined) return null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findFirstField(item, keyName, depth + 1);
        if (found !== null && found !== undefined) return found;
      }
      return null;
    }
    if (typeof value !== "object") return null;
    for (const [key, child] of Object.entries(value)) {
      if (String(key).toLowerCase() === String(keyName).toLowerCase()) return child;
      const found = findFirstField(child, keyName, depth + 1);
      if (found !== null && found !== undefined) return found;
    }
    return null;
  }

  function arrayCountForField(value, field) {
    const found = findFirstField(value, field);
    return Array.isArray(found) ? found.length : null;
  }

  function safeQuotaRateMeta(quota, retryAfter = null) {
    const source = quota && typeof quota === "object" ? quota : {};
    const output = {};
    if (source.family) output.quota_family = String(source.family).slice(0, 120);
    if (Number.isFinite(Number(source.min_interval_ms))) output.min_interval_ms = Math.max(0, Number(source.min_interval_ms || 0));
    if (Number.isFinite(Number(source.dispatched_at))) output.last_provider_request_at = Number(source.dispatched_at);
    if (Number.isFinite(Number(source.next_allowed_at))) output.next_allowed_at = Number(source.next_allowed_at);
    if (retryAfter) output.retry_after = String(retryAfter).slice(0, 160);
    output.automatic_retry = false;
    return Object.keys(output).length > 1 ? Object.freeze(output) : null;
  }

  function createOzonProvider({
    contract = globalThis.OzonContract,
    fetchImpl = globalThis.fetch,
    uuid = () => globalThis.crypto.randomUUID(),
    now = () => Date.now()
  } = {}) {
    let performanceToken = null;

    const reportFileRefs = new Map();
    const REPORT_FILE_REF_TTL_MS = 30 * 60 * 1000;
    const REPORT_FILE_REF_MAX = 128;

    function pruneReportFileRefs() {
      const current = Number(now());
      for (const [ref, record] of reportFileRefs.entries()) {
        if (!record || current - Number(record.created_at_ms || 0) > REPORT_FILE_REF_TTL_MS) reportFileRefs.delete(ref);
      }
      while (reportFileRefs.size > REPORT_FILE_REF_MAX) reportFileRefs.delete(reportFileRefs.keys().next().value);
    }

    function registerReportFile(rawUrl) {
      const trustedUrl = globalThis.ProviderTransportCore.normalizeTrustedReportFileUrl(rawUrl);
      pruneReportFileRefs();
      const token = String(uuid()).replace(/[^A-Za-z0-9_-]/g, "");
      const ref = `rpf_${token}`;
      reportFileRefs.set(ref, Object.freeze({ url: trustedUrl, created_at_ms: Number(now()) }));
      pruneReportFileRefs();
      return ref;
    }

    function resolveReportFileRef(ref) {
      pruneReportFileRefs();
      const record = reportFileRefs.get(String(ref || ""));
      if (!record) {
        const error = new Error("Report file ref неизвестен или истёк. Повторите report_info отдельной командой.");
        error.code = "REPORT_FILE_REF_NOT_FOUND";
        error.external_request_executed = false;
        throw error;
      }
      return record;
    }

    async function executeReportFileCommand(command) {
      const record = resolveReportFileRef(command.params.file_ref);
      const response = await globalThis.ProviderTransportCore.executeTrustedReportFileOnce({ fetchImpl, url: record.url, now, parseOptions: command.params });
      const request = Object.freeze({
        method: "GET", host_alias: "report_file", path: "/__opaque_report_file__", operation: "report_file_get",
        response_style: "binary", response_content_types: null
      });
      return { request, response, auth_request_performed: false };
    }


    function clearPerformanceToken() {
      performanceToken = null;
    }

    async function getPerformanceToken(rawPerformanceCredentials, { force = false } = {}) {
      const credentials = globalThis.OzonCredentials.normalizePerformanceCredentials(rawPerformanceCredentials, { required: true });
      const current = Number(now());
      if (!force && performanceToken?.access_token && current < Number(performanceToken.expires_at_ms || 0) - 30_000) {
        return Object.freeze({ access_token: performanceToken.access_token, expires_at_ms: performanceToken.expires_at_ms, auth_request_performed: false, http_status: 0 });
      }

      const tokenRequest = globalThis.OzonCredentials.performanceTokenRequest(credentials);
      const response = await globalThis.ProviderTransportCore.executePerformanceJsonOnce({ fetchImpl, request: tokenRequest, now });
      if (!response.ok) {
        clearPerformanceToken();
        const error = new Error(`Ozon Performance auth отклонён: HTTP ${response.httpStatus}.`);
        error.code = "PERFORMANCE_AUTH_FAILED";
        error.http_status = response.httpStatus;
        throw error;
      }
      const payload = response.parsed && typeof response.parsed === "object" ? response.parsed : {};
      const accessToken = String(payload.access_token || "").trim();
      const tokenType = String(payload.token_type || "Bearer").trim();
      const expiresIn = Number(payload.expires_in || 0);
      if (!accessToken || !/^Bearer$/i.test(tokenType) || !Number.isFinite(expiresIn) || expiresIn <= 0) {
        clearPerformanceToken();
        const error = new Error("Ozon Performance auth вернул некорректный token response.");
        error.code = "INVALID_PERFORMANCE_TOKEN_RESPONSE";
        error.http_status = response.httpStatus;
        throw error;
      }
      performanceToken = Object.freeze({
        access_token: accessToken,
        expires_at_ms: current + Math.max(1, Math.floor(expiresIn)) * 1000
      });
      return Object.freeze({ access_token: accessToken, expires_at_ms: performanceToken.expires_at_ms, auth_request_performed: true, http_status: response.httpStatus });
    }

    async function executeSellerCommand(command, rawCredentials) {
      const credentials = globalThis.OzonCredentials.normalizeSellerCredentials(rawCredentials, { required: true });
      const request = contract.buildRequest(command, globalThis.OzonCredentials.sellerHeaders(credentials));
      const response = await globalThis.ProviderTransportCore.executeJsonOnce({ fetchImpl, request, now });
      return { request, response, auth_request_performed: false };
    }

    async function resolveSellerCapability(rawCredentials) {
      try {
        const credentials = globalThis.OzonCredentials.normalizeSellerCredentials(rawCredentials, { required: true });
        const request = Object.freeze({
          url: `${contract.SELLER_API_BASE}/v1/seller/info`,
          method: "POST",
          headers: globalThis.OzonCredentials.sellerHeaders(credentials),
          body: undefined,
          operation: "__seller_capability_probe__",
          path: "/v1/seller/info",
          host_alias: "seller_api"
        });
        const response = await globalThis.ProviderTransportCore.executeJsonOnce({ fetchImpl, request, now });
        if (!response.ok) {
          const safeError = contract.safeErrorPayload(response.httpStatus, response.rawText, response.parsed);
          return Object.freeze({
            status: "unknown",
            subscription_type: "UNKNOWN",
            is_premium: null,
            probe_performed: true,
            probe_http_status: response.httpStatus,
            probe_error_code: safeError.code || "SELLER_CAPABILITY_PROBE_HTTP_ERROR"
          });
        }
        const payload = response.parsed && typeof response.parsed === "object" ? response.parsed : {};
        const subscription = payload.subscription && typeof payload.subscription === "object" && !Array.isArray(payload.subscription) ? payload.subscription : {};
        const rawType = String(subscription.type || "UNKNOWN").trim().toUpperCase();
        const allowedTypes = Array.isArray(contract.SELLER_SUBSCRIPTION_TYPES) ? contract.SELLER_SUBSCRIPTION_TYPES : [];
        const subscriptionType = allowedTypes.includes(rawType) ? rawType : "UNKNOWN";
        const known = subscriptionType !== "UNKNOWN";
        return Object.freeze({
          status: known ? "known" : "unknown",
          subscription_type: subscriptionType,
          is_premium: typeof subscription.is_premium === "boolean" ? subscription.is_premium : null,
          probe_performed: true,
          probe_http_status: response.httpStatus,
          probe_error_code: known ? null : "SELLER_CAPABILITY_SUBSCRIPTION_UNKNOWN"
        });
      } catch (error) {
        return Object.freeze({
          status: "unknown",
          subscription_type: "UNKNOWN",
          is_premium: null,
          probe_performed: true,
          probe_http_status: Number(error?.http_status || 0),
          probe_error_code: String(error?.code || "SELLER_CAPABILITY_PROBE_FAILED").slice(0, 160)
        });
      }
    }

    async function executePerformanceCommand(command, rawPerformanceCredentials) {
      const token = await getPerformanceToken(rawPerformanceCredentials);
      const request = contract.buildPerformanceRequest(command, globalThis.OzonCredentials.performanceBearerHeaders(token.access_token));
      const response = await globalThis.ProviderTransportCore.executePerformanceJsonOnce({ fetchImpl, request, now });
      if (response.httpStatus === 401) clearPerformanceToken();
      return { request, response, auth_request_performed: token.auth_request_performed === true };
    }

    async function executeCommandObject(commandInput, rawCredentials, rawPerformanceCredentials = {}, { reportCommand = null, planning = null, quota = null, onProviderResponse = null } = {}) {
      const command = contract.normalizeCommand(commandInput);
      const logicalCommand = reportCommand ? contract.normalizeCommand(reportCommand) : command;
      if (logicalCommand.operation !== command.operation) {
        const error = new Error("Logical и physical operation должны совпадать.");
        error.code = "PLANNED_OPERATION_MISMATCH";
        throw error;
      }
      const preflight = contract.preflightExecution(command);
      const provider = String(preflight.meta.provider || "seller_api");
      const execution = provider === "report_file"
        ? await executeReportFileCommand(command)
        : (provider === "performance_api"
          ? await executePerformanceCommand(command, rawPerformanceCredentials)
          : await executeSellerCommand(command, rawCredentials));
      const { request, response } = execution;
      let effectiveQuota = quota;
      if (typeof onProviderResponse === "function") {
        try { effectiveQuota = await onProviderResponse({ command, request, response, quota }) || quota; }
        catch (hookError) {
          hookError.code = hookError.code || "PROVIDER_QUOTA_RESPONSE_HOOK_FAILED";
          hookError.http_status = Number(response.httpStatus || 0);
          hookError.external_request_executed = true;
          hookError.response_meta = response.responseMeta;
          throw hookError;
        }
      }
      const requestId = String(uuid());
      const errorPayload = response.ok ? null : contract.safeErrorPayload(response.httpStatus, response.rawText, response.parsed);
      let result;
      if (response.ok) {
        try { contract.verifyProviderResponse(command, response.parsed ?? response.rawText); }
        catch (verificationError) {
          verificationError.code = verificationError.code || "PROVIDER_RESPONSE_CONTRACT_MISMATCH";
          verificationError.http_status = Number(response.httpStatus || 0);
          verificationError.external_request_executed = true;
          verificationError.response_meta = response.responseMeta;
          verificationError.rate_limit = safeQuotaRateMeta(effectiveQuota, response.responseMeta.retry_after);
          throw verificationError;
        }

        result = contract.sanitizeResult(command, response.parsed ?? response.rawText);
        if (command.operation === "report_info") {
          const rawFile = findFirstField(response.parsed, "file");
          if (typeof rawFile === "string" && rawFile.trim()) {
            const fileRef = registerReportFile(rawFile.trim());
            result = Object.freeze({ ...(result && typeof result === "object" && !Array.isArray(result) ? result : { result }), report_file_ref: fileRef });
          }
        }
      } else {
        result = { error: errorPayload };
      }
      const safePlanning = planning ? {
        ...planning,
        execution: {
          logical_command_fingerprint: contract.commandFingerprint(logicalCommand),
          physical_command_fingerprint: contract.commandFingerprint(command),
          command_transformed: contract.commandFingerprint(logicalCommand) !== contract.commandFingerprint(command)
        }
      } : null;
      const reportText = contract.formatResultReport({
        requestId,
        command: logicalCommand,
        requestMeta: {
          host_alias: request.host_alias,
          http_method: request.method,
          path_alias: logicalCommand.operation,
          external_request_executed: true,
          capability_probe_executed: planning?.capability?.probe_performed === true,
          capability_probe_http_status: Number(planning?.capability?.probe_http_status || 0)
        },
        httpStatus: response.httpStatus,
        result,
        elapsedMs: response.elapsedMs,
        pagination: null,
        rateLimit: safeQuotaRateMeta(effectiveQuota, response.responseMeta.retry_after),
        planning: safePlanning
      });
      return Object.freeze({
        ok: response.ok,
        request_id: requestId,
        operation: logicalCommand.operation,
        provider: request.host_alias,
        command_fingerprint: contract.commandFingerprint(logicalCommand),
        executed_command_fingerprint: contract.commandFingerprint(command),
        http_status: response.httpStatus,
        report_text: reportText,
        response_meta: response.responseMeta,
        result,
        elapsed_ms: Number(response.elapsedMs || 0),
        rate_limit: safeQuotaRateMeta(effectiveQuota, response.responseMeta.retry_after),
        auth_request_performed: execution.auth_request_performed === true
      });
    }

    async function executeCommand(commandText, rawCredentials, rawPerformanceCredentials = {}) {
      const command = contract.parseCommand(commandText);
      return executeCommandObject(command, rawCredentials, rawPerformanceCredentials);
    }

    async function testConnection(rawCredentials, probeCommandText = null) {
      const credentials = globalThis.OzonCredentials.normalizeSellerCredentials(rawCredentials, { required: true });
      if (probeCommandText) return executeCommand(probeCommandText, rawCredentials, {});
      const command = { operation: "roles", params: {} };
      const request = contract.buildRequest(command, globalThis.OzonCredentials.sellerHeaders(credentials));
      const response = await globalThis.ProviderTransportCore.executeJsonOnce({ fetchImpl, request, now });
      if (!response.ok) {
        const error = contract.safeErrorPayload(response.httpStatus, response.rawText, response.parsed);
        return Object.freeze({
          ok: false,
          code: error.code || "OZON_API_ERROR",
          message: `Ozon Seller API отклонил /v1/roles: HTTP ${response.httpStatus}.`,
          http_status: response.httpStatus,
          elapsed_ms: response.elapsedMs,
          response_meta: response.responseMeta
        });
      }
      const payload = response.parsed && typeof response.parsed === "object" ? response.parsed : {};
      const expiresAt = findFirstField(payload, "expires_at");
      const rolesCount = arrayCountForField(payload, "roles");
      const methodsCount = arrayCountForField(payload, "methods");
      return Object.freeze({
        ok: true,
        code: "CONNECTED",
        message: "Ozon Seller API доступен; credentials приняты методом /v1/roles.",
        http_status: response.httpStatus,
        elapsed_ms: response.elapsedMs,
        expires_at: typeof expiresAt === "string" ? expiresAt : null,
        roles_count: Number.isInteger(rolesCount) ? rolesCount : null,
        methods_count: Number.isInteger(methodsCount) ? methodsCount : null,
        response_meta: response.responseMeta
      });
    }

    async function testPerformanceConnection(rawPerformanceCredentials) {
      try {
        const token = await getPerformanceToken(rawPerformanceCredentials, { force: true });
        return Object.freeze({
          ok: true,
          code: "PERFORMANCE_CONNECTED",
          message: "Ozon Performance API credentials приняты сервисом авторизации. У Performance API нет аналога Seller /v1/roles в официальном OpenAPI.",
          http_status: Number(token.http_status || 200),
          token_expires_at_ms: token.expires_at_ms,
          auth_request_performed: true
        });
      } catch (error) {
        return Object.freeze({
          ok: false,
          code: String(error?.code || "PERFORMANCE_CONNECTION_TEST_FAILED"),
          message: String(error?.message || error || "Ozon Performance API auth failed"),
          http_status: Number(error?.http_status || 0),
          auth_request_performed: true
        });
      }
    }

    return Object.freeze({ executeCommand, executeCommandObject, resolveSellerCapability, testConnection, testPerformanceConnection, clearPerformanceToken });
  }

  const OzonProvider = createOzonProvider();
  globalThis.OzonProvider = OzonProvider;
  globalThis.OzonProviderFactory = Object.freeze({ createOzonProvider });
})();
