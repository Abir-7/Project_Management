import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { AppError } from "../errors/app-error.js";
import { organizationMembershipRepository } from "../../modules/identity/repositories/organization-membership.repository.js";

const organizationIdSchema = z.string();

export const resolveTenant: RequestHandler = async (req, _res, next) => {
  try {
    const organizationId = req.header("X-Organization-Id");

    if (!organizationId) {
      throw new AppError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Organization ID is required",
      });
    }

    const parsedOrganizationId = organizationIdSchema.safeParse(organizationId);

    if (!parsedOrganizationId.success) {
      throw new AppError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid organization ID",
      });
    }

    const membership = await organizationMembershipRepository.findOne({
      where: {
        userId: req.user.userId,
        organizationId: parsedOrganizationId.data,
        isActive: true,
      },
    });

    if (!membership) {
      throw new AppError({
        statusCode: StatusCodes.FORBIDDEN,
        message: "You do not have access to this organization",
      });
    }

    req.tenant = {
      organizationId: membership.organizationId,
      membershipId: membership.id,
      branchId: membership.branchId,
      role: membership.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
