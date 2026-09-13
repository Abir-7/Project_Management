import { env } from "../../../../shared/config/index.js";
import { consoleEmailService } from "../../../../shared/email/console.email.service.js";
import type { EmailSendingService } from "../../../../shared/email/email_sending.service.js";
import { emailVerificationService } from "../../services/email.service.js";
import { userRegisteredEventSchema } from "../schema/user-registered.schema.js";

class UserRegisteredHandler {
  async handle(payload: Record<string, unknown>): Promise<void> {
    const event = userRegisteredEventSchema.parse(payload);

    await emailVerificationService.sendVerificationEmail({
      email: event.email,
      name: event.name,
      verificationToken: event.verificationToken,
    });
  }
}

export const userRegisteredHandler = new UserRegisteredHandler();
