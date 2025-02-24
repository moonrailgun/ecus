import { eq, InferSelectModel } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { cacheManager } from ".";

export async function getUserInfoWithApikey(
  apiKey: string,
): Promise<InferSelectModel<typeof users> | undefined> {
  const cacheKey = `userWithApikey:${apiKey}`;
  const cache = await cacheManager.get<string>(cacheKey);

  if (cache) {
    return JSON.parse(cache);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.apiKey, apiKey),
  });

  cacheManager.set(cacheKey, JSON.stringify(user));

  return user;
}
