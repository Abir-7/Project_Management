import { env } from "../../../../shared/config/index.js";
import { consoleEmailService } from "../../../../shared/email/console.email.service.js";
import type { EmailService } from "../../../../shared/email/email.service.js";
import { userRegisteredEventSchema } from "../schema/user-registered.schema.js";

class UserRegisteredHandler {
  constructor(private readonly emailService: EmailService) {}

  async handle(payload: Record<string, unknown>): Promise<void> {
    const event = userRegisteredEventSchema.parse(payload);

    const verificationUrl =
      `${env.appUrl}/api/v1/identity/verify-email` +
      `?token=${encodeURIComponent(event.verificationToken)}`;

    await this.emailService.sendEmail({
      to: event.email,
      subject: "Verify your email",
      text: `Hello ${event.name}, Please verify your email by clicking the link below:${verificationUrl} .This link will expire soon. If you did not create this account, you can safely ignore this email.`,
    });
  }
}

export const userRegisteredHandler = new UserRegisteredHandler(
  consoleEmailService,
);
