import { Router } from "express";
import prisma from "../config/database";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

// ============================================================
// START PROJECT
// ============================================================
// POST /api/project-submissions/:projectId/start
// ============================================================

router.post("/:projectId/start", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const { projectId } = req.params;
    const userId = authReq.user.id;

    // ------------------------------------------------------
    // Check project exists
    // ------------------------------------------------------

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ------------------------------------------------------
    // Create submission
    // ------------------------------------------------------

    // Check whether the user already started this project
    const existingSubmission = await prisma.projectSubmission.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingSubmission) {
      return res.status(200).json({
        success: true,
        message: "Project already started",
        data: existingSubmission,
      });
    }

    // Create a new submission
    const submission = await prisma.projectSubmission.create({
      data: {
        projectId,
        userId,
        status: "IN_PROGRESS",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project started successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Start project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start project",
    });
  }
});

// ============================================================
// GET MY PROJECT SUBMISSION
// ============================================================
// GET /api/project-submissions/:projectId
// ============================================================

router.get("/:projectId", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const { projectId } = req.params;
    const userId = authReq.user.id;

    const submission = await prisma.projectSubmission.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },

      include: {
        project: {
          select: {
            id: true,
            courseId: true,
            title: true,
            description: true,
            difficulty: true,
            requirements: true,
            features: true,
            techStack: true,
            milestones: true,
            evaluation: true,
            hints: true,
            order: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Get project submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get project submission",
    });
  }
});

// ============================================================
// UPDATE PROJECT WORK
// ============================================================
// PATCH /api/project-submissions/:projectId
// ============================================================

router.patch("/:projectId", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const { projectId } = req.params;
    const userId = authReq.user.id;

    const { githubUrl, liveUrl, notes } = req.body;

    // ------------------------------------------------------
    // Find student's submission
    // ------------------------------------------------------

    const existingSubmission = await prisma.projectSubmission.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        message: "Project submission not found. Start the project first.",
      });
    }

    // ------------------------------------------------------
    // Don't allow editing after submission
    // ------------------------------------------------------

    if (existingSubmission.status === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Project has already been submitted",
      });
    }

    const submission = await prisma.projectSubmission.update({
      where: {
        id: existingSubmission.id,
      },

      data: {
        githubUrl:
          githubUrl !== undefined ? githubUrl : existingSubmission.githubUrl,

        liveUrl: liveUrl !== undefined ? liveUrl : existingSubmission.liveUrl,

        notes: notes !== undefined ? notes : existingSubmission.notes,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Update project submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
});

// ============================================================
// SUBMIT PROJECT
// ============================================================
// POST /api/project-submissions/:projectId/submit
// ============================================================

router.post("/:projectId/submit", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const { projectId } = req.params;
    const userId = authReq.user.id;

    // ------------------------------------------------------
    // Find submission
    // ------------------------------------------------------

    const submission = await prisma.projectSubmission.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Project submission not found. Start the project first.",
      });
    }

    // ------------------------------------------------------
    // Check already submitted
    // ------------------------------------------------------

    if (submission.status === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Project already submitted",
      });
    }

    // ------------------------------------------------------
    // Submit project
    // ------------------------------------------------------

    const updatedSubmission = await prisma.projectSubmission.update({
      where: {
        id: submission.id,
      },

      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project submitted successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    console.error("Submit project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit project",
    });
  }
});

// ============================================================
// GET ALL MY PROJECT SUBMISSIONS
// ============================================================
// GET /api/project-submissions
// ============================================================

router.get("/", requireAuth, async (req, res) => {
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

    const submissions = await prisma.projectSubmission.findMany({
      where: {
        userId,
      },

      orderBy: {
        updatedAt: "desc",
      },

      include: {
        project: {
          select: {
            id: true,
            courseId: true,
            title: true,
            description: true,
            difficulty: true,
            order: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Get project submissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get project submissions",
    });
  }
});

export default router;
