import type { Repository } from "typeorm";

import { generateToken, hashToken } from "../../../shared/utils/token.js";
import { EmailVerificationToken } from "../entities/email-verification-token.js";
import { consoleEmailService } from "../../../shared/email/console.email.service.js";
import { env } from "../../../shared/config/index.js";
import type { EmailSendingService } from "../../../shared/email/email_sending.service.js";

interface SendVerificationEmailInput {
  email: string;
  name: string;
  verificationToken: string;
}

class EmailVerificationService {
  constructor(private readonly emailService: EmailSendingService) {}
  async createVerificationToken(
    userId: string,
    repository: Repository<EmailVerificationToken>,
  ) {
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const verificationToken = repository.create({
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
    });

    await repository.save(verificationToken);

    return rawToken;
  }
  async sendVerificationEmail(
    input: SendVerificationEmailInput,
  ): Promise<void> {
    const verificationUrl =
      `${env.appUrl}/api/auth/verify-email` +
      `?token=${encodeURIComponent(input.verificationToken)}`;

    await this.emailService.sendEmail({
      to: input.email,
      subject: "Verify your email",
      text: `Hello ${input.name}, Please verify your email by clicking the link below:${verificationUrl} .This link will expire soon. If you did not create this account, you can safely ignore this email.`,
    });
  }
}

export const emailVerificationService = new EmailVerificationService(
  consoleEmailService,
);
