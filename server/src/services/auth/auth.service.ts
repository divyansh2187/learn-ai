import bcrypt from "bcryptjs";

import prisma from "../../config/database";

import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from "../../utils/token";

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  userAgent?: string,
  ipAddress?: string
) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new Error(
      "An account with this email already exists"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_EXPIRY_DAYS *
        24 *
        60 *
        60 *
        1000
  );

  // Create the session first so we get its ID.
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: "",
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  // Create a refresh token tied to this specific session.
  const refreshToken = generateRefreshToken(
    user.id,
    session.id
  );

  const refreshTokenHash = hashToken(refreshToken);

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      refreshTokenHash,
    },
  });

  const accessToken = generateAccessToken(
    user.id,
    user.role
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (
  email: string,
  password: string,
  userAgent?: string,
  ipAddress?: string
) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  // Don't reveal whether the email exists.
  if (!user || !user.passwordHash) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_EXPIRY_DAYS *
        24 *
        60 *
        60 *
        1000
  );

  // Create the session first.
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: "",
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  const refreshToken = generateRefreshToken(
    user.id,
    session.id
  );

  const refreshTokenHash = hashToken(refreshToken);

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      refreshTokenHash,
    },
  });

  const accessToken = generateAccessToken(
    user.id,
    user.role
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshSession = async (
  refreshToken: string
) => {
  const payload = verifyRefreshToken(refreshToken);

  const session = await prisma.session.findUnique({
    where: {
      id: payload.sessionId,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.userId !== payload.sub) {
    throw new Error("Invalid session");
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    throw new Error("Session expired");
  }

  const incomingTokenHash = hashToken(refreshToken);

  if (
    incomingTokenHash !== session.refreshTokenHash
  ) {
    // Possible refresh-token reuse.
    // Invalidate this session.
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    throw new Error("Invalid refresh token");
  }

  // Rotate refresh token.
  const newRefreshToken = generateRefreshToken(
    session.user.id,
    session.id
  );

  const newRefreshTokenHash =
    hashToken(newRefreshToken);

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      refreshTokenHash: newRefreshTokenHash,
      updatedAt: new Date(),
    },
  });

  const newAccessToken = generateAccessToken(
    session.user.id,
    session.user.role
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutSession = async (refreshToken: string) => {
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.session.deleteMany({
    where: {
      refreshTokenHash,
    },
  });
};

export const logoutAllSessions = async (userId: string) => {
  await prisma.session.deleteMany({
    where: {
      userId,
    },
  });
};