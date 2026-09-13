export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

export interface EmailSendingService {
  sendEmail(input: SendEmailInput): Promise<void>;
}
