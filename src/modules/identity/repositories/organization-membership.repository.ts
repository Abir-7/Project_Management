import { AppDataSource } from "../../../bootstrap/data-source.js";
import { OrganizationMembership } from "../entities/organization-membership.js";

export const organizationMembershipRepository = AppDataSource.getRepository(
  OrganizationMembership,
);
