/* Multi-AI delivery bootstrap. Historical worker stays byte-unchanged; delivery policy wraps it additively. */
importScripts("shared/ai_delivery_capabilities.js");
importScripts("shared/mixed_batch_discovery.js");
importScripts("service_worker.js");
/* Successful direct binary provider responses are converted into durable opaque attachment refs without a second provider request. */
importScripts("shared/direct_binary_file_delivery_patch.js");
importScripts("shared/file_delivery_model_policy.js");
/* Attachment RPC uses a named runtime Port so the legacy catch-all onMessage listener cannot race responses. */
importScripts("shared/file_delivery_port_worker.js");
/* Storage changes wake only affected tabs; the Port remains the sole attachment RPC channel. */
importScripts("shared/file_delivery_wake_worker.js");