// src/modules/billing/services/billing.service.ts

import { StatusCodes } from "http-status-codes";

import type { PaymentGateway } from "../../../contracts/ports/payment-gateway.js";
import { AppError } from "../../../shared/errors/app-error.js";

import { planRepository } from "../repositories/plan.repository.js";
import type { CreateCheckoutInput } from "../types/create-checkout.js";

export class BillingService {
  constructor(private readonly paymentGateway: PaymentGateway) {}

  async createCheckoutSession(input: CreateCheckoutInput) {
    const plan = await planRepository.findOne({
      where: {
        code: input.planCode,
        isActive: true,
      },
    });

    if (!plan) {
      throw new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Plan not found",
      });
    }

    const session = await this.paymentGateway.createCheckoutSession({
      priceId: plan.stripePriceId,
      userId: input.userId,
      planId: plan.id,
      organizationName: input.organizationName,
      organizationSlug: input.organizationSlug,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  }
}
