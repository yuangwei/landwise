import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { eq, and, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { projects, conversations, waitlistEntries } from "~/server/db/schema";
import { simpleAIService } from "~/server/lib/simple-ai";

// Input schemas
const createProjectSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  prompt: z.string().min(1),
  style: z.enum(["modern", "minimal", "corporate", "creative"]).default("modern"),
});

const updateProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  htmlContent: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  metadata: z.any().optional(),
});

const generateSchema = z.object({
  projectId: z.string().uuid(),
  prompt: z.string().min(1),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional(),
});

const waitlistSchema = z.object({
  projectId: z.string().uuid(),
  email: z.string().email(),
  metadata: z.any().optional(),
});

export const projectRouter = createTRPCRouter({
  // Create a new project
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const projectId = uuidv4();
      const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${projectId.slice(0, 8)}`;

      const [project] = await ctx.db.insert(projects).values({
        id: projectId,
        userId: ctx.session.user.id,
        title: input.title,
        description: input.description,
        prompt: input.prompt,
        slug,
        metadata: { style: input.style },
      }).returning();

      return project;
    }),

  // Generate landing page content
  generate: protectedProcedure
    .input(generateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // Generate the landing page
      const result = await simpleAIService.generateLandingPage(
        input.prompt,
        {
          userPrompt: input.prompt,
          previousMessages: input.conversationHistory,
          currentContent: project.htmlContent ?? undefined,
          style: (project.metadata as { style?: string })?.style ?? "modern",
        }
      );

      // Update project with generated content
      const [updatedProject] = await ctx.db
        .update(projects)
        .set({
          htmlContent: result.html,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, input.projectId))
        .returning();

      // Save conversation
      const messages = [
        ...(input.conversationHistory ?? []),
        { role: "user" as const, content: input.prompt },
        { role: "assistant" as const, content: result.html },
      ];

      await ctx.db.insert(conversations).values({
        projectId: input.projectId,
        messages,
      });

      return {
        project: updatedProject,
        generationResult: result,
      };
    }),

  // Get user's projects
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const userProjects = await ctx.db.query.projects.findMany({
        where: eq(projects.userId, ctx.session.user.id),
        orderBy: [desc(projects.updatedAt)],
        limit: input.limit,
        offset: input.offset,
      });

      return userProjects;
    }),

  // Get single project with details
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.id),
          eq(projects.userId, ctx.session.user.id)
        ),
        with: {
          conversations: {
            orderBy: [desc(conversations.createdAt)],
            limit: 1,
          },
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      return project;
    }),

  // Get project by slug (public access)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.slug, input.slug),
          eq(projects.status, "published")
        ),
      });

      if (!project) {
        throw new Error("Landing page not found");
      }

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        htmlContent: project.htmlContent,
        metadata: project.metadata,
      };
    }),

  // Update project
  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, id),
          eq(projects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      const [updatedProject] = await ctx.db
        .update(projects)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      return updatedProject;
    }),

  // Publish project
  publish: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.id),
          eq(projects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      if (!project.htmlContent) {
        throw new Error("Cannot publish project without generated content");
      }

      const [publishedProject] = await ctx.db
        .update(projects)
        .set({
          status: "published",
          updatedAt: new Date(),
        })
        .where(eq(projects.id, input.id))
        .returning();

      return publishedProject;
    }),

  // Get conversation history
  getConversation: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      const conversation = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.projectId, input.projectId),
        orderBy: [desc(conversations.createdAt)],
      });

      return conversation?.messages ?? [];
    }),

  // Add waitlist entry (public endpoint)
  addWaitlistEntry: publicProcedure
    .input(waitlistSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify project exists and is published
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.status, "published")
        ),
      });

      if (!project) {
        throw new Error("Landing page not found or not published");
      }

      const [entry] = await ctx.db.insert(waitlistEntries).values({
        projectId: input.projectId,
        email: input.email,
        metadata: input.metadata,
      }).returning();

      return entry;
    }),

  // Get waitlist entries for a project
  getWaitlistEntries: protectedProcedure
    .input(z.object({
      projectId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      const entries = await ctx.db.query.waitlistEntries.findMany({
        where: eq(waitlistEntries.projectId, input.projectId),
        orderBy: [desc(waitlistEntries.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });

      return entries;
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.id),
          eq(projects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      await ctx.db.delete(projects).where(eq(projects.id, input.id));

      return { success: true };
    }),
}); 