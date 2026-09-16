import { organizationMembershipRepository } from "../repositories/organization-membership.repository.js";

import type { TenantResolver } from "../../../contracts/ports/tenant-resolver.js";

class TenantService implements TenantResolver {
  async resolve(userId: string, organizationId: string) {
    const membership = await organizationMembershipRepository.findOne({
      where: {
        userId,
        organizationId,
        isActive: true,
      },
    });

    if (!membership) {
      return null;
    }

    return {
      organizationId: membership.organizationId,
      membershipId: membership.id,
      branchId: membership.branchId,
      role: membership.role,
    };
  }
}

export const tenantService = new TenantService();
