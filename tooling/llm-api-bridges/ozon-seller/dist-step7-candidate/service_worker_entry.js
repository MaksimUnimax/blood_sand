/* Multi-AI delivery bootstrap: capability policy must exist before the durable bridge model is imported. */
importScripts("shared/ai_delivery_capabilities.js");
importScripts("service_worker.js");
/* Attachment RPC intentionally uses a named runtime Port so the legacy catch-all onMessage listener cannot race its responses. */
importScripts("shared/file_delivery_port_worker.js");
