import { Router } from "express";
import prisma from "../config/database";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

// ============================================
// ADD BOOKMARK
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

      // Create bookmark
      const bookmark = await prisma.bookmark.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },

        create: {
          userId,
          lessonId,
        },

        update: {},
      });

      return res.status(201).json({
        success: true,
        message: "Bookmark added successfully",
        data: bookmark,
      });
    } catch (error) {
      console.error("Add bookmark error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to add bookmark",
      });
    }
  }
);

// ============================================
// REMOVE BOOKMARK
// ============================================

router.delete(
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

      const bookmark =
        await prisma.bookmark.findUnique({
          where: {
            userId_lessonId: {
              userId,
              lessonId,
            },
          },
        });

      if (!bookmark) {
        return res.status(404).json({
          success: false,
          message: "Bookmark not found",
        });
      }

      await prisma.bookmark.delete({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: "Bookmark removed successfully",
      });
    } catch (error) {
      console.error(
        "Remove bookmark error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to remove bookmark",
      });
    }
  }
);

// ============================================
// CHECK BOOKMARK
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

      const bookmark =
        await prisma.bookmark.findUnique({
          where: {
            userId_lessonId: {
              userId,
              lessonId,
            },
          },
        });

      return res.status(200).json({
        success: true,
        data: {
          bookmarked: !!bookmark,
          bookmark,
        },
      });
    } catch (error) {
      console.error(
        "Check bookmark error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to check bookmark",
      });
    }
  }
);

// ============================================
// GET ALL USER BOOKMARKS
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

      const bookmarks =
        await prisma.bookmark.findMany({
          where: {
            userId,
          },

          orderBy: {
            createdAt: "desc",
          },

          include: {
            lesson: {
              include: {
                module: {
                  select: {
                    id: true,
                    title: true,
                    order: true,
                    courseId: true,
                  },
                },
              },
            },
          },
        });

      return res.status(200).json({
        success: true,
        data: bookmarks,
      });
    } catch (error) {
      console.error(
        "Get bookmarks error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get bookmarks",
      });
    }
  }
);

export default router;