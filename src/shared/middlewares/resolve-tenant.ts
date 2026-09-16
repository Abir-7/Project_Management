import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import type { TenantResolver } from "../../contracts/ports/tenant-resolver.js";
import { AppError } from "../errors/app-error.js";

const organizationIdSchema = z.uuid();

export const createResolveTenant = (
  tenantResolver: TenantResolver,
): RequestHandler => {
  return async (req, _res, next) => {
    try {
      const organizationId = req.header("X-Organization-Id");

      if (!organizationId) {
        throw new AppError({
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Organization ID is required",
        });
      }

      const parsedOrganizationId =
        organizationIdSchema.safeParse(organizationId);

      if (!parsedOrganizationId.success) {
        throw new AppError({
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Invalid organization ID",
        });
      }

      if (!req.user) {
        throw new AppError({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "Authentication required before organization resolution",
        });
      }

      const tenant = await tenantResolver.resolve(
        req.user.userId,
        parsedOrganizationId.data,
      );

      if (!tenant) {
        throw new AppError({
          statusCode: StatusCodes.FORBIDDEN,
          message: "You do not have access to this organization",
        });
      }

      req.tenant = tenant;

      next();
    } catch (error) {
      next(error);
    }
  };
};
