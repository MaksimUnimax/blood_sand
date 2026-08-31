'use strict';
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');
const tls = require('node:tls');
function hostOf(options) {
  if (typeof options === 'string') { try { return new URL(options).hostname; } catch { return ''; } }
  if (options instanceof URL) return options.hostname;
  if (options && typeof options === 'object') return options.hostname || options.host || '';
  return '';
}
function local(host) {
  host = String(host || '').replace(/^\[|\]$/g, '').split(':')[0].toLowerCase();
  return !host || host === 'localhost' || host === '127.0.0.1' || host === '::1';
}
function reject(kind, host) { throw new Error(`STEP7_REGRESSION_NETWORK_BLOCKED ${kind} ${host}`); }
const httpRequest = http.request;
http.request = function guardedHttpRequest(options, ...args) {
  const host = hostOf(options); if (!local(host)) reject('http', host); return httpRequest.call(this, options, ...args);
};
const httpGet = http.get;
http.get = function guardedHttpGet(options, ...args) {
  const host = hostOf(options); if (!local(host)) reject('http', host); return httpGet.call(this, options, ...args);
};
const httpsRequest = https.request;
https.request = function guardedHttpsRequest(options, ...args) {
  const host = hostOf(options); if (!local(host)) reject('https', host); return httpsRequest.call(this, options, ...args);
};
const httpsGet = https.get;
https.get = function guardedHttpsGet(options, ...args) {
  const host = hostOf(options); if (!local(host)) reject('https', host); return httpsGet.call(this, options, ...args);
};
const netConnect = net.connect;
net.connect = function guardedNetConnect(...args) {
  const options = args[0]; const host = typeof options === 'object' && options ? options.host || options.hostname : args[1];
  if (!local(host)) reject('net', host); return netConnect.apply(this, args);
};
net.createConnection = net.connect;
const tlsConnect = tls.connect;
tls.connect = function guardedTlsConnect(...args) {
  const options = args[0]; const host = typeof options === 'object' && options ? options.host || options.hostname : args[1];
  if (!local(host)) reject('tls', host); return tlsConnect.apply(this, args);
};
if (typeof globalThis.fetch === 'function') {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function guardedFetch(input, init) {
    const host = hostOf(input); if (!local(host)) reject('fetch', host); return originalFetch(input, init);
  };
}
