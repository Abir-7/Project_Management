import { ORGANIZATION_ROLES } from "../../constants/organization-role";

interface ITenant {
  organizationId: string;
  membershipId: string;
  branchId: string | null;
  role: ORGANIZATION_ROLES;
}

export interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      tenant: ITenant;
    }
  }
}
