export interface CheckoutContext {
  userId: string;
  organizationName: string;
  organizationSlug: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionInput extends CheckoutContext {
  customerId?: string;
  priceId: string;
  planId: string;
}

export interface CreateCheckoutSessionResult {
  id: string;
  url: string | null;
}

export interface PaymentGateway {
  createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CreateCheckoutSessionResult>;
}
