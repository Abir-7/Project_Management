import type { Request, Response } from "express";

import { sendSuccess } from "../../../shared/utils/api-response.js";
import { StatusCodes } from "http-status-codes";
import type { CreateOrganizationInput } from "../schemas/organization.schema.js";
import { organizationService } from "../services/organization.service.js";

class OrganizationController {
  async createOrganization(req: Request, res: Response): Promise<void> {
    const { name, slug } = req.body as CreateOrganizationInput;
    const organization = await organizationService.createOrganization({
      name,
      slug,
    });
    sendSuccess(res, {
      data: organization,
      statusCode: StatusCodes.CREATED,
      message: "Organization created successfully",
    });
  }
}

export const organizationController = new OrganizationController();
