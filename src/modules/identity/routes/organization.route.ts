import { Router, type Request, type Response } from "express";

import { asyncHandler } from "../../../shared/middlewares/async-handler.js";
import { sendSuccess } from "../../../shared/utils/api-response.js";

import { validate } from "../../../shared/middlewares/validate.js";
import { createOrganizationSchema } from "../schemas/organization.schema.js";
import { OrganizationController } from "../controllers/organization.controller.js";

const router = Router();

const organizationController = new OrganizationController();

router.post(
  "/",
  validate(createOrganizationSchema),
  asyncHandler(
    organizationController.createOrganization.bind(organizationController),
  ),
);

export default router;
