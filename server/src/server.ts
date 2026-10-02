import "dotenv/config";
import app from "./app";
import { env } from "./config/env";

const startServer = async () => {
  try {
    app.listen(env.port, () => {
      console.log(`🚀 LearnAI API running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();