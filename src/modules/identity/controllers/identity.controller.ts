import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { sendSuccess } from "../../../shared/utils/api-response.js";
import type { RegisterInput } from "../schemas/register.schema.js";
import { identityService } from "../services/identity.service.js";

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
}

export const identityController = new IdentityController();
