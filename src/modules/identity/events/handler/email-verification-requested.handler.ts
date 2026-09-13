import { emailVerificationService } from "../../services/email.service.js";
import { emailVerificationRequestedEventSchema } from "../schema/email-verification-requested.schema.js";

class EmailVerificationRequestedHandler {
  async handle(payload: Record<string, unknown>): Promise<void> {
    const event = emailVerificationRequestedEventSchema.parse(payload);

    await emailVerificationService.sendVerificationEmail({
      email: event.email,
      name: event.name,
      verificationToken: event.verificationToken,
    });
  }
}

export const emailVerificationRequestedHandler =
  new EmailVerificationRequestedHandler();
