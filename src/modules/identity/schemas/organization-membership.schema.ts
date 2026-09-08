import { z } from "zod";

export const createOrganizationMembershipSchema = z.object({
  userId: z.uuid(),
  organizationId: z.uuid(),
  branchId: z.uuid().nullable().optional(),
  role: z.string().min(1).max(50),
});

export type CreateOrganizationMembershipInput = z.infer<
  typeof createOrganizationMembershipSchema
>;
