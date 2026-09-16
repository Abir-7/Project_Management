import { AppDataSource } from "../../../bootstrap/data-source.js";
import { Organization } from "../entities/organization.js";

export const organizationRepository = AppDataSource.getRepository(Organization);
