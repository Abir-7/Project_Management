import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { billingService } from "../container.js";

export class BillingController {
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    const result = await billingService.createCheckoutSession({
      userId: req.user!.userId,
      planCode: req.body.planCode,
      organizationName: req.body.organizationName,
      organizationSlug: req.body.organizationSlug,
      successUrl: req.body.successUrl,
      cancelUrl: req.body.cancelUrl,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  }
}

export const billingController = new BillingController();
