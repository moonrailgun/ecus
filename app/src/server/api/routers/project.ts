import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { channel, project } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

// Channels created automatically for every new project.
const DEFAULT_CHANNELS = ["production", "default"];

export const projectRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    const projects = await db.query.project.findMany();

    return projects;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(255),
      }),
    )
    .mutation(async ({ input }) => {
      const created = await db.transaction(async (tx) => {
        const [newProject] = await tx
          .insert(project)
          .values({ name: input.name })
          .returning();

        if (!newProject) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create project",
          });
        }

        await tx.insert(channel).values(
          DEFAULT_CHANNELS.map((name) => ({
            projectId: newProject.id,
            name,
          })),
        );

        return newProject;
      });

      return created;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(255),
      }),
    )
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(project)
        .set({ name: input.name })
        .where(eq(project.id, input.id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return updated;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [deleted] = await db
        .delete(project)
        .where(eq(project.id, input.id))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return deleted;
    }),
});
