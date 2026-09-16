import { ORGANIZATION_ROLES } from "../constants/organization-role.js";

export type OrganizationRole =
  (typeof ORGANIZATION_ROLES)[keyof typeof ORGANIZATION_ROLES];
