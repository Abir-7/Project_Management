import type {
  EmailSendingService,
  SendEmailInput,
} from "./email_sending.service.js";

class ConsoleEmailService implements EmailSendingService {
  async sendEmail(input: SendEmailInput): Promise<void> {
    console.log("📧 Email sent");
    console.log(`To: ${input.to}`);
    console.log(`Subject: ${input.subject}`);
    console.log(`Body: ${input.text}`);
  }
}

export const consoleEmailService = new ConsoleEmailService();
