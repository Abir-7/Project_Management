import { BillingService } from "./services/billing.service.js";

import { StripePaymentGateway } from "./infrastructure/stripe/stripe-payment.gateway.js";

const paymentGateway = new StripePaymentGateway();

export const billingService = new BillingService(paymentGateway);
