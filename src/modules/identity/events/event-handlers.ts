import { IDENTITY_EVENTS } from "./identity.events.js";

import { userRegisteredHandler } from "./handler/user-registered.handler.js";
import { emailVerificationRequestedHandler } from "./handler/email-verification-requested.handler.js";

export const identityEventHandlers = new Map([
  [IDENTITY_EVENTS.USER_REGISTERED, userRegisteredHandler],
  [
    IDENTITY_EVENTS.EMAIL_VERIFICATION_REQUESTED,
    emailVerificationRequestedHandler,
  ],
]);
