import type { StringValue } from "ms";
import jwt from "jsonwebtoken";

import { env } from "../config/index.js";

export interface JwtPayload {
  userId: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.accessTokenTtl as StringValue,
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.refreshTokenTtl as StringValue,
  });
};
