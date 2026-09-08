/* Multi-AI delivery bootstrap: capability policy must exist before the durable bridge model is imported. */
importScripts("shared/ai_delivery_capabilities.js");
importScripts("service_worker.js");
/* Attachment RPC intentionally uses a named runtime Port so the legacy catch-all onMessage listener cannot race its responses. */
importScripts("shared/file_delivery_port_worker.js");
/* Wake attachment owners only after storage state changes; this bridges claimDelivery(attachment_watch_v1) to the content-side Port runtime. */
importScripts("shared/file_delivery_wake_worker.js");
