import {
  text,
  pgEnum,
  boolean,
  integer,
  pgTable,
  varchar,
  timestamp,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const viewEnum = pgEnum("view", ["list", "grid"]);

export const sortByEnum = pgEnum("sort_by", ["name", "size", "modified"]);

export const sortOrderEnum = pgEnum("sort_order", ["asc", "desc"]);

export const fileActivitiesEnum = pgEnum("file_activities_enum", [
  "UPLOAD",
  "TRASH",
  "UPDATE",
  "RESTORE",
  "PREVIEW",
  "DOWNLOAD",
]);

export const keys = pgTable("keys", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  hashedPassword: text("hashed_password").notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  imageUrl: text("image_url"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRelations = relations(users, ({ one, many }) => ({
  key: one(keys, {
    fields: [users.id],
    references: [keys.userId],
  }),
  storage: one(storage),
  preferences: one(perferences),
  folders: many(folders),
  files: many(files),
}));

export const storage = pgTable("storage", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  totalStorage: integer("total_storage").notNull().default(1073741824),
  usedStorage: integer("used_storage").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const storageRelations = relations(storage, ({ one }) => ({
  user: one(users, {
    fields: [storage.userId],
    references: [users.id],
  }),
}));

export const perferences = pgTable("preferences", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  view: viewEnum("view").default("grid"),
  sortBy: sortByEnum("sort_by").default("name"),
  sortOrder: sortOrderEnum("sort_order").default("asc"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const perferencesRelations = relations(perferences, ({ one }) => ({
  user: one(users, {
    fields: [perferences.userId],
    references: [users.id],
  }),
}));

export const folders = pgTable("folders", {
  id: varchar("id", { length: 25 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 128 }).notNull(),
  size: integer("size").notNull().default(0),
  isStarred: boolean("is_starred").notNull().default(false),
  isTrashed: boolean("is_trashed").notNull().default(false),
  parentId: varchar("parent_id", { length: 25 }).references(
    (): AnyPgColumn => folders.id,
    { onDelete: "cascade" }
  ),
  userId: varchar("user_id", { length: 25 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    relationName: "parent",
    fields: [folders.parentId],
    references: [folders.id],
  }),
  user: one(users, {
    fields: [folders.userId],
    references: [users.id],
  }),
  folders: many(folders, { relationName: "parent" }),
  files: many(files),
}));

export const files = pgTable("files", {
  id: varchar("id", { length: 25 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 128 }).notNull(),
  key: text("key").notNull().unique(),
  size: integer("size").notNull(),
  isStarred: boolean("is_starred").notNull().default(false),
  isTrashed: boolean("is_trashed").notNull().default(false),
  folderId: varchar("folder_id", { length: 25 }).references(() => folders.id, {
    onDelete: "cascade",
  }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
}));

export const fileActivities = pgTable("file_activities", {
  id: varchar("id", { length: 25 })
    .primaryKey()
    .$defaultFn(() => createId()),
  activity: fileActivitiesEnum("activity").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileId: varchar("file_id", { length: 25 })
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});
