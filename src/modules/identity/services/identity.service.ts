import { StatusCodes } from "http-status-codes";
import { AppDataSource } from "../../../shared/database/data-source.js";
import { AppError } from "../../../shared/errors/app-error.js";
import { EmailVerificationToken } from "../entities/email-verification-token.js";
import { UserAuth } from "../entities/user-auth.js";
import { User } from "../entities/user.js";
import type { RegisterInput } from "../schemas/register.schema.js";
import { hashValue } from "../../../shared/utils/hash.js";
import { emailVerificationService } from "./email.service.js";
import { IDENTITY_EVENTS } from "../events/identity.events.js";
import { OutboxEvent } from "../../../shared/events/outbox/outbox-event.entity.js";
import type { UserRegisteredEvent } from "../events/schema/user-registered.schema.js";
import type { VerifyEmailInput } from "../schemas/email-verification.schema.js";
import { hashToken } from "../../../shared/utils/token.js";
import type { ResendVerificationInput } from "../schemas/resend-verification.schema.js";
import type { EmailVerificationRequestedEvent } from "../events/schema/email-verification-requested.schema.js";

class IdentityService {
  async register(input: RegisterInput) {
    return AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const userAuthRepository = manager.getRepository(UserAuth);
      const emailVerificationTokenRepository = manager.getRepository(
        EmailVerificationToken,
      );
      const outboxEventRepository = manager.getRepository(OutboxEvent);
      const existingUser = await userRepository.findOne({
        where: {
          email: input.email,
        },
      });
      if (existingUser) {
        throw new AppError({
          statusCode: StatusCodes.CONFLICT,
          message: "An account with this email already exists",
        });
      }
      const user = userRepository.create({
        name: input.name,
        email: input.email,
        designation: input.designation ?? null,
        techStack: input.techStack ?? null,
        emailVerified: false,
      });
      await userRepository.save(user);
      const passwordHash = await hashValue(input.password);
      const userAuth = userAuthRepository.create({
        userId: user.id,
        passwordHash,
        refreshTokenHash: null,
        lastLoginAt: null,
      });
      await userAuthRepository.save(userAuth);

      const verificationToken =
        await emailVerificationService.createVerificationToken(
          user.id,
          emailVerificationTokenRepository,
        );
      const event: UserRegisteredEvent = {
        userId: user.id,
        email: user.email,
        name: user.name,
        verificationToken,
      };

      const outboxEvent = outboxEventRepository.create({
        eventName: IDENTITY_EVENTS.USER_REGISTERED,
        payload: { ...event },
        attempts: 0,
        maxAttempts: 5,
        nextAttemptAt: new Date(),
        processedAt: null,
        failedAt: null,
        lastError: null,
      });
      await outboxEventRepository.save(outboxEvent);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        techStack: user.techStack,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      };
    });
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
        lock: {
          mode: "pessimistic_write",
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
  async resendVerificationEmail(input: ResendVerificationInput) {
    return AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);

      const emailVerificationTokenRepository = manager.getRepository(
        EmailVerificationToken,
      );

      const outboxEventRepository = manager.getRepository(OutboxEvent);

      const user = await userRepository.findOne({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        throw new AppError({
          statusCode: StatusCodes.NOT_FOUND,
          message: "User not found",
        });
      }

      if (user.emailVerified) {
        throw new AppError({
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Email is already verified",
        });
      }

      await emailVerificationTokenRepository
        .createQueryBuilder()
        .update(EmailVerificationToken)
        .set({
          usedAt: new Date(),
        })
        .where("userId = :userId", {
          userId: user.id,
        })
        .andWhere("usedAt IS NULL")
        .execute();

      const verificationToken =
        await emailVerificationService.createVerificationToken(
          user.id,
          emailVerificationTokenRepository,
        );

      const event: EmailVerificationRequestedEvent = {
        userId: user.id,
        email: user.email,
        name: user.name,
        verificationToken,
      };

      await outboxEventRepository.save({
        eventName: IDENTITY_EVENTS.EMAIL_VERIFICATION_REQUESTED,
        payload: event as Record<string, unknown>,
      });

      return {
        message: "Verification email sent",
      };
    });
  }
}

export const identityService = new IdentityService();
