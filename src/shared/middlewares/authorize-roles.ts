import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import { AppError } from "../errors/app-error.js";

export const authorizeRoles = (...allowedRoles: string[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.tenant) {
      next(
        new AppError({
          statusCode: StatusCodes.FORBIDDEN,
          message: "Organization context is required",
        }),
      );
      return;
    }

    if (!allowedRoles.includes(req.tenant.role)) {
      next(
        new AppError({
          statusCode: StatusCodes.FORBIDDEN,
          message: "You do not have permission to perform this action",
        }),
      );
      return;
    }

    next();
  };
};
