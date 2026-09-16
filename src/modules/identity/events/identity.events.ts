export const IDENTITY_EVENTS = {
  USER_REGISTERED: "user.registered",
  EMAIL_VERIFICATION_REQUESTED: "user.email_verification_requested",
} as const;

export type IdentityEvent =
  (typeof IDENTITY_EVENTS)[keyof typeof IDENTITY_EVENTS];
