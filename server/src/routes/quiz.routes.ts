import { Router } from "express";
import prisma from "../config/database";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| GET QUIZ FOR A LESSON
|--------------------------------------------------------------------------
| GET /api/quiz/lesson/:lessonId
*/
router.get("/lesson/:lessonId", requireAuth, async (req, res) => {
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

    const quiz = await prisma.quiz.findUnique({
      where: {
        lessonId,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            question: true,
            type: true,
            options: true,
            difficulty: true,
            points: true,
            order: true,
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found for this lesson",
      });
    }

    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("Get quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get quiz",
    });
  }
});

/*
|--------------------------------------------------------------------------
| SUBMIT QUIZ
|--------------------------------------------------------------------------
| POST /api/quiz/:quizId/submit
|
| Body:
| {
|   "answers": [
|     {
|       "questionId": "...",
|       "answer": "A"
|     }
|   ]
| }
|--------------------------------------------------------------------------
*/

router.post("/:quizId/submit", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const { quizId } = req.params;
    const userId = authReq.user.id;

    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

    // --------------------------------------------------
    // Get quiz and questions
    // --------------------------------------------------

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // --------------------------------------------------
    // Calculate score
    // --------------------------------------------------

    let score = 0;
    let totalPoints = 0;

    const results = quiz.questions.map((question) => {
      totalPoints += question.points;

      const submittedAnswer = answers.find(
        (item: any) => item.questionId === question.id,
      );

      const rawUserAnswer = submittedAnswer?.answer ?? null;
      const correctAnswer = question.answer;

      // Convert option numbers such as "1" into their option text.
      let userAnswer: unknown = rawUserAnswer;

      if (
        question.type === "MULTIPLE_CHOICE" &&
        typeof rawUserAnswer === "string" &&
        Array.isArray(question.options)
      ) {
        const answer = rawUserAnswer.trim();

        const numberMatch = answer.match(/^\d+$/);

        if (numberMatch) {
          const optionIndex = Number(answer) - 1;

          if (optionIndex >= 0 && optionIndex < question.options.length) {
            userAnswer = question.options[optionIndex];
          }
        } else {
          // Also accept letters such as A, B, C, D.
          const letterMatch = answer.match(/^[A-D]$/i);

          if (letterMatch) {
            const optionIndex = answer.toUpperCase().charCodeAt(0) - 65;

            if (optionIndex < question.options.length) {
              userAnswer = question.options[optionIndex];
            }
          }
        }
      }

      const normalize = (value: unknown) =>
        typeof value === "string"
          ? value.trim().toLowerCase()
          : JSON.stringify(value);

  

      const isCorrect =
  normalize(rawUserAnswer) === normalize(correctAnswer) ||
  normalize(userAnswer) === normalize(correctAnswer);

      if (isCorrect) {
        score += question.points;
      }

      return {
        questionId: question.id,
        userAnswer,
        correctAnswer,
        isCorrect,
        points: question.points,
      };
    });

    // --------------------------------------------------
    // Save quiz attempt
    // --------------------------------------------------

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        totalPoints,
        answers: results,
      },
    });

    // --------------------------------------------------
    // Percentage
    // --------------------------------------------------

    const percentage =
      totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",

      data: {
        attemptId: attempt.id,
        score,
        totalPoints,
        percentage,
        passed: percentage >= 60,
        results,
        completedAt: attempt.completedAt,
      },
    });
  } catch (error) {
    console.error("Submit quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET QUIZ ATTEMPT HISTORY
|--------------------------------------------------------------------------
| GET /api/quiz/:quizId/attempts
*/
router.get("/:quizId/attempts", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const { quizId } = req.params;
    const userId = authReq.user.id;

    // Check quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Get user's attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId,
        userId,
      },
      orderBy: {
        completedAt: "desc",
      },
      select: {
        id: true,
        score: true,
        totalPoints: true,
        answers: true,
        completedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error("Get quiz attempts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get quiz attempts",
    });
  }
});

export default router;
