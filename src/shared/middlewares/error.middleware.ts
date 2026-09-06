import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
type ErrorWithStatusCode = {
  statusCode?: number;
  code?: string;
  message?: string;
  details?: unknown;
  isOperational?: boolean;
};

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
};
