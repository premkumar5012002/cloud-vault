import { z } from "zod";

export const ContentIdsSchema = z.object({
	ids: z.object({
		fileIds: z.array(z.string().cuid2()),
		folderIds: z.array(z.string().cuid2()),
	}),
});

export const NewFolderSchema = z.object({
	name: z
		.string()
		.min(1, { message: "Folder name cannot be empty" })
		.max(128, { message: "Folder name exceeds 128 characters" }),
	parentId: z.string().cuid2().optional(),
});

export const UploadFileSchema = z.object({
	name: z.string().min(1),
	folderId: z.string().cuid2().optional(),
});

export const UpdateContentsSchema = ContentIdsSchema.extend({
	name: z
		.string()
		.min(1, { message: "Folder name cannot be empty" })
		.max(128, { message: "Folder name exceeds 128 characters" })
		.optional(),
	isStarred: z.boolean().optional(),
});

export const MoveContentsSchema = ContentIdsSchema.extend({
	folderId: z.string().cuid2().optional(),
});

export const FileMetadataSchema = z.object({
	key: z.string(),
	size: z.number(),
	bucket: z.string(),
});
