import { StatusCodes } from "http-status-codes";
import { AppDataSource } from "../../../shared/database/data-source.js";
import { AppError } from "../../../shared/errors/app-error.js";
import { EmailVerificationToken } from "../entities/email-verification-token.js";
import { UserAuth } from "../entities/user-auth.js";
import { User } from "../entities/user.js";
import type { RegisterInput } from "../schemas/register.schema.js";
import { hashValue } from "../../../shared/utils/hash.js";
import { emailVerificationService } from "./email-verification.service.js";

class IdentityService {
  async register(input: RegisterInput) {
    return AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const userAuthRepository = manager.getRepository(UserAuth);
      const emailVerificationTokenRepository = manager.getRepository(
        EmailVerificationToken,
      );
      const existingUser = await userRepository.findOne({
        where: {
          email: input.name,
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

      await emailVerificationService.createVerificationToken(
        user.id,
        emailVerificationTokenRepository,
      );
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
