import { Router } from "express";
import prisma from "../config/database";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();
// ============================================
// GET SINGLE EXERCISE
// ============================================

router.get(
  "/:exerciseId",
  requireAuth,
  async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { exerciseId } = req.params;

      const exercise = await prisma.exercise.findUnique({
        where: {
          id: exerciseId,
        },
      });

      if (!exercise) {
        return res.status(404).json({
          success: false,
          message: "Exercise not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      console.error("Get exercise error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get exercise",
      });
    }
  }
);


// ============================================
// GET EXERCISES FOR A LESSON
// ============================================

router.get(
  "/lesson/:lessonId",
  requireAuth,
  async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { lessonId } = req.params;

      const lesson = await prisma.lesson.findUnique({
        where: {
          id: lessonId,
        },
      });

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      const exercises = await prisma.exercise.findMany({
        where: {
          lessonId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return res.status(200).json({
        success: true,
        data: exercises,
      });
    } catch (error) {
      console.error("Get exercises error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get exercises",
      });
    }
  }
);

// ============================================
// UPDATE EXERCISE
// ============================================

router.patch(
  "/:exerciseId",
  requireAuth,
  async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { exerciseId } = req.params;

      const {
        title,
        description,
        difficulty,
        solution,
        hints,
      } = req.body;

      // Check exercise exists
      const existingExercise = await prisma.exercise.findUnique({
        where: {
          id: exerciseId,
        },
      });

      if (!existingExercise) {
        return res.status(404).json({
          success: false,
          message: "Exercise not found",
        });
      }

      // Build update data
      const updateData: {
        title?: string;
        description?: string;
        difficulty?: any;
        solution?: string | null;
        hints?: any;
      } = {};

      if (title !== undefined) {
        if (
          typeof title !== "string" ||
          title.trim().length === 0
        ) {
          return res.status(400).json({
            success: false,
            message: "Title must be a non-empty string",
          });
        }

        updateData.title = title.trim();
      }

      if (description !== undefined) {
        if (typeof description !== "string") {
          return res.status(400).json({
            success: false,
            message: "Description must be a string",
          });
        }

        updateData.description = description.trim();
      }

      if (difficulty !== undefined) {
        const validDifficulties = [
          "BEGINNER",
          "INTERMEDIATE",
          "ADVANCED",
        ];

        if (!validDifficulties.includes(difficulty)) {
          return res.status(400).json({
            success: false,
            message: "Invalid difficulty",
          });
        }

        updateData.difficulty = difficulty;
      }

      if (solution !== undefined) {
        if (
          solution !== null &&
          typeof solution !== "string"
        ) {
          return res.status(400).json({
            success: false,
            message: "Solution must be a string or null",
          });
        }

        updateData.solution =
          typeof solution === "string"
            ? solution.trim()
            : null;
      }

      if (hints !== undefined) {
        if (!Array.isArray(hints)) {
          return res.status(400).json({
            success: false,
            message: "Hints must be an array",
          });
        }

        updateData.hints = hints;
      }

      const updatedExercise = await prisma.exercise.update({
        where: {
          id: exerciseId,
        },
        data: updateData,
      });

      return res.status(200).json({
        success: true,
        message: "Exercise updated successfully",
        data: updatedExercise,
      });
    } catch (error) {
      console.error("Update exercise error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update exercise",
      });
    }
  }
);


// ============================================
// DELETE EXERCISE
// ============================================

router.delete(
  "/:exerciseId",
  requireAuth,
  async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { exerciseId } = req.params;

      // Check exercise exists
      const exercise = await prisma.exercise.findUnique({
        where: {
          id: exerciseId,
        },
      });

      if (!exercise) {
        return res.status(404).json({
          success: false,
          message: "Exercise not found",
        });
      }

      // Delete exercise
      await prisma.exercise.delete({
        where: {
          id: exerciseId,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Exercise deleted successfully",
      });
    } catch (error) {
      console.error("Delete exercise error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete exercise",
      });
    }
  }
);

export default router;