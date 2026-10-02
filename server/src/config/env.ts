import "dotenv/config";

const requiredEnv = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,

  databaseUrl: process.env.DATABASE_URL!,

  jwtSecret: process.env.JWT_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,

  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  geminiApiKey: process.env.GEMINI_API_KEY,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
};