import { Router } from "express";
import prisma from "../config/database";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

// GET lesson progress
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

      const progress = await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error("Get lesson progress error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get lesson progress",
      });
    }
  }
);



// UPDATE LESSON PROGRESS + COURSE PROGRESS
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
        progress,
        timeSpent,
        completed,
      } = req.body;

      // --------------------------------
      // Check lesson exists
      // --------------------------------

      const lesson = await prisma.lesson.findUnique({
        where: {
          id: lessonId,
        },
        include: {
          module: {
            select: {
              courseId: true,
            },
          },
        },
      });

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      const courseId = lesson.module.courseId;

      // --------------------------------
      // Validate progress
      // --------------------------------

      const progressValue = Math.min(
        100,
        Math.max(0, Number(progress) || 0)
      );

      const timeSpentValue = Math.max(
        0,
        Number(timeSpent) || 0
      );

      const isCompleted =
        completed === true ||
        progressValue >= 100;

      // --------------------------------
      // Save lesson progress
      // --------------------------------

      const lessonProgress =
        await prisma.lessonProgress.upsert({
          where: {
            userId_lessonId: {
              userId,
              lessonId,
            },
          },

          create: {
            userId,
            lessonId,
            progress: progressValue,
            timeSpent: timeSpentValue,
            completed: isCompleted,
            startedAt: new Date(),
            completedAt: isCompleted
              ? new Date()
              : null,
          },

          update: {
            progress: progressValue,
            timeSpent: timeSpentValue,
            completed: isCompleted,
            completedAt: isCompleted
              ? new Date()
              : null,
          },
        });

      // --------------------------------
      // Get all lessons in this course
      // --------------------------------

      const totalLessons =
        await prisma.lesson.count({
          where: {
            module: {
              courseId,
            },
          },
        });

      // --------------------------------
      // Count completed lessons
      // --------------------------------

      const completedLessons =
        await prisma.lessonProgress.count({
          where: {
            userId,
            completed: true,
            lesson: {
              module: {
                courseId,
              },
            },
          },
        });

      // --------------------------------
      // Calculate course percentage
      // --------------------------------

      const progressPercent =
        totalLessons > 0
          ? Math.round(
              (completedLessons /
                totalLessons) *
                100
            )
          : 0;

      const courseCompleted =
        totalLessons > 0 &&
        completedLessons === totalLessons;

      // --------------------------------
      // Save CourseProgress
      // --------------------------------

      const courseProgress =
        await prisma.courseProgress.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },

          create: {
            userId,
            courseId,
            completedLessons,
            totalLessons,
            progressPercent,
            startedAt: new Date(),
            lastActivityAt: new Date(),
            completedAt: courseCompleted
              ? new Date()
              : null,
          },

          update: {
            completedLessons,
            totalLessons,
            progressPercent,
            lastActivityAt: new Date(),
            completedAt: courseCompleted
              ? new Date()
              : null,
          },
        });

      // --------------------------------
      // Response
      // --------------------------------

      return res.status(200).json({
        success: true,
        message: "Lesson progress updated",
        data: {
          lessonProgress,
          courseProgress,
        },
      });
    } catch (error) {
      console.error(
        "Update lesson progress error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update lesson progress",
      });
    }
  }
);


// GET COURSE PROGRESS + NEXT LESSON
router.get(
  "/course/:courseId",
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

      const { courseId } = req.params;
      const userId = authReq.user.id;

      // Get course progress
      const courseProgress =
        await prisma.courseProgress.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
        });

      // Get all lessons with this user's progress
      const lessons = await prisma.lesson.findMany({
        where: {
          module: {
            courseId,
          },
        },
        orderBy: [
          {
            module: {
              order: "asc",
            },
          },
          {
            order: "asc",
          },
        ],
        include: {
          module: {
            select: {
              id: true,
              title: true,
              order: true,
            },
          },

          progress: {
            where: {
              userId,
            },
          },
        },
      });

      // Find first incomplete lesson
      const nextLesson =
        lessons.find((lesson) => {
          const progress = lesson.progress[0];

          return !progress || !progress.completed;
        }) || null;

      return res.status(200).json({
        success: true,
        data: {
          courseProgress,
          nextLesson,
          lessons,
        },
      });
    } catch (error) {
      console.error(
        "Get course progress error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get course progress",
      });
    }
  }
);

export default router;