import { Router } from "express";

import prisma from "../config/database";

import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";


const router = Router();


// ============================================
// GET EXERCISE PROGRESS
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
      const userId = authReq.user.id;

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

      // Get user's progress
      const progress = await prisma.exerciseProgress.findUnique({
        where: {
          userId_exerciseId: {
            userId,
            exerciseId,
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error(
        "Get exercise progress error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get exercise progress",
      });
    }
  }
);

// ============================================
// UPDATE EXERCISE PROGRESS
// ============================================

router.post(
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
      const userId = authReq.user.id;

      const { completed } = req.body;

      // Validate completed
      if (typeof completed !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "completed must be a boolean",
        });
      }

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

      const isCompleted = completed === true;

      // Create or update progress
      const exerciseProgress =
        await prisma.exerciseProgress.upsert({
          where: {
            userId_exerciseId: {
              userId,
              exerciseId,
            },
          },

          create: {
            userId,
            exerciseId,
            completed: isCompleted,
            completedAt: isCompleted
              ? new Date()
              : null,
          },

          update: {
            completed: isCompleted,
            completedAt: isCompleted
              ? new Date()
              : null,
          },
        });

      return res.status(200).json({
        success: true,
        message: isCompleted
          ? "Exercise marked as completed"
          : "Exercise marked as incomplete",
        data: exerciseProgress,
      });
    } catch (error) {
      console.error(
        "Update exercise progress error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to update exercise progress",
      });
    }
  }
);

export default router;