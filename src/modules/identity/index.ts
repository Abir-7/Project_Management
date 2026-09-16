import { Router, type RequestHandler } from "express";

import authRouter from "./routes/auth.route.js";
import createOrganizationRouter from "./routes/organization.route.js";

import { User } from "./entities/user.js";
import { Organization } from "./entities/organization.js";
import { OrganizationMembership } from "./entities/organization-membership.js";
import { Branch } from "./entities/branch.js";
import { UserAuth } from "./entities/user-auth.js";
import { EmailVerificationToken } from "./entities/email-verification-token.js";

export { tenantService } from "./services/tenant.service.js";
export { identityEventHandlers } from "./events/event-handlers.js";

export const identityEntities = [
  Branch,
  Organization,
  User,
  UserAuth,
  OrganizationMembership,
  EmailVerificationToken,
];

const createIdentityRouter = (resolveTenantMiddleware: RequestHandler) => {
  const router = Router();

  router.use("/auth", authRouter);

  router.use(
    "/organizations",
    createOrganizationRouter(resolveTenantMiddleware),
  );

  return router;
};

export default createIdentityRouter;

