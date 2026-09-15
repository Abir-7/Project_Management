export const ORGANIZATION_ROLES = {
  OWNER: "owner",
  HR: "hr",
  SUPERVISOR: "supervisor",
  LEADER: "leader",
  EMPLOYEE: "employee",
} as const;

export type OrganizationRole =
  (typeof ORGANIZATION_ROLES)[keyof typeof ORGANIZATION_ROLES];
