export const SUBSCRIPTION_STATUSES = {
  INCOMPLETE: "incomplete",
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  UNPAID: "unpaid",
  INCOMPLETE_EXPIRED: "incomplete_expired",
  TRIALING: "trialing",
  PAUSED: "paused",
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUSES)[keyof typeof SUBSCRIPTION_STATUSES];
