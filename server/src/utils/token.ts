import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

export interface AccessTokenPayload {
  sub: string;
  role: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: "refresh";
}

export const generateAccessToken = (
  userId: string,
  role: string
) => {
  return jwt.sign(
    {
      sub: userId,
      role,
      type: "access",
    },
    env.jwtSecret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

export const generateRefreshToken = (
  userId: string,
  sessionId: string
) => {
  return jwt.sign(
    {
      sub: userId,
      sessionId,
      type: "refresh",
    },
    env.jwtRefreshSecret,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload => {
  const payload = jwt.verify(
    token,
    env.jwtRefreshSecret
  ) as RefreshTokenPayload;

  if (
    payload.type !== "refresh" ||
    !payload.sub ||
    !payload.sessionId
  ) {
    throw new Error("Invalid refresh token");
  }

  return payload;
};

export const hashToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};