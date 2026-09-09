import { AppDataSource } from "../../../shared/database/data-source.js";
import { EmailVerificationToken } from "../entities/email-verification-token.js";

export const emailVerificationTokenRepository = AppDataSource.getRepository(
  EmailVerificationToken,
);
