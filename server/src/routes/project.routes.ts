import { Router } from "express";

import prisma from "../config/database";

import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| PROJECT ROUTES
|--------------------------------------------------------------------------
|
| Project
|   -> Project created by the course owner / AI course generation
|
| ProjectSubmission
|   -> Student's personal instance of that project
|
|--------------------------------------------------------------------------
*/

/* ==========================================================================
   GET ALL PROJECTS FOR A COURSE
   GET /api/projects/course/:courseId
   ========================================================================== */

router.get("/course/:courseId", requireAuth, async (req, res) => {
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

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        title: true,
        userId: true,
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const projects = await prisma.project.findMany({
      where: {
        courseId,
      },
      orderBy: {
        order: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Get course projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get projects",
    });
  }
});

/* ==========================================================================
   GET SINGLE PROJECT
   GET /api/projects/:projectId
   ========================================================================== */

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

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        course: {
          select: {
            id: true,
            userId: true,
            title: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get project",
    });
  }
});

/* ==========================================================================
   CREATE PROJECT
   POST /api/projects/course/:courseId
   ========================================================================== */

router.post("/course/:courseId", requireAuth, async (req, res) => {
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

    const {
      title,
      description,
      difficulty,
      requirements,
      features,
      techStack,
      milestones,
      evaluation,
      hints,
      order,
    } = req.body;

    /* ----------------------------------------------------------------------
       Check course
    ---------------------------------------------------------------------- */

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    /* ----------------------------------------------------------------------
       Course ownership
    ---------------------------------------------------------------------- */

    if (course.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to add projects to this course",
      });
    }

    /* ----------------------------------------------------------------------
       Validate title
    ---------------------------------------------------------------------- */

    if (
      !title ||
      typeof title !== "string" ||
      title.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    /* ----------------------------------------------------------------------
       Validate difficulty
    ---------------------------------------------------------------------- */

    const allowedDifficulties = [
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
    ];

    if (
      difficulty !== undefined &&
      difficulty !== null &&
      !allowedDifficulties.includes(difficulty)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Difficulty must be BEGINNER, INTERMEDIATE, or ADVANCED",
      });
    }

    /* ----------------------------------------------------------------------
       Create project
    ---------------------------------------------------------------------- */

    const project = await prisma.project.create({
      data: {
        courseId,

        title: title.trim(),

        description:
          typeof description === "string"
            ? description.trim()
            : null,

        difficulty:
          difficulty || "INTERMEDIATE",

        requirements:
          requirements !== undefined ? requirements : null,

        features:
          features !== undefined ? features : null,

        techStack:
          techStack !== undefined ? techStack : null,

        milestones:
          milestones !== undefined ? milestones : null,

        evaluation:
          evaluation !== undefined ? evaluation : null,

        hints:
          hints !== undefined ? hints : null,

        order:
          order !== undefined && !Number.isNaN(Number(order))
            ? Number(order)
            : 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
});

/* ==========================================================================
   UPDATE PROJECT
   PATCH /api/projects/:projectId
   ========================================================================== */

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

    /* ----------------------------------------------------------------------
       Find project + course owner
    ---------------------------------------------------------------------- */

    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        course: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    /* ----------------------------------------------------------------------
       Only course owner can modify project
    ---------------------------------------------------------------------- */

    if (existingProject.course.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to update this project",
      });
    }

    const {
      title,
      description,
      difficulty,
      requirements,
      features,
      techStack,
      milestones,
      evaluation,
      hints,
      order,
    } = req.body;

    /* ----------------------------------------------------------------------
       Validate title
    ---------------------------------------------------------------------- */

    if (
      title !== undefined &&
      (typeof title !== "string" ||
        title.trim().length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Project title must be a non-empty string",
      });
    }

    /* ----------------------------------------------------------------------
       Validate difficulty
    ---------------------------------------------------------------------- */

    const allowedDifficulties = [
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
    ];

    if (
      difficulty !== undefined &&
      !allowedDifficulties.includes(difficulty)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Difficulty must be BEGINNER, INTERMEDIATE, or ADVANCED",
      });
    }

    /* ----------------------------------------------------------------------
       Validate order
    ---------------------------------------------------------------------- */

    if (
      order !== undefined &&
      (Number.isNaN(Number(order)) ||
        !Number.isInteger(Number(order)))
    ) {
      return res.status(400).json({
        success: false,
        message: "Order must be a valid integer",
      });
    }

    /* ----------------------------------------------------------------------
       Update project
    ---------------------------------------------------------------------- */

    const project = await prisma.project.update({
      where: {
        id: projectId,
      },

      data: {
        ...(title !== undefined && {
          title: title.trim(),
        }),

        ...(description !== undefined && {
          description:
            typeof description === "string"
              ? description.trim()
              : description,
        }),

        ...(difficulty !== undefined && {
          difficulty,
        }),

        ...(requirements !== undefined && {
          requirements,
        }),

        ...(features !== undefined && {
          features,
        }),

        ...(techStack !== undefined && {
          techStack,
        }),

        ...(milestones !== undefined && {
          milestones,
        }),

        ...(evaluation !== undefined && {
          evaluation,
        }),

        ...(hints !== undefined && {
          hints,
        }),

        ...(order !== undefined && {
          order: Number(order),
        }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
});

/* ==========================================================================
   DELETE PROJECT
   DELETE /api/projects/:projectId
   ========================================================================== */

router.delete("/:projectId", requireAuth, async (req, res) => {
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

    /* ----------------------------------------------------------------------
       Find project + course owner
    ---------------------------------------------------------------------- */

    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        course: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    /* ----------------------------------------------------------------------
       Only course owner can delete
    ---------------------------------------------------------------------- */

    if (existingProject.course.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to delete this project",
      });
    }

    /* ----------------------------------------------------------------------
       Delete project
       ProjectSubmission records are deleted automatically because
       Project -> ProjectSubmission uses onDelete: Cascade.
    ---------------------------------------------------------------------- */

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
});

/* ==========================================================================
   START PROJECT
   POST /api/projects/:projectId/start
   ========================================================================== */

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

    /* ----------------------------------------------------------------------
       Check project exists
    ---------------------------------------------------------------------- */

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        courseId: true,
        title: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    /* ----------------------------------------------------------------------
       Check whether student already started it
       @@unique([projectId, userId])
    ---------------------------------------------------------------------- */

    const existingSubmission =
      await prisma.projectSubmission.findUnique({
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
            },
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

    /* ----------------------------------------------------------------------
       Create student's project submission
    ---------------------------------------------------------------------- */

    const submission =
      await prisma.projectSubmission.create({
        data: {
          projectId,
          userId,
          status: "IN_PROGRESS",
        },
        include: {
          project: {
            select: {
              id: true,
              courseId: true,
              title: true,
            },
          },
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

/* ==========================================================================
   GET ALL MY PROJECTS
   GET /api/projects/my
   ========================================================================== */

router.get("/my/list", requireAuth, async (req, res) => {
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

    const submissions =
      await prisma.projectSubmission.findMany({
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
      data: submissions,
    });
  } catch (error) {
    console.error("Get my projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get your projects",
    });
  }
});

/* ==========================================================================
   GET MY PROJECT SUBMISSION
   GET /api/projects/user/:userProjectId
   ========================================================================== */

router.get(
  "/user/:userProjectId",
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

      const { userProjectId } = req.params;
      const userId = authReq.user.id;

      const submission =
        await prisma.projectSubmission.findFirst({
          where: {
            id: userProjectId,
            userId,
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

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Project submission not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      console.error("Get user project error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get project",
      });
    }
  }
);

/* ==========================================================================
   UPDATE MY PROJECT
   PATCH /api/projects/user/:userProjectId
   ========================================================================== */

router.patch(
  "/user/:userProjectId",
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

      const { userProjectId } = req.params;
      const userId = authReq.user.id;

      const {
        githubUrl,
        liveUrl,
        notes,
      } = req.body;

      /* --------------------------------------------------------------------
         Find student's submission
      -------------------------------------------------------------------- */

      const submission =
        await prisma.projectSubmission.findFirst({
          where: {
            id: userProjectId,
            userId,
          },
        });

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Project submission not found",
        });
      }

      /* --------------------------------------------------------------------
         Don't allow editing after submission
      -------------------------------------------------------------------- */

      if (submission.status === "SUBMITTED") {
        return res.status(400).json({
          success: false,
          message:
            "Submitted projects cannot be edited",
        });
      }

      /* --------------------------------------------------------------------
         Validate URLs if provided
      -------------------------------------------------------------------- */

      if (githubUrl !== undefined && githubUrl !== null) {
        if (
          typeof githubUrl !== "string" ||
          !githubUrl.startsWith("http")
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid GitHub URL",
          });
        }
      }

      if (liveUrl !== undefined && liveUrl !== null) {
        if (
          typeof liveUrl !== "string" ||
          !liveUrl.startsWith("http")
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid live URL",
          });
        }
      }

      /* --------------------------------------------------------------------
         Update student's submission
      -------------------------------------------------------------------- */

      const updatedSubmission =
        await prisma.projectSubmission.update({
          where: {
            id: userProjectId,
          },

          data: {
            ...(githubUrl !== undefined && {
              githubUrl,
            }),

            ...(liveUrl !== undefined && {
              liveUrl,
            }),

            ...(notes !== undefined && {
              notes,
            }),
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
        message: "Project updated successfully",
        data: updatedSubmission,
      });
    } catch (error) {
      console.error("Update user project error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update project",
      });
    }
  }
);

/* ==========================================================================
   SUBMIT PROJECT
   POST /api/projects/user/:userProjectId/submit
   ========================================================================== */

router.post(
  "/user/:userProjectId/submit",
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

      const { userProjectId } = req.params;
      const userId = authReq.user.id;

      /* --------------------------------------------------------------------
         Find student's submission
      -------------------------------------------------------------------- */

      const submission =
        await prisma.projectSubmission.findFirst({
          where: {
            id: userProjectId,
            userId,
          },
        });

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Project submission not found",
        });
      }

      /* --------------------------------------------------------------------
         Already submitted
      -------------------------------------------------------------------- */

      if (submission.status === "SUBMITTED") {
        return res.status(400).json({
          success: false,
          message: "Project has already been submitted",
        });
      }

      /* --------------------------------------------------------------------
         Validate project links
      -------------------------------------------------------------------- */

      if (!submission.githubUrl && !submission.liveUrl) {
        return res.status(400).json({
          success: false,
          message:
            "Add a GitHub URL or live project URL before submitting",
        });
      }

      /* --------------------------------------------------------------------
         Submit project
      -------------------------------------------------------------------- */

      const submittedProject =
        await prisma.projectSubmission.update({
          where: {
            id: userProjectId,
          },

          data: {
            status: "SUBMITTED",
            submittedAt: new Date(),
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
        message: "Project submitted successfully",
        data: submittedProject,
      });
    } catch (error) {
      console.error("Submit project error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to submit project",
      });
    }
  }
);

/* ==========================================================================
   MARK PROJECT AS COMPLETED
   POST /api/projects/user/:userProjectId/complete
   ========================================================================== */

router.post(
  "/user/:userProjectId/complete",
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

      const { userProjectId } = req.params;
      const userId = authReq.user.id;

      const submission =
        await prisma.projectSubmission.findFirst({
          where: {
            id: userProjectId,
            userId,
          },
        });

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Project submission not found",
        });
      }

      if (submission.status !== "SUBMITTED") {
        return res.status(400).json({
          success: false,
          message:
            "Project must be submitted before it can be completed",
        });
      }

      const completedProject =
        await prisma.projectSubmission.update({
          where: {
            id: userProjectId,
          },

          data: {
            status: "COMPLETED",
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
        message: "Project completed successfully",
        data: completedProject,
      });
    } catch (error) {
      console.error("Complete project error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to complete project",
      });
    }
  }
);

export default router;