import { z } from "zod";

export const createBranchSchema = z.object({
  organizationId: z.uuid(),
  name: z.string().min(2).max(100),
  address: z.string().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
