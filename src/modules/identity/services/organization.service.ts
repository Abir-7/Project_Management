import { StatusCodes } from "http-status-codes";
import { AppError } from "../../../shared/errors/app-error.js";
import { organizationRepository } from "../repositories/organization.repository.js";
import type { CreateOrganizationDto } from "../schemas/organization.schema.js";

export class OrganizationService {
  async createOrganization({ name, slug }: CreateOrganizationDto) {
    const existingOrganization = await organizationRepository.findOne({
      where: { slug },
    });

    if (existingOrganization) {
      throw new AppError({
        statusCode: StatusCodes.CONFLICT,
        message: "Organization with this slug already exists",
      });
    }

    const organization = organizationRepository.create({
      name,
      slug,
    });

    return organizationRepository.save(organization);
  }

  async getOrganizationById(id: string) {
    return organizationRepository.findOne({
      where: { id },
    });
  }
}
