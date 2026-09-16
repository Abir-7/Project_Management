import type { TenantContext } from "../../contracts/types/tenant-context.js";
import type { JwtPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      tenant?: TenantContext;
    }
  }
}

