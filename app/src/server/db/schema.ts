import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
import { createId as createCuid } from "@paralleldrive/cuid2";
import { z } from "zod";
import {
  expoConfigSchema,
  expoMetadataSchema,
  gitInfoSchema,
} from "../api/expo/schema";
import { generateRandomSHA256 } from "../utils";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => name);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => createCuid()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  apiKey: varchar("api_key", { length: 255 }).$defaultFn(() =>
    generateRandomSHA256(Date.now().toString()),
  ),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const project = createTable("project", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createCuid()),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const projectRelations = relations(project, ({ many }) => ({
  deployments: many(deployments),
}));

export const channel = createTable(
  "channel",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => createCuid()),
    projectId: varchar("project_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (c) => ({
    uniq: uniqueIndex("project_channel_name_idx").on(c.projectId, c.name),
  }),
);

export const channelRelations = relations(channel, ({ one }) => ({
  project: one(project, {
    fields: [channel.projectId],
    references: [project.id],
  }),
}));

export const activeDeployments = createTable(
  "active_deployment",
  {
    projectId: varchar("project_id", { length: 255 }).notNull(),
    runtimeVersion: varchar("runtime_version", { length: 255 }).notNull(),
    channelId: varchar("channel_id", { length: 255 }).notNull(),
    deploymentId: uuid("deployment_id"),
    updateId: uuid("update_id").$onUpdate(() => sql`gen_random_uuid()`), // this design is for make sure every time active deployment is update, its can be trigger update in client.
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (ad) => ({
    compoundKey: primaryKey({
      name: "active_deployment_pk",
      columns: [ad.projectId, ad.runtimeVersion, ad.channelId],
    }),
  }),
);

export const deployments = createTable("deployment", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  projectId: varchar("project_id", { length: 255 }).notNull(),
  runtimeVersion: varchar("runtime_version", { length: 255 }),
  metadata: jsonb("metadata")
    .notNull()
    .$type<z.infer<typeof expoMetadataSchema>>(),
  expoConfig: jsonb("expo_config")
    .notNull()
    .$type<z.infer<typeof expoConfigSchema>>(),
  updateMetadata: jsonb("update_metadata"), // info for update which can pass to client
  gitInfo: jsonb("git_info").$type<z.infer<typeof gitInfoSchema>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const deploymentRelations = relations(deployments, ({ one }) => ({
  author: one(users, {
    fields: [deployments.userId],
    references: [users.id],
  }),
  project: one(project, {
    fields: [deployments.projectId],
    references: [project.id],
  }),
}));

export const auditLog = createTable("audit_log", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createCuid()),
  projectId: varchar("project_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  content: text("content"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const accessLog = createTable(
  "access_log",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => createCuid()),
    projectId: varchar("project_id", { length: 255 }).notNull(),
    platform: varchar("platform"),
    clientId: varchar("client_id"),
    runtimeVersion: varchar("runtime_version"),
    channelName: varchar("channel_name"),
    currentUpdateId: varchar("current_update_id"),
    embeddedUpdateId: varchar("embedded_update_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    projectIdIdx: index("access_log_project_id_idx").on(table.projectId),
    clientIdIdx: index("access_log_client_id_idx").on(table.clientId),
    createdAtIdx: index("access_log_created_at_idx").on(table.createdAt),
    clientCreatedIdx: index("access_log_client_created_idx").on(
      table.clientId,
      table.createdAt,
    ),
  }),
);

export const activeDeploymentHistory = createTable(
  "active_deployment_history",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => createCuid()),
    projectId: varchar("project_id", { length: 255 }).notNull(),
    runtimeVersion: varchar("runtime_version", { length: 255 }).notNull(),
    channelId: varchar("channel_id", { length: 255 }).notNull(),
    deploymentId: uuid("deployment_id"),
    updateId: uuid("update_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    updateIdIdx: index("active_deployment_history_update_id_idx").on(
      table.updateId,
    ),
  }),
);
