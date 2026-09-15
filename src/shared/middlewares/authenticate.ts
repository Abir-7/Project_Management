import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import { AppError } from "../errors/app-error.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(
      new AppError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Authentication required",
      }),
    );
    return;
  }

  const token = authorization.slice(7);

  try {
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
    };

    next();
  } catch {
    next(
      new AppError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Invalid or expired access token",
      }),
    );
  }
};
