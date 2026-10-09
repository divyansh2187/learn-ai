
import { Router } from "express";
import prisma from "../config/database";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";
import { searchYouTubeVideos } from "../services/youtube/youtube.service";

const router = Router();

// ============================================
// HELPER: FIND LESSON AND ITS COURSE
// ============================================

async function getLessonWithCourse(lessonId: string) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            select: {
              id: true,
              userId: true,
              isPublic: true,
            },
          },
        },
      },
    },
  });
}

// ============================================
// GET YOUTUBE VIDEOS FOR ANY EXISTING COURSE
// Every authenticated user can view videos.
// Watched status belongs to the current user.
// ============================================

router.get("/lesson/:lessonId", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { lessonId } = req.params;
    const userId = authReq.user.id;

    const lesson = await getLessonWithCourse(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const resources = await prisma.youTubeResource.findMany({
      where: { lessonId },
      select: {
        id: true,
        lessonId: true,
        videoId: true,
        title: true,
        channelName: true,
        thumbnail: true,
        description: true,
        duration: true,
        publishedAt: true,
        url: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const resourceIds = resources.map((resource) => resource.id);

    const progress =
      resourceIds.length > 0
        ? await prisma.youTubeResourceProgress.findMany({
            where: {
              userId,
              resourceId: { in: resourceIds },
            },
            select: {
              resourceId: true,
              isWatched: true,
              watchedAt: true,
            },
          })
        : [];

    const progressMap = new Map(
      progress.map((item) => [item.resourceId, item]),
    );

    const data = resources.map((resource) => {
      const userProgress = progressMap.get(resource.id);

      return {
        ...resource,
        isWatched: userProgress?.isWatched ?? false,
        watchedAt: userProgress?.watchedAt ?? null,
      };
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get YouTube resources error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get YouTube resources",
    });
  }
});

// ============================================
// ADD YOUTUBE VIDEO
// Only the course owner can add videos.
// ============================================

router.post("/lesson/:lessonId", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { lessonId } = req.params;
    const userId = authReq.user.id;

    const lesson = await getLessonWithCourse(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    if (lesson.module.course.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the course owner can add YouTube resources",
      });
    }

    const {
      videoId,
      title,
      channelName,
      thumbnail,
      description,
      duration,
      publishedAt,
      url,
    } = req.body;

    if (typeof videoId !== "string" || !videoId.trim()) {
      return res.status(400).json({
        success: false,
        message: "videoId is required",
      });
    }

    const normalizedVideoId = videoId.trim();

    if (!/^[a-zA-Z0-9_-]{11}$/.test(normalizedVideoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid YouTube video ID",
      });
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    if (typeof url !== "string" || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: "url is required",
      });
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid URL",
      });
    }

    const allowedHosts = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",
    ];

    if (
      parsedUrl.protocol !== "https:" ||
      !allowedHosts.includes(parsedUrl.hostname)
    ) {
      return res.status(400).json({
        success: false,
        message: "URL must be an HTTPS YouTube URL",
      });
    }

    let durationValue: number | null = null;

    if (duration !== undefined && duration !== null && duration !== "") {
      durationValue = Number(duration);

      if (
        !Number.isInteger(durationValue) ||
        durationValue < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Duration must be a non-negative integer",
        });
      }
    }

    let publishedAtValue: Date | null = null;

    if (
      publishedAt !== undefined &&
      publishedAt !== null &&
      publishedAt !== ""
    ) {
      const date = new Date(publishedAt);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid publishedAt date",
        });
      }

      publishedAtValue = date;
    }

    const existing = await prisma.youTubeResource.findUnique({
      where: {
        lessonId_videoId: {
          lessonId,
          videoId: normalizedVideoId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This YouTube video already exists for this lesson",
      });
    }

    const resource = await prisma.youTubeResource.create({
      data: {
        lessonId,
        videoId: normalizedVideoId,
        title: title.trim(),
        channelName:
          typeof channelName === "string"
            ? channelName.trim() || null
            : null,
        thumbnail:
          typeof thumbnail === "string"
            ? thumbnail.trim() || null
            : null,
        description:
          typeof description === "string"
            ? description.trim() || null
            : null,
        duration: durationValue,
        publishedAt: publishedAtValue,
        url: parsedUrl.toString(),
      },
      select: {
        id: true,
        lessonId: true,
        videoId: true,
        title: true,
        channelName: true,
        thumbnail: true,
        description: true,
        duration: true,
        publishedAt: true,
        url: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "YouTube resource added successfully",
      data: resource,
    });
  } catch (error) {
    console.error("Add YouTube resource error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add YouTube resource",
    });
  }
});

// ============================================
// MARK VIDEO WATCHED / UNWATCHED
// Every user updates only their own progress.
// ============================================

router.patch("/:resourceId/watched", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { resourceId } = req.params;
    const userId = authReq.user.id;
    const { watched } = req.body;

    if (typeof watched !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "watched must be a boolean",
      });
    }

    const resource = await prisma.youTubeResource.findUnique({
      where: { id: resourceId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: {
                  select: {
                    id: true,
                    userId: true,
                    isPublic: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "YouTube resource not found",
      });
    }

    const progress = await prisma.youTubeResourceProgress.upsert({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
      create: {
        userId,
        resourceId,
        isWatched: watched,
        watchedAt: watched ? new Date() : null,
      },
      update: {
        isWatched: watched,
        watchedAt: watched ? new Date() : null,
      },
      select: {
        resourceId: true,
        isWatched: true,
        watchedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: watched
        ? "Video marked as watched"
        : "Video marked as unwatched",
      data: progress,
    });
  } catch (error) {
    console.error("Update watched status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update watched status",
    });
  }
});

// ============================================
// DELETE YOUTUBE VIDEO
// Only the course owner can delete videos.
// ============================================

router.delete("/:resourceId", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { resourceId } = req.params;
    const userId = authReq.user.id;

    const resource = await prisma.youTubeResource.findUnique({
      where: { id: resourceId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "YouTube resource not found",
      });
    }

    if (resource.lesson.module.course.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the course owner can delete YouTube resources",
      });
    }

    await prisma.youTubeResource.delete({
      where: { id: resourceId },
    });

    return res.status(200).json({
      success: true,
      message: "YouTube resource deleted successfully",
    });
  } catch (error) {
    console.error("Delete YouTube resource error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete YouTube resource",
    });
  }
});

// ============================================
// SEARCH YOUTUBE
// Search results are not saved automatically.
// ============================================

router.get("/search", requireAuth, async (req, res) => {
  try {
    const query = String(req.query.q ?? "").trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    if (query.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Search query must be 200 characters or fewer",
      });
    }

    const videos = await searchYouTubeVideos(query, 3);

    return res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error("YouTube search error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search YouTube",
    });
  }
});

export default router;
