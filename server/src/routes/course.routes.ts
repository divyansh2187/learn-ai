import { Router } from "express";
import prisma from "../config/database";
import {
  generateCourseOutline,
  generateLessonContent,
} from "../services/ai/ai.service";
import { generateLessonYouTubeResources } from "../services/youtube/youtube.service";

import {
  LearningGoal,
  LearningStyle,
  Difficulty,
  QuestionType,
} from "@prisma/client";

import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

// --------------------------------
// AI Response Types
// --------------------------------

interface AILesson {
  title: string;
  estimatedMinutes?: number;
  slug?: string;
  explanation?: string;
  keyConcepts?: string[];
  examples?: string[];
  codeExamples?: unknown[];
  commonMistakes?: string[];
}

interface AIModule {
  title: string;
  description?: string;
  lessons: AILesson[];
}

interface AICourseOutline {
  title: string;
  subtitle?: string;
  description?: string;
  modules: AIModule[];
}

const router = Router();

// 1. Generate course outline
router.post("/generate", requireAuth, async (req, res) => {
  try {
    // --------------------------------
    // Authentication
    // --------------------------------

    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const userId = authReq.user.id;

    // --------------------------------
    // Get request data
    // --------------------------------

    const { topic, goal, level, style, duration } = req.body;

    // --------------------------------
    // Validate topic
    // --------------------------------

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    // --------------------------------
    // Goal mapping
    // --------------------------------

    const goalMap: Record<string, LearningGoal> = {
      career: LearningGoal.CAREER,
      job: LearningGoal.CAREER,
      "become job ready": LearningGoal.CAREER,

      college: LearningGoal.COLLEGE,

      interview: LearningGoal.INTERVIEW,

      "personal knowledge": LearningGoal.PERSONAL_KNOWLEDGE,

      personal_knowledge: LearningGoal.PERSONAL_KNOWLEDGE,

      certification: LearningGoal.CERTIFICATION,

      project: LearningGoal.PROJECT,
    };

    // --------------------------------
    // Difficulty mapping
    // --------------------------------

    const levelMap: Record<string, Difficulty> = {
      beginner: Difficulty.BEGINNER,

      intermediate: Difficulty.INTERMEDIATE,

      advanced: Difficulty.ADVANCED,
    };

    // --------------------------------
    // Learning style mapping
    // --------------------------------

    const styleMap: Record<string, LearningStyle> = {
      reading: LearningStyle.READING,

      videos: LearningStyle.VIDEOS,

      hands_on: LearningStyle.HANDS_ON,

      "hands-on": LearningStyle.HANDS_ON,

      project: LearningStyle.PROJECTS,

      projects: LearningStyle.PROJECTS,

      mixed: LearningStyle.MIXED,
    };

    // --------------------------------
    // Normalize user input
    // --------------------------------

    const goalInput = String(goal || "PERSONAL_KNOWLEDGE")
      .trim()
      .toLowerCase();

    const levelInput = String(level || "BEGINNER")
      .trim()
      .toLowerCase();

    const styleInput = String(style || "MIXED")
      .trim()
      .toLowerCase();

    // --------------------------------
    // Convert to Prisma enums
    // --------------------------------

    const courseGoal = goalMap[goalInput] ?? LearningGoal.PERSONAL_KNOWLEDGE;

    const courseLevel = levelMap[levelInput] ?? Difficulty.BEGINNER;

    const courseStyle = styleMap[styleInput] ?? LearningStyle.MIXED;

    // --------------------------------
    // Validate duration
    // --------------------------------

    const courseDuration = Number(duration) || 30;

    if (courseDuration < 1 || courseDuration > 365) {
      return res.status(400).json({
        success: false,
        message: "Duration must be between 1 and 365 days",
      });
    }

    // --------------------------------
    // Generate course using AI
    // --------------------------------

    const outline = (await generateCourseOutline({
      topic: topic.trim(),

      goal: goal || "Personal knowledge",

      level: level || "BEGINNER",

      style: style || "MIXED",

      duration: courseDuration,
    })) as AICourseOutline;

    // --------------------------------
    // Validate AI response
    // --------------------------------

    if (
      !outline ||
      typeof outline.title !== "string" ||
      outline.title.trim().length === 0 ||
      !Array.isArray(outline.modules) ||
      outline.modules.length === 0
    ) {
      throw new Error("AI returned an invalid course structure");
    }

    // --------------------------------
    // Validate modules + lessons
    // --------------------------------

    for (const [moduleIndex, moduleData] of outline.modules.entries()) {
      if (
        !moduleData ||
        typeof moduleData.title !== "string" ||
        moduleData.title.trim().length === 0 ||
        !Array.isArray(moduleData.lessons)
      ) {
        throw new Error(`Invalid module structure at index ${moduleIndex}`);
      }

      // --------------------------------
      // Validate lessons
      // --------------------------------

      for (const [lessonIndex, lesson] of moduleData.lessons.entries()) {
        if (
          !lesson ||
          typeof lesson.title !== "string" ||
          lesson.title.trim().length === 0
        ) {
          throw new Error(
            `Invalid lesson structure at module ${moduleIndex}, lesson ${lessonIndex}`,
          );
        }
      }
    }

    // --------------------------------
    // Calculate total course duration
    // --------------------------------

    const estimatedMinutes = outline.modules.reduce(
      (total: number, module: AIModule) => {
        const moduleMinutes = module.lessons.reduce(
          (moduleTotal: number, lesson: AILesson) => {
            const minutes = Number(lesson.estimatedMinutes);

            return moduleTotal + (minutes > 0 ? minutes : 30);
          },
          0,
        );

        return total + moduleMinutes;
      },
      0,
    );

    // --------------------------------
    // Save everything in transaction
    // --------------------------------

    const course = await prisma.$transaction(async (tx) => {
      // --------------------------------
      // Create Course
      // --------------------------------

      const createdCourse = await tx.course.create({
        data: {
          userId,

          title: outline.title.trim(),

          subtitle: outline.subtitle ? String(outline.subtitle).trim() : null,

          description: outline.description
            ? String(outline.description).trim()
            : null,

          difficulty: courseLevel,

          learningGoal: courseGoal,

          learningStyle: courseStyle,

          estimatedMinutes,
        },
      });

      // --------------------------------
      // Create Modules + Lessons
      // --------------------------------
      // --------------------------------
      // Create Modules + Lessons
      // --------------------------------

      for (const [moduleIndex, moduleData] of outline.modules.entries()) {
        // --------------------------------
        // Calculate Module Duration
        // --------------------------------

        const moduleEstimatedMinutes = moduleData.lessons.reduce(
          (total: number, lesson: AILesson) => {
            const minutes = Number(lesson.estimatedMinutes);

            return total + (minutes > 0 ? minutes : 30);
          },
          0,
        );

        // --------------------------------
        // Create Module
        // --------------------------------

        const createdModule = await tx.module.create({
          data: {
            courseId: createdCourse.id,

            title: moduleData.title.trim(),

            description: moduleData.description
              ? String(moduleData.description).trim()
              : null,

            order: moduleIndex + 1,

            estimatedMinutes: moduleEstimatedMinutes,
          },
        });

        // --------------------------------
        // Create Lessons
        // --------------------------------

        for (const [lessonIndex, lesson] of moduleData.lessons.entries()) {
          const minutes = Number(lesson.estimatedMinutes);

          await tx.lesson.create({
            data: {
              moduleId: createdModule.id,

              title: lesson.title.trim(),

              estimatedMinutes: minutes > 0 ? minutes : 30,

              order: lessonIndex + 1,
            },
          });
        }
      }

      // --------------------------------
      // Return complete course
      // --------------------------------

      return tx.course.findUnique({
        where: {
          id: createdCourse.id,
        },

        include: {
          modules: {
            orderBy: {
              order: "asc",
            },

            include: {
              lessons: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
      });
    });

    // --------------------------------
    // Make sure course exists
    // --------------------------------

    if (!course) {
      throw new Error("Course was created but could not be retrieved");
    }

    // --------------------------------
    // Send response
    // --------------------------------

    return res.status(201).json({
      success: true,

      message: "Course generated successfully",

      data: course,
    });
  } catch (error) {
    // --------------------------------
    // Error handling
    // --------------------------------

    console.error("Course generation error:", error);

    return res.status(500).json({
      success: false,

      message:
        error instanceof Error ? error.message : "Failed to generate course",
    });
  }
});

// 2. Generate ONE lesson
router.post(
  "/:courseId/lessons/:lessonId/generate-content",
  requireAuth,
  async (req, res) => {
    try {
      // --------------------------------
      // Authentication
      // --------------------------------

      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { courseId, lessonId } = req.params;

      // --------------------------------
      // Find course + lesson
      // --------------------------------

      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          userId: authReq.user.id,
        },
        include: {
          modules: {
            include: {
              lessons: {
                where: {
                  id: lessonId,
                },
              },
            },
          },
        },
      });

      // --------------------------------
      // Course not found
      // --------------------------------

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // --------------------------------
      // Find lesson
      // --------------------------------

      let selectedLesson = null;
      let selectedModule = null;

      for (const module of course.modules) {
        const lesson = module.lessons.find((lesson) => lesson.id === lessonId);

        if (lesson) {
          selectedLesson = lesson;
          selectedModule = module;
          break;
        }
      }

      // --------------------------------
      // Lesson not found
      // --------------------------------

      if (!selectedLesson || !selectedModule) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      // --------------------------------
      // Already generated?
      // --------------------------------

      if (selectedLesson.explanation) {
        return res.status(200).json({
          success: true,
          message: "Lesson content already exists",
          data: selectedLesson,
        });
      }

      // --------------------------------
      // Generate ONE lesson
      // --------------------------------

      console.log(`Generating lesson: ${selectedLesson.title}`);

      const content = await generateLessonContent({
        courseTitle: course.title,

        courseGoal: course.learningGoal || "PERSONAL_KNOWLEDGE",

        courseLevel: course.difficulty,

        learningStyle: course.learningStyle || "MIXED",

        moduleTitle: selectedModule.title,

        moduleDescription: selectedModule.description || "",

        lessonTitle: selectedLesson.title,

        estimatedMinutes: selectedLesson.estimatedMinutes || 30,
      });

      // --------------------------------
      // Update lesson
      // --------------------------------

      await prisma.lesson.update({
        where: {
          id: selectedLesson.id,
        },

        data: {
          slug: content.slug,

          explanation: content.explanation,

          keyConcepts: content.keyConcepts,

          examples: content.examples,

          codeExamples: content.codeExamples,

          commonMistakes: content.commonMistakes,
        },
      });

      // ============================================
      // GENERATE & SAVE YOUTUBE RESOURCES
      // ============================================

      try {
        const youtubeQueries = content.youtubeSearchQueries || [];

        // Store all videos before saving
        const allVideos = new Map<
          string,
          {
            videoId: string;
            title: string;
            channelName: string;
            thumbnail: string | null;
            description: string | null;
            url: string;
          }
        >();

        // Search YouTube using all AI-generated queries
        for (const query of youtubeQueries) {
          try {
            const response = await fetch(
              `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${encodeURIComponent(
                query,
              )}&key=${process.env.YOUTUBE_API_KEY}`,
            );

            if (!response.ok) {
              console.error("YouTube API error:", await response.text());

              continue;
            }

            const youtubeData = await response.json();

            for (const item of youtubeData.items || []) {
              const videoId = item.id?.videoId;

              if (!videoId) continue;

              // Remove duplicate videos
              if (allVideos.has(videoId)) {
                continue;
              }

              allVideos.set(videoId, {
                videoId,
                title: item.snippet.title,
                channelName: item.snippet.channelTitle,
                thumbnail:
                  item.snippet.thumbnails?.high?.url ||
                  item.snippet.thumbnails?.default?.url ||
                  null,
                description: item.snippet.description || null,
                url: `https://www.youtube.com/watch?v=${videoId}`,
              });
            }
          } catch (youtubeError) {
            console.error(
              `YouTube search failed for "${query}":`,
              youtubeError,
            );

            // YouTube failure should NOT fail lesson generation
            continue;
          }
        }

        // Keep only the first 5 unique videos
        const selectedVideos = Array.from(allVideos.values()).slice(0, 5);

        // Save videos to database
        for (const video of selectedVideos) {
          try {
            // Check if already exists
            const existingVideo = await prisma.youTubeResource.findUnique({
              where: {
                lessonId_videoId: {
                  lessonId: selectedLesson.id,
                  videoId: video.videoId,
                },
              },
            });

            if (existingVideo) {
              continue;
            }

            await prisma.youTubeResource.create({
              data: {
                lessonId: selectedLesson.id,
                videoId: video.videoId,
                title: video.title,
                channelName: video.channelName,
                thumbnail: video.thumbnail,
                description: video.description,
                url: video.url,
              },
            });
          } catch (saveError) {
            console.error(
              `Failed to save YouTube video ${video.videoId}:`,
              saveError,
            );

            // One video failing should not stop the others
            continue;
          }
        }

        console.log(`YouTube resources saved: ${selectedVideos.length}`);
      } catch (youtubeError) {
        console.error("YouTube resource generation failed:", youtubeError);
      }

      // --------------------------------
      // Create exercises
      // --------------------------------

      await prisma.exercise.deleteMany({
        where: {
          lessonId: selectedLesson.id,
        },
      });

      for (const exercise of content.exercises) {
        await prisma.exercise.create({
          data: {
            lessonId: selectedLesson.id,

            title: exercise.title,

            description: exercise.description,

            difficulty: exercise.difficulty,

            hints: exercise.hints,
          },
        });
      }

      // --------------------------------
      // Normalize quiz questions
      // --------------------------------

      const normalizedQuestions = content.quiz.questions.map(
        (question: any, index: number) => {
          let type = String(question.type || "")
            .trim()
            .toUpperCase();

          // Fix common AI typo
          if (type === "MULTIPLE_CHOLE") {
            type = "MULTIPLE_CHOICE";
          }

          const validQuestionTypes = [
            "MULTIPLE_CHOICE",
            "TRUE_FALSE",
            "SHORT_ANSWER",
          ];

          if (!validQuestionTypes.includes(type)) {
            throw new Error(
              `Invalid question type "${question.type}" at question ${
                index + 1
              }`,
            );
          }

          return {
            question: question.question,

            type: type as QuestionType,

            options: question.options || [],

            answer: question.answer,

            explanation: question.explanation || "",

            difficulty: question.difficulty || "BEGINNER",

            points: question.points || 1,

            order: index + 1,
          };
        },
      );

      // --------------------------------
      // Save quiz
      // --------------------------------

      await prisma.quiz.upsert({
        where: {
          lessonId: selectedLesson.id,
        },

        update: {
          title: content.quiz.title,

          description: content.quiz.description,

          questions: {
            deleteMany: {},

            create: normalizedQuestions,
          },
        },

        create: {
          lessonId: selectedLesson.id,

          title: content.quiz.title,

          description: content.quiz.description,

          questions: {
            create: normalizedQuestions,
          },
        },
      });

      // --------------------------------
      // Get updated lesson
      // --------------------------------

      const updatedLesson = await prisma.lesson.findUnique({
        where: {
          id: selectedLesson.id,
        },

        include: {
          exercises: true,

          quiz: {
            include: {
              questions: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
      });

      // --------------------------------
      // Response
      // --------------------------------

      return res.status(200).json({
        success: true,

        message: "Lesson content generated successfully",

        data: updatedLesson,
      });
    } catch (error) {
      console.error("Lesson content generation error:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // --------------------------------
      // OpenRouter 402 / in-flight limit
      // --------------------------------

      if (
        errorMessage.includes("in_flight_budget_exhausted") ||
        errorMessage.includes("Retry-After") ||
        errorMessage.includes("402")
      ) {
        return res.status(429).json({
          success: false,

          message:
            "AI generation is temporarily busy. Please wait about 2 minutes and try again.",

          code: "AI_RATE_LIMIT",

          retryAfter: 120,
        });
      }

      return res.status(500).json({
        success: false,

        message: errorMessage || "Failed to generate lesson content",
      });
    }
  },
);

export default router;
