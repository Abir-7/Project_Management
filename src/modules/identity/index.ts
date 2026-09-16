import { Router, type RequestHandler } from "express";

import authRouter from "./routes/auth.route.js";
import createOrganizationRouter from "./routes/organization.route.js";

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
