import type { StringValue } from "ms";
import jwt from "jsonwebtoken";

import { env } from "../config/index.js";
import type { JwtPayload } from "../types/express.js";

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

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwt.secret) as JwtPayload;
};
