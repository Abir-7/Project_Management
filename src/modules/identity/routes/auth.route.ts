import { Router } from "express";

import { validate } from "../../../shared/middlewares/validate.js";

import { verifyEmailSchema } from "../schemas/email-verification.schema.js";
import { asyncHandler } from "../../../shared/middlewares/async-handler.js";
import { registerSchema } from "../schemas/register.schema.js";
import { identityController } from "../controllers/identity.controller.js";
import { resendVerificationSchema } from "../schemas/resend-verification.schema.js";
import { loginSchema } from "../schemas/login.schema.js";
import { refreshTokenSchema } from "../schemas/refresh-token.schema.js";
import { authenticate } from "../../../shared/middlewares/authenticate.js";

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

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(identityController.login.bind(identityController)),
);

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  asyncHandler(identityController.refreshToken.bind(identityController)),
);

router.post(
  "/logout",
  authenticate,
  asyncHandler(identityController.logout.bind(identityController)),
);
export default router;
