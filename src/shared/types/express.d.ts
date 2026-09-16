import type { TenantContext } from "../../contracts/types/tenant-context.ts";
import { ORGANIZATION_ROLES } from "./../../contracts/constant/organization-role";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      tenant: TenantContext;
    }
  }
}
