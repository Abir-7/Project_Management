import type { Request, Response } from "express";
import type { CreateOrganizationDto } from "../schemas/organization.schema.js";
import { OrganizationService } from "../services/organization.service.js";
import { sendSuccess } from "../../../shared/utils/api-response.js";
import { StatusCodes } from "http-status-codes";

const organizationService = new OrganizationService();

export class OrganizationController {
  async createOrganization(req: Request, res: Response): Promise<void> {
    const { name, slug } = req.body as CreateOrganizationDto;
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
