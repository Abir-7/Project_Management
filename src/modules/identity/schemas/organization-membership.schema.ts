import { z } from "zod";
import { ORGANIZATION_ROLES } from "../../../contracts/constants/organization-role.js";

export const organizationRoleSchema = z.enum(
  Object.values(ORGANIZATION_ROLES) as [
    (typeof ORGANIZATION_ROLES)[keyof typeof ORGANIZATION_ROLES],
    ...(typeof ORGANIZATION_ROLES)[keyof typeof ORGANIZATION_ROLES][],
  ],
);

export const createOrganizationMembershipSchema = z.object({
  userId: z.uuid(),
  organizationId: z.uuid(),
  branchId: z.uuid().nullable().optional(),
  role: organizationRoleSchema,
});

export type CreateOrganizationMembershipInput = z.infer<
  typeof createOrganizationMembershipSchema
>;
