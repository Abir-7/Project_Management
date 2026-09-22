import type Stripe from "stripe";

import type {
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResult,
  PaymentGateway,
} from "../../../../contracts/ports/payment-gateway.js";

import { stripeClient } from "./stripe.client.js";

export class StripePaymentGateway implements PaymentGateway {
  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CreateCheckoutSessionResult> {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",

      line_items: [
        {
          price: input.priceId,
          quantity: 1,
        },
      ],

      success_url: input.successUrl,
      cancel_url: input.cancelUrl,

      metadata: {
        userId: input.userId,
        planId: input.planId,
        organizationName: input.organizationName,
        organizationSlug: input.organizationSlug,
      },
      subscription_data: {
        metadata: {
          userId: input.userId,
          planId: input.planId,
        },
      },
    };

    if (input.customerId) {
      sessionParams.customer = input.customerId;
    }

    const session = await stripeClient.checkout.sessions.create(sessionParams);

    return {
      id: session.id,
      url: session.url,
    };
  }
}
