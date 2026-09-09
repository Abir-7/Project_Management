import { Router } from "express";

import { validate } from "../../../shared/middlewares/validate.js";

import { emailVerificationController } from "../controllers/email-verification.controller.js";
import { verifyEmailSchema } from "../schemas/email-verification.schema.js";
import { asyncHandler } from "../../../shared/middlewares/async-handler.js";
import { registerSchema } from "../schemas/register.schema.js";
import { identityController } from "../controllers/identity.controller.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(identityController.register.bind(identityController)),
);

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  asyncHandler(
    emailVerificationController.verifyEmail.bind(emailVerificationController),
  ),
);

export default router;
