export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

export interface EmailService {
  sendEmail(input: SendEmailInput): Promise<void>;
}
