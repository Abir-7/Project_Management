import Stripe from "stripe";

import { env } from "../../../../shared/config/index.js";

export const stripeClient = new Stripe(env.stripe.secretKey as string);
