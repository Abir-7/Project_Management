import type { Repository } from "typeorm";

import { generateToken, hashToken } from "../../../shared/utils/token.js";
import { EmailVerificationToken } from "../entities/email-verification-token.js";
import { User } from "../entities/user.js";
import { AppError } from "../../../shared/errors/app-error.js";
import { StatusCodes } from "http-status-codes";
import { AppDataSource } from "../../../shared/database/data-source.js";

class EmailVerificationService {
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

  async verifyEmail(token: string) {
    return AppDataSource.transaction(async (manager) => {
      const tokenRepository = manager.getRepository(EmailVerificationToken);

      const userRepository = manager.getRepository(User);

      const tokenHash = hashToken(token);

      const verificationToken = await tokenRepository.findOne({
        where: {
          tokenHash,
        },
      });

      if (!verificationToken) {
        throw new AppError({
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Invalid verification token",
        });
      }

      if (verificationToken.usedAt) {
        throw new AppError({
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Verification token has already been used",
        });
      }

      if (verificationToken.expiresAt < new Date()) {
        throw new AppError({
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Verification token has expired",
        });
      }

      const user = await userRepository.findOne({
        where: {
          id: verificationToken.userId,
        },
      });

      if (!user) {
        throw new AppError({
          statusCode: StatusCodes.NOT_FOUND,
          message: "User account not found",
        });
      }

      user.emailVerified = true;

      await userRepository.save(user);

      verificationToken.usedAt = new Date();

      await tokenRepository.save(verificationToken);

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      };
    });
  }
}

export const emailVerificationService = new EmailVerificationService();
