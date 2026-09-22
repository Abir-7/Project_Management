export const BILLING_INTERVALS = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type BillingInterval =
  (typeof BILLING_INTERVALS)[keyof typeof BILLING_INTERVALS];
