import { createDataSource } from "../shared/database/data-source.js";

import { User } from "../modules/identity/entities/user.js";
import { Organization } from "../modules/identity/entities/organization.js";
import { OrganizationMembership } from "../modules/identity/entities/organization-membership.js";
import { Branch } from "../modules/identity/entities/branch.js";
import { UserAuth } from "../modules/identity/entities/user-auth.js";
import { EmailVerificationToken } from "../modules/identity/entities/email-verification-token.js";
import { OutboxEvent } from "../shared/events/outbox/outbox-event.entity.js";

export const AppDataSource = createDataSource([
  Branch,
  Organization,
  User,
  UserAuth,
  OrganizationMembership,
  EmailVerificationToken,
  OutboxEvent,
]);
