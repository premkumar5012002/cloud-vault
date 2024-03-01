import { fileActivities, perferences, files, folders, users, storage } from "@/lib/db/schema";

export type Page = "drive" | "recent" | "starred" | "trash" | "search";
export type View = "list" | "grid";
export type Sort = {
	by: "name" | "modified" | "size";
	order: "asc" | "desc";
};

export type User = typeof users.$inferSelect;
export type File = typeof files.$inferSelect;
export type Folder = typeof folders.$inferSelect;
export type Storage = typeof storage.$inferSelect;
export type Perference = typeof perferences.$inferSelect;
export type FileActivity = typeof fileActivities.$inferSelect;
export type BreadCrumb = { id: string; name: string };

export type NewFileActivity = typeof fileActivities.$inferInsert;
