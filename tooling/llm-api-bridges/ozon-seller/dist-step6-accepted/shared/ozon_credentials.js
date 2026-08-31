(() => {
  "use strict";
  function fail(code, message) {
    const error = new Error(message);
    error.code = code;
    throw error;
  }

  function normalizeHeaderCredential(value, name, { required = false } = {}) {
    const text = String(value ?? "").trim();
    if (!text) {
      if (required) fail(`MISSING_${name.toUpperCase()}`, `${name} не сохранён.`);
      return "";
    }
    for (let i = 0; i < text.length; i += 1) {
      const code = text.charCodeAt(i);
      if (code <= 0x1f || code === 0x7f) {
        fail(`INVALID_${name.toUpperCase()}`, `${name} содержит управляющий символ в позиции ${i + 1}.`);
      }
    }
    return text;
  }

  function normalizeSellerCredentials(input = {}, { required = false } = {}) {
    const clientId = normalizeHeaderCredential(input.clientId, "client_id", { required });
    const apiKey = normalizeHeaderCredential(input.apiKey, "api_key", { required });
    if ((clientId && !apiKey) || (!clientId && apiKey)) {
      fail("INCOMPLETE_SELLER_CREDENTIALS", "Client-Id и Api-Key должны быть сохранены вместе.");
    }
    return Object.freeze({ clientId, apiKey, present: Boolean(clientId && apiKey) });
  }

  function normalizePerformanceCredentials(input = {}, { required = false } = {}) {
    const clientId = normalizeHeaderCredential(input.clientId, "performance_client_id", { required });
    const clientSecret = normalizeHeaderCredential(input.clientSecret, "performance_client_secret", { required });
    if ((clientId && !clientSecret) || (!clientId && clientSecret)) {
      fail("INCOMPLETE_PERFORMANCE_CREDENTIALS", "Performance Client ID и Client Secret должны быть сохранены вместе.");
    }
    return Object.freeze({ clientId, clientSecret, present: Boolean(clientId && clientSecret) });
  }

  function sellerHeaders(credentials) {
    const normalized = normalizeSellerCredentials(credentials, { required: true });
    return Object.freeze({
      "Client-Id": normalized.clientId,
      "Api-Key": normalized.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json"
    });
  }

  function performanceTokenRequest(credentials) {
    const normalized = normalizePerformanceCredentials(credentials, { required: true });
    return Object.freeze({
      url: "https://api-performance.ozon.ru/api/client/token",
      method: "POST",
      headers: Object.freeze({
        "Content-Type": "application/json",
        Accept: "application/json"
      }),
      body: JSON.stringify({
        client_id: normalized.clientId,
        client_secret: normalized.clientSecret,
        grant_type: "client_credentials"
      }),
      host_alias: "performance_auth"
    });
  }

  function performanceBearerHeaders(accessToken) {
    const token = normalizeHeaderCredential(accessToken, "performance_access_token", { required: true });
    return Object.freeze({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json"
    });
  }

  function publicCredentialState(credentials) {
    const normalized = normalizeSellerCredentials(credentials, { required: false });
    return Object.freeze({
      seller_client_id_present: Boolean(normalized.clientId),
      seller_api_key_present: Boolean(normalized.apiKey),
      seller_credentials_present: normalized.present
    });
  }

  function publicPerformanceCredentialState(credentials) {
    const normalized = normalizePerformanceCredentials(credentials, { required: false });
    return Object.freeze({
      performance_client_id_present: Boolean(normalized.clientId),
      performance_client_secret_present: Boolean(normalized.clientSecret),
      performance_credentials_present: normalized.present
    });
  }

  globalThis.OzonCredentials = Object.freeze({
    normalizeSellerCredentials,
    normalizePerformanceCredentials,
    sellerHeaders,
    performanceTokenRequest,
    performanceBearerHeaders,
    publicCredentialState,
    publicPerformanceCredentialState
  });
})();
