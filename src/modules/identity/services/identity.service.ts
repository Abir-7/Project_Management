import { StatusCodes } from "http-status-codes";
import { AppDataSource } from "../../../shared/database/data-source.js";
import { AppError } from "../../../shared/errors/app-error.js";
import { EmailVerificationToken } from "../entities/email-verification-token.js";
import { UserAuth } from "../entities/user-auth.js";
import { User } from "../entities/user.js";
import type { RegisterInput } from "../schemas/register.schema.js";
import { hashValue } from "../../../shared/utils/hash.js";
import { emailVerificationService } from "./email-verification.service.js";
import { IDENTITY_EVENTS } from "../events/identity.events.js";
import { OutboxEvent } from "../../../shared/events/outbox/outbox-event.entity.js";
import type { UserRegisteredEvent } from "../events/user-registered.schema.js";

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
}

export const identityService = new IdentityService();
