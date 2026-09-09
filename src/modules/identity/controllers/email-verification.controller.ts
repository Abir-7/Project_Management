import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { sendSuccess } from "../../../shared/utils/api-response.js";
import { emailVerificationService } from "../services/email-verification.service.js";
import type { VerifyEmailInput } from "../schemas/email-verification.schema.js";

class EmailVerificationController {
  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.body as VerifyEmailInput;

    const result = await emailVerificationService.verifyEmail(token);

    sendSuccess(res, {
      data: result,
      statusCode: StatusCodes.OK,
      message: "Email verified successfully",
    });
  }
}

export const emailVerificationController = new EmailVerificationController();
