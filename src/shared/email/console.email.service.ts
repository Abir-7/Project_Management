import type { EmailService, SendEmailInput } from "./email.service.js";

class ConsoleEmailService implements EmailService {
  async sendEmail(input: SendEmailInput): Promise<void> {
    console.log("📧 Email sent");
    console.log(`To: ${input.to}`);
    console.log(`Subject: ${input.subject}`);
    console.log(`Body: ${input.text}`);
  }
}

export const consoleEmailService = new ConsoleEmailService();
