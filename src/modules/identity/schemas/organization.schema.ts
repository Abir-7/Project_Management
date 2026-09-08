import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must not exceed 100 characters"),

  slug: z
    .string()
    .min(2, "Organization slug must be at least 2 characters")
    .max(100, "Organization slug must not exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
