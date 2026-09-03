import { z } from "zod";

/** Public contract convention: names use a V1 suffix until a breaking version is introduced. */
export const CorrelationIdV1Schema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/);
export type CorrelationIdV1 = z.infer<typeof CorrelationIdV1Schema>;

export const ApiErrorCodeV1Schema = z.enum([
  "INTERNAL_ERROR",
  "INVALID_REQUEST",
  "SERVICE_UNAVAILABLE",
]);
export type ApiErrorCodeV1 = z.infer<typeof ApiErrorCodeV1Schema>;

export const ApiErrorEnvelopeV1Schema = z.object({
  error: z.object({
    code: ApiErrorCodeV1Schema,
    message: z.string().min(1),
    correlationId: CorrelationIdV1Schema,
  }),
});
export type ApiErrorEnvelopeV1 = z.infer<typeof ApiErrorEnvelopeV1Schema>;

/** Public health responses exposed by the P1 API foundation. */
export const HealthLiveResponseV1Schema = z.object({
  status: z.literal("live"),
});
export type HealthLiveResponseV1 = z.infer<typeof HealthLiveResponseV1Schema>;

export const HealthReadyResponseV1Schema = z.object({
  status: z.literal("ready"),
});
export type HealthReadyResponseV1 = z.infer<typeof HealthReadyResponseV1Schema>;
