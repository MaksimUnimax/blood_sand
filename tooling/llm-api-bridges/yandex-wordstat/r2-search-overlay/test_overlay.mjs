import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("../reference-1.1.5/shared/wordstat_protocol.js");
const baseProtocol = globalThis.WordstatProtocol;
require("./yandex_search_protocol_overlay.js");
const protocol = globalThis.WordstatProtocol;

assert.ok(baseProtocol, "base Wordstat protocol must load");
assert.equal(protocol.SEARCH_PREFIX, "YANDEX_SEARCH_API_V1");
assert.equal(protocol.SEARCH_RESULT_PREFIX, "YANDEX_SEARCH_RESULT_V1");
assert.ok(protocol.METHODS.getTop, "Wordstat methods must remain available");
assert.ok(protocol.METHODS.webSearch, "webSearch must be allowlisted");
assert.ok(protocol.METHODS.genSearch, "genSearch must be allowlisted");

const legacy = protocol.parseCommand('WORDSTAT_API_V1 {"method":"getTop","phrase":"печать велеса","numPhrases":10,"regions":["225"],"devices":["DEVICE_ALL"]}');
assert.equal(legacy.method, "getTop");
assert.equal(legacy.phrase, "печать велеса");
const legacyRequest = protocol.buildRequest(legacy, "folder-test");
assert.equal(legacyRequest.url, "https://searchapi.api.cloud.yandex.net/v2/wordstat/topRequests");
assert.equal(legacyRequest.body.folderId, "folder-test");
const legacyReport = protocol.formatResultReport({ requestId: "legacy-id", command: legacy, httpStatus: 200, elapsedMs: 1, result: {} });
assert.ok(legacyReport.startsWith("WORDSTAT_RESULT_V1\n"), "Wordstat result prefix must remain unchanged");

const mobile = protocol.parseCommand('YANDEX_SEARCH_API_V1 {"method":"webSearch","phrase":"славянские обереги","region":"225","device":"DEVICE_PHONE","responseFormat":"FORMAT_XML","groupsOnPage":10}');
assert.deepEqual(mobile, {
  method: "webSearch",
  phrase: "славянские обереги",
  region: "225",
  device: "DEVICE_PHONE",
  responseFormat: "FORMAT_XML",
  groupsOnPage: 10
});
const mobileRequest = protocol.buildRequest(mobile, "folder-test");
assert.equal(mobileRequest.url, "https://searchapi.api.cloud.yandex.net/v2/web/search");
assert.equal(mobileRequest.body.query.searchType, "SEARCH_TYPE_RU");
assert.equal(mobileRequest.body.query.queryText, "славянские обереги");
assert.equal(mobileRequest.body.query.page, "0");
assert.equal(mobileRequest.body.query.fixTypoMode, "FIX_TYPO_MODE_ON");
assert.equal(mobileRequest.body.groupSpec.groupMode, "GROUP_MODE_FLAT");
assert.equal(mobileRequest.body.groupSpec.groupsOnPage, "10");
assert.equal(mobileRequest.body.groupSpec.docsInGroup, "1");
assert.equal(mobileRequest.body.region, "225");
assert.equal(mobileRequest.body.folderId, "folder-test");
assert.equal(mobileRequest.body.responseFormat, "FORMAT_XML");
assert.match(mobileRequest.body.userAgent, /Android/);
assert.match(mobileRequest.body.userAgent, /Mobile/);

const desktopHtml = protocol.parseCommand('YANDEX_SEARCH_API_V1 {"method":"webSearch","phrase":"оберег в машину","region":"225","device":"DEVICE_DESKTOP","responseFormat":"FORMAT_HTML","groupsOnPage":10}');
const desktopHtmlRequest = protocol.buildRequest(desktopHtml, "folder-test");
assert.equal(desktopHtmlRequest.body.responseFormat, "FORMAT_HTML");
assert.match(desktopHtmlRequest.body.userAgent, /Windows NT 10\.0/);
assert.equal(desktopHtmlRequest.body.query.fixTypoMode, undefined, "HTML must not receive unsupported fixTypoMode");
assert.equal(desktopHtmlRequest.body.groupSpec.groupMode, undefined, "HTML must not receive unsupported groupMode");
assert.equal(desktopHtmlRequest.body.groupSpec.docsInGroup, undefined, "HTML must not receive unsupported docsInGroup");

const gen = protocol.parseCommand('YANDEX_SEARCH_API_V1 {"method":"genSearch","phrase":"что означает печать велеса"}');
assert.deepEqual(gen, { method: "genSearch", phrase: "что означает печать велеса" });
const genRequest = protocol.buildRequest(gen, "folder-test");
assert.equal(genRequest.url, "https://searchapi.api.cloud.yandex.net/v2/gen/search");
assert.deepEqual(genRequest.body.messages, [{ content: "что означает печать велеса", role: "ROLE_USER" }]);
assert.equal(genRequest.body.folderId, "folder-test");
assert.equal(genRequest.body.searchType, "SEARCH_TYPE_RU");
assert.equal(genRequest.body.getPartialResults, false);
assert.equal(genRequest.body.fixMisspell, true);
assert.equal(genRequest.body.region, undefined, "GenSearch must not invent undocumented region control");
assert.equal(genRequest.body.userAgent, undefined, "GenSearch must not invent undocumented device control");

const searchReport = protocol.formatResultReport({ requestId: "search-id", command: mobile, httpStatus: 200, elapsedMs: 2, result: { rawData: "abc" } });
assert.ok(searchReport.startsWith("YANDEX_SEARCH_RESULT_V1\n"));
assert.match(searchReport, /"bridge": "yandex-search-manual-overlay"/);

assert.throws(
  () => protocol.parseCommand('YANDEX_SEARCH_API_V1 {"method":"webSearch","phrase":"x","device":"DEVICE_ALL"}'),
  (error) => error?.code === "INVALID_DEVICE"
);
assert.throws(
  () => protocol.parseCommand('YANDEX_SEARCH_API_V1 {"method":"genSearch","phrase":"x","region":"225"}'),
  (error) => error?.code === "UNSUPPORTED_GEN_SEARCH_FIELD"
);
assert.throws(
  () => protocol.parseCommand('YANDEX_SEARCH_API_V1 {"method":"fetch","phrase":"x"}'),
  (error) => error?.code === "UNSUPPORTED_METHOD"
);

console.log("Yandex Search overlay tests: PASS");
