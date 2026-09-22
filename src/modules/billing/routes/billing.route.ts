import { Router } from "express";

import { authenticate } from "../../../shared/middlewares/authenticate.js";
import { validate } from "../../../shared/middlewares/validate.js";
import { asyncHandler } from "../../../shared/middlewares/async-handler.js";

import { billingController } from "../controllers/billing.controller.js";
import { createCheckoutSchema } from "../schemas/create-checkout-session.schema.js";

const router = Router();

router.post(
  "/checkout",
  authenticate,
  validate(createCheckoutSchema),
  asyncHandler(billingController.createCheckoutSession.bind(billingController)),
);

export default router;
