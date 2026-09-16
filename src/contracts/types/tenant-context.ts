import type { OrganizationRole } from "../types/organization-role.js";

export interface TenantContext {
  organizationId: string;
  membershipId: string;
  branchId: string | null;
  role: OrganizationRole;
}
