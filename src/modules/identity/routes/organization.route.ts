import { Router, type RequestHandler } from "express";

import { asyncHandler } from "../../../shared/middlewares/async-handler.js";
import { validate } from "../../../shared/middlewares/validate.js";
import { authenticate } from "../../../shared/middlewares/authenticate.js";

import { createOrganizationSchema } from "../schemas/organization.schema.js";
import { organizationController } from "../controllers/organization.controller.js";

const createOrganizationRouter = (resolveTenantMiddleware: RequestHandler) => {
  const router = Router();

  router.post(
    "/",
    authenticate,
    resolveTenantMiddleware,
    validate(createOrganizationSchema),
    asyncHandler(
      organizationController.createOrganization.bind(organizationController),
    ),
  );

  return router;
};

export default createOrganizationRouter;
