import { StatusCodes } from "http-status-codes";
import { AppError } from "../../../shared/errors/app-error.js";
import { organizationMembershipRepository } from "../repositories/organization-membership.repository.js";
import type { CreateOrganizationMembershipInput } from "../schemas/organization-membership.schema.js";

class OrganizationMembershipService {
  async createMembership(input: CreateOrganizationMembershipInput) {
    const existingMembership = await organizationMembershipRepository.findOne({
      where: {
        userId: input.userId,
        organizationId: input.organizationId,
      },
    });

    if (existingMembership) {
      throw new AppError({
        statusCode: StatusCodes.CONFLICT,
        message: "User is already a member of this organization",
      });
    }

    const membership = organizationMembershipRepository.create({
      userId: input.userId,
      organizationId: input.organizationId,
      branchId: input.branchId ?? null,
      role: input.role,
    });

    return organizationMembershipRepository.save(membership);
  }

  async getMembership(userId: string, organizationId: string) {
    return organizationMembershipRepository.findOne({
      where: {
        userId,
        organizationId,
      },
    });
  }
}

export const organizationMembershipService =
  new OrganizationMembershipService();
