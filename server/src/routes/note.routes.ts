import { Router } from "express";
import prisma from "../config/database";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

// ============================================
// GET NOTES FOR A LESSON
// ============================================

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
    const userId = authReq.user.id;

    const notes = await prisma.note.findMany({
      where: {
        userId,
        lessonId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("Get notes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get notes",
    });
  }
});

// ============================================
// CREATE NOTE
// ============================================

router.post("/lesson/:lessonId", requireAuth, async (req, res) => {
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

    const { content } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required",
      });
    }

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

    const note = await prisma.note.create({
      data: {
        userId,
        lessonId,
        content: content.trim(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error) {
    console.error("Create note error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create note",
    });
  }
});

// ============================================
// UPDATE NOTE
// ============================================

router.patch("/:noteId", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const { noteId } = req.params;
    const userId = authReq.user.id;

    const { content } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required",
      });
    }

    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    const note = await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        content: content.trim(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
  } catch (error) {
    console.error("Update note error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update note",
    });
  }
});

// ============================================
// DELETE NOTE
// ============================================

router.delete("/:noteId", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const { noteId } = req.params;
    const userId = authReq.user.id;

    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    await prisma.note.delete({
      where: {
        id: noteId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete note",
    });
  }
});

export default router;
