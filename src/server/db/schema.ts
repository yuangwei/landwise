// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  varchar,
  text,
  timestamp,
  jsonb,
  uuid,
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `landingwise_${name}`);

// Enums
export const projectStatusEnum = pgEnum("project_status", ["draft", "published"]);

// Users table for better-auth integration
export const users = createTable(
  "user",
  {
    id: varchar({ length: 255 }).primaryKey(),
    email: varchar({ length: 255 }).notNull().unique(),
    name: varchar({ length: 255 }),
    image: varchar({ length: 255 }),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  },
  (t) => [index("email_idx").on(t.email)]
);

// Sessions table for better-auth
export const sessions = createTable(
  "session",
  {
    id: varchar({ length: 255 }).primaryKey(),
    userId: varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: varchar({ length: 255 }).notNull().unique(),
    ipAddress: varchar({ length: 45 }),
    userAgent: text(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => [
    index("session_user_idx").on(t.userId),
    index("session_token_idx").on(t.token),
  ]
);

// Projects table - user's landing page projects
export const projects = createTable(
  "project",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    prompt: text().notNull(),
    status: projectStatusEnum().default("draft").notNull(),
    htmlContent: text(),
    metadata: jsonb(), // Store design config, colors, etc.
    slug: varchar({ length: 255 }).unique(), // For public URL
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  },
  (t) => [
    index("project_user_idx").on(t.userId),
    index("project_slug_idx").on(t.slug),
    index("project_status_idx").on(t.status),
  ]
);

// Conversations table - chat history for each project
export const conversations = createTable(
  "conversation",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    messages: jsonb().notNull(), // Array of {role: "user" | "assistant", content: string}
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  },
  (t) => [
    index("conversation_project_idx").on(t.projectId),
    index("conversation_created_idx").on(t.createdAt),
  ]
);

// Waitlist entries - emails collected from published landing pages
export const waitlistEntries = createTable(
  "waitlist_entry",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    email: varchar({ length: 255 }).notNull(),
    metadata: jsonb(), // Additional form data if needed
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => [
    index("waitlist_project_idx").on(t.projectId),
    index("waitlist_email_idx").on(t.email),
    index("waitlist_created_idx").on(t.createdAt),
  ]
);

// Accounts table for better-auth OAuth providers
export const accounts = createTable(
  "account",
  {
    id: varchar({ length: 255 }).primaryKey(),
    userId: varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: varchar({ length: 255 }).notNull(),
    providerId: varchar({ length: 255 }).notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: varchar({ length: 255 }),
    password: varchar({ length: 255 }),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  },
  (t) => [
    index("account_user_idx").on(t.userId),
    index("account_provider_idx").on(t.providerId, t.accountId),
  ]
);

// Verification table for better-auth email verification
export const verifications = createTable(
  "verification",
  {
    id: varchar({ length: 255 }).primaryKey(),
    identifier: varchar({ length: 255 }).notNull(),
    value: varchar({ length: 255 }).notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  },
  (t) => [
    index("verification_identifier_idx").on(t.identifier),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  conversations: many(conversations),
  waitlistEntries: many(waitlistEntries),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  project: one(projects, {
    fields: [conversations.projectId],
    references: [projects.id],
  }),
}));

export const waitlistEntriesRelations = relations(waitlistEntries, ({ one }) => ({
  project: one(projects, {
    fields: [waitlistEntries.projectId],
    references: [projects.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
