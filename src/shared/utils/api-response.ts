import type { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  options: {
    statusCode?: number;
    message?: string;
    data?: T;
  },
) => {
  return res.status(options.statusCode ?? 200).json({
    success: true,
    message: options.message ?? "Success",
    data: options.data ?? null,
  });
};
