import {
  activeDeployments,
  branch,
  deployment,
  users,
} from "@/server/db/schema";
import { PgTable } from "drizzle-orm/pg-core";

export const resourceMap: Record<string, PgTable> = {
  user: users,
  deployment: deployment,
  active: activeDeployments,
  branch: branch,
};
