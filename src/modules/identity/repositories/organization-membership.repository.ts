import { AppDataSource } from "../../../shared/database/data-source.js";
import { OrganizationMembership } from "../entities/organization-membership.js";

export const organizationMembershipRepository = AppDataSource.getRepository(
  OrganizationMembership,
);
