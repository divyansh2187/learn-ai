import { Router } from "express";
import prisma from "../config/database";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

// ============================================
// CREATE FLASHCARD
// ============================================

router.post(
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
      const userId = authReq.user.id;

      const {
        front,
        back,
        difficulty,
      } = req.body;

      // Check lesson exists
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

      // Validate front
      if (!front || typeof front !== "string") {
        return res.status(400).json({
          success: false,
          message: "Flashcard front is required",
        });
      }

      // Validate back
      if (!back || typeof back !== "string") {
        return res.status(400).json({
          success: false,
          message: "Flashcard back is required",
        });
      }

      const difficultyValue = Math.min(
        5,
        Math.max(0, Number(difficulty) || 0)
      );

      const flashcard = await prisma.flashcard.create({
        data: {
          userId,
          lessonId,
          front: front.trim(),
          back: back.trim(),
          difficulty: difficultyValue,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Flashcard created successfully",
        data: flashcard,
      });
    } catch (error) {
      console.error("Create flashcard error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create flashcard",
      });
    }
  }
);

// ============================================
// GET FLASHCARDS FOR A LESSON
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
      const userId = authReq.user.id;

      const flashcards = await prisma.flashcard.findMany({
        where: {
          userId,
          lessonId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return res.status(200).json({
        success: true,
        data: flashcards,
      });
    } catch (error) {
      console.error(
        "Get lesson flashcards error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get flashcards",
      });
    }
  }
);

// ============================================
// GET ALL USER FLASHCARDS
// ============================================

router.get(
  "/",
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

      const userId = authReq.user.id;

      const flashcards = await prisma.flashcard.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              module: {
                select: {
                  id: true,
                  title: true,
                  courseId: true,
                },
              },
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: flashcards,
      });
    } catch (error) {
      console.error(
        "Get all flashcards error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get flashcards",
      });
    }
  }
);

// ============================================
// REVIEW FLASHCARD
// ============================================

router.patch(
  "/:flashcardId/review",
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

      const { flashcardId } = req.params;
      const userId = authReq.user.id;

      const {
        difficulty,
      } = req.body;

      // Check flashcard belongs to user
      const flashcard =
        await prisma.flashcard.findFirst({
          where: {
            id: flashcardId,
            userId,
          },
        });

      if (!flashcard) {
        return res.status(404).json({
          success: false,
          message: "Flashcard not found",
        });
      }

      const difficultyValue = Math.min(
        5,
        Math.max(
          0,
          Number(difficulty ?? flashcard.difficulty)
        )
      );

      // Simple spaced-review schedule
      const intervals = [
        1,
        2,
        4,
        7,
        14,
        30,
      ];

      const reviewCount =
        flashcard.reviewCount + 1;

      const intervalIndex = Math.min(
        reviewCount - 1,
        intervals.length - 1
      );

      const daysUntilNextReview =
        intervals[intervalIndex];

      const nextReviewAt = new Date();

      nextReviewAt.setDate(
        nextReviewAt.getDate() +
          daysUntilNextReview
      );

      const updatedFlashcard =
        await prisma.flashcard.update({
          where: {
            id: flashcardId,
          },

          data: {
            reviewCount,
            difficulty: difficultyValue,
            lastReviewedAt: new Date(),
            nextReviewAt,
          },
        });

      return res.status(200).json({
        success: true,
        message: "Flashcard reviewed successfully",
        data: updatedFlashcard,
      });
    } catch (error) {
      console.error(
        "Review flashcard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to review flashcard",
      });
    }
  }
);

// ============================================
// DELETE FLASHCARD
// ============================================

router.delete(
  "/:flashcardId",
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

      const { flashcardId } = req.params;
      const userId = authReq.user.id;

      const flashcard =
        await prisma.flashcard.findFirst({
          where: {
            id: flashcardId,
            userId,
          },
        });

      if (!flashcard) {
        return res.status(404).json({
          success: false,
          message: "Flashcard not found",
        });
      }

      await prisma.flashcard.delete({
        where: {
          id: flashcardId,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Flashcard deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete flashcard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete flashcard",
      });
    }
  }
);

export default router;