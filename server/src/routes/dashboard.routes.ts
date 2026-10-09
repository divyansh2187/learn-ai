
import { Router } from "express";
import prisma from "../config/database";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/overview", requireAuth, async (req, res) => {
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

    // Only courses owned by the authenticated student
    const courses = await prisma.course.findMany({
      where: {
        userId,
        isArchived: false,
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        difficulty: true,
        updatedAt: true,
        modules: {
          select: {
            lessons: {
              select: {
                id: true,
                title: true,
                order: true,
                estimatedMinutes: true,
                progress: {
                  where: { userId },
                  select: {
                    completed: true,
                    progress: true,
                    timeSpent: true,
                    updatedAt: true,
                  },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const [quizAttempts, learningTime] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId },
        select: {
          score: true,
          totalPoints: true,
          completedAt: true,
        },
        orderBy: { completedAt: "desc" },
      }),

      prisma.lessonProgress.aggregate({
        where: { userId },
        _sum: { timeSpent: true },
      }),
    ]);

    let totalLessons = 0;
    let completedLessons = 0;

    const courseStats = courses.map((course) => {
      const lessons = course.modules.flatMap(
        (module) => module.lessons
      );

      const completed = lessons.filter((lesson) =>
        lesson.progress.some((progress) => progress.completed)
      ).length;

      totalLessons += lessons.length;
      completedLessons += completed;

      const percent = lessons.length
        ? Math.round((completed / lessons.length) * 100)
        : 0;

      const nextLesson = lessons.find(
        (lesson) =>
          !lesson.progress.some((progress) => progress.completed)
      );

      return {
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        difficulty: course.difficulty,
        totalLessons: lessons.length,
        completedLessons: completed,
        progressPercent: percent,
        nextLesson: nextLesson
          ? {
              id: nextLesson.id,
              title: nextLesson.title,
            }
          : null,
      };
    });

    const validQuizAttempts = quizAttempts.filter(
      (attempt) => attempt.totalPoints > 0
    );

    const averageQuizScore = validQuizAttempts.length
      ? Math.round(
          validQuizAttempts.reduce(
            (sum, attempt) =>
              sum + (attempt.score / attempt.totalPoints) * 100,
            0
          ) / validQuizAttempts.length
        )
      : null;

    const completedCourses = courseStats.filter(
      (course) =>
        course.totalLessons > 0 &&
        course.completedLessons === course.totalLessons
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCourses: courses.length,
          completedCourses,
          inProgressCourses: courses.filter(
            (course) =>
              course.progressPercent > 0 &&
              course.progressPercent < 100
          ).length,
          totalLessons,
          completedLessons,
          remainingLessons: totalLessons - completedLessons,
          overallProgressPercent: totalLessons
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
          totalLearningTimeSeconds:
            learningTime._sum.timeSpent ?? 0,
          quizAttempts: quizAttempts.length,
          averageQuizScore,
        },
        courses: courseStats,
        recentQuizAttempts: quizAttempts.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard overview",
    });
  }
});

export default router;
