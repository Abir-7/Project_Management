import { Router } from "express";

import { validate } from "../../../shared/middlewares/validate.js";

import { verifyEmailSchema } from "../schemas/email-verification.schema.js";
import { asyncHandler } from "../../../shared/middlewares/async-handler.js";
import { registerSchema } from "../schemas/register.schema.js";
import { identityController } from "../controllers/identity.controller.js";
import { resendVerificationSchema } from "../schemas/resend-verification.schema.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(identityController.register.bind(identityController)),
);

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  asyncHandler(identityController.verifyEmail.bind(identityController)),
);

router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  asyncHandler(
    identityController.resendVerificationEmail.bind(identityController),
  ),
);
export default router;
