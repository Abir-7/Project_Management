import type { JwtPayload } from "../utils/jwt.ts";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;

      tenant: {
        organizationId: string;
        membershipId: string;
        branchId: string | null;
        role: string;
      };
    }
  }
}
