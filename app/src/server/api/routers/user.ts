import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { generateRandomSHA256 } from "@/server/utils";
import { eq } from "drizzle-orm";

export const projectRouter = createTRPCRouter({
  getApiKey: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const res = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return res?.apiKey;
  }),
  updateApiKey: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const res = await db
      .update(users)
      .set({
        apiKey: generateRandomSHA256(userId),
      })
      .where(eq(users.id, userId))
      .returning();

    return res[0]?.apiKey;
  }),
});
