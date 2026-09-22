import type { CheckoutContext } from "../../../contracts/ports/payment-gateway.js";

export interface CreateCheckoutInput extends CheckoutContext {
  planCode: string;
}
