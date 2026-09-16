import { ORGANIZATION_ROLES } from "../../constants/organization-role";
import type { JwtPayload } from "../utils/jwt.ts";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;

      tenant: {
        organizationId: string;
        membershipId: string;
        branchId: string | null;
        role: ORGANIZATION_ROLES;
      };
    }
  }
}
