import { sql } from "drizzle-orm";

import { db } from "../db";

type Result = {
	id: string;
	key: string;
	size: number;
};

export const getAllFiles = async (folderIds: string[]) => {
	if (folderIds.length === 0) return [];

	const result = await db.execute(sql`
    WITH RECURSIVE file_tree AS (
      SELECT id, key, size, folder_id
      FROM files
      WHERE folder_id IN ${folderIds}
      UNION ALL
      SELECT f.id, f.key, f.size, f.folder_id
      FROM files f
      JOIN file_tree ft ON f.folder_id = ft.id
    ) SELECT id, key, size FROM file_tree
  `);

	return result.rows as Result[];
};
