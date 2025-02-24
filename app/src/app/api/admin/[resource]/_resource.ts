import {
  activeDeployments,
  channel,
  deployments,
  users,
} from "@/server/db/schema";
import { PgTable } from "drizzle-orm/pg-core";

export const resourceMap: Record<string, PgTable> = {
  user: users,
  deployment: deployments,
  active: activeDeployments,
  channel: channel,
};
