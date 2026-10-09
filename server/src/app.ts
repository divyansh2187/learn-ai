import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import progressRoutes from "./routes/progress.routes";
import quizRoutes  from "./routes/quiz.routes";
import noteRoutes from "./routes/note.routes";
import bookmarkRoutes from "./routes/bookmark.routes";
import flashcardRoutes from "./routes/flashcard.routes";
import youtubeRoutes from "./routes/youtube.routes";
import exerciseRoutes from "./routes/exercise.routes";
import exerciseProgressRoutes from "./routes/exercise-progress.routes";
import projectRoutes from "./routes/project.routes";
import projectSubmissionRoutes from "./routes/project-submission.routes";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "LearnAI API is running",
  });
});

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/progress", progressRoutes);

app.use("/api/quiz", quizRoutes);

app.use("/api/notes", noteRoutes);

app.use("/api/bookmarks", bookmarkRoutes);

app.use("/api/flashcards", flashcardRoutes);

app.use("/api/youtube", youtubeRoutes);

app.use("/api/exercises", exerciseRoutes);

app.use(
  "/api/exercise-progress",
  exerciseProgressRoutes
);

app.use("/api/projects", projectRoutes);

app.use(
  "/api/project-submissions",
  projectSubmissionRoutes
);

export default app;