import { z } from "zod";

export const createCheckoutSchema = z.object({
  planCode: z.string().min(1),

  organizationName: z.string().trim().min(2).max(100),

  organizationSlug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Organization slug must contain only lowercase letters, numbers, and hyphens",
    ),

  successUrl: z.url(),

  cancelUrl: z.url(),
});

export type CreateCheckoutSchemaInput = z.infer<typeof createCheckoutSchema>;
