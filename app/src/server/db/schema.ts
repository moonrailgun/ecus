import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
import { createId as createCuid } from "@paralleldrive/cuid2";
import { z } from "zod";
import { expoConfigSchema, expoMetadataSchema } from "../api/expo/schema";

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

export const branch = createTable("branch", {
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
});

export const branchRelations = relations(branch, ({ one, many }) => ({
  project: one(project, {
    fields: [branch.projectId],
    references: [project.id],
  }),
}));

export const activeDeployments = createTable(
  "active_deployment",
  {
    projectId: varchar("project_id", { length: 255 }).notNull(),
    runtimeVersion: varchar("runtime_version", { length: 255 }).notNull(),
    branchId: varchar("branch_id", { length: 255 }).notNull(),
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
      columns: [ad.projectId, ad.runtimeVersion, ad.branchId],
    }),
  }),
);

export const deployments = createTable("deployment", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  projectId: varchar("project_id", { length: 255 }).notNull(),
  runtimeVersion: varchar("runtime_version", { length: 255 }),
  expoConfig: jsonb("expo_config")
    .notNull()
    .$type<z.infer<typeof expoConfigSchema>>(),
  metadata: jsonb("metadata")
    .notNull()
    .$type<z.infer<typeof expoMetadataSchema>>(),
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
