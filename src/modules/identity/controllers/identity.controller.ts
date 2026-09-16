import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { sendSuccess } from "../../../shared/utils/api-response.js";
import type { RegisterInput } from "../schemas/register.schema.js";
import { identityService } from "../services/identity.service.js";
import type { VerifyEmailInput } from "../schemas/email-verification.schema.js";
import type { LoginInput } from "../schemas/login.schema.js";
import type { RefreshTokenInput } from "../schemas/refresh-token.schema.js";

import { AppError } from "../../../shared/errors/app-error.js";

class IdentityController {
  async register(req: Request, res: Response): Promise<void> {
    const input = req.body as RegisterInput;

    const user = await identityService.register(input);

    sendSuccess(res, {
      data: user,
      statusCode: StatusCodes.CREATED,
      message: "Account registered successfully",
    });
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.query as VerifyEmailInput;
    const result = await identityService.verifyEmail(token);

    sendSuccess(res, {
      data: result,
      statusCode: StatusCodes.OK,
      message: "Account verified successfully",
    });
  }
  async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    const result = await identityService.resendVerificationEmail(req.body);
    sendSuccess(res, {
      data: result,
      statusCode: StatusCodes.OK,
      message: result.message,
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const input = req.body as LoginInput;
    const result = await identityService.login(input);
    sendSuccess(res, {
      data: result,
      statusCode: StatusCodes.OK,
      message: "Login successful",
    });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const input = req.body as RefreshTokenInput;

    const result = await identityService.refreshToken(input);

    sendSuccess(res, {
      data: result,
      statusCode: StatusCodes.OK,
      message: "Token refreshed successfully",
    });
  }
  async logout(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Authentication required",
      });
    }
    const userId = req.user.userId;
    const result = await identityService.logout(userId);
    sendSuccess(res, {
      data: null,
      statusCode: StatusCodes.OK,
      message: result.message,
    });
  }
}

export const identityController = new IdentityController();
