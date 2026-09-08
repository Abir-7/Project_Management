import { AppDataSource } from "../../../shared/database/data-source.js";
import { Organization } from "../entities/organization.js";

export const organizationRepository = AppDataSource.getRepository(Organization);
