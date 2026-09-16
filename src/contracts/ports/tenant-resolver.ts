import type { TenantContext } from "../types/tenant-context.js";

export interface TenantResolver {
  resolve(
    userId: string,
    organizationId: string,
  ): Promise<TenantContext | null>;
}
