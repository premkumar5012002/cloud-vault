import { Folder, File, Sort } from "@/types";
import { files, folders } from "../db/schema";

export const sortItems = (a: File | Folder, b: File | Folder, sort: Sort) => {
	switch (sort.by) {
		case "name":
			return sort.order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
		case "modified":
			return sort.order === "asc"
				? a.updatedAt.getTime() - b.updatedAt.getTime()
				: b.updatedAt.getTime() - a.updatedAt.getTime();
		case "size":
			return sort.order === "asc" ? a.size - b.size : b.size - a.size;
	}
};

export const orderBy = ({ name, size, updatedAt }: any, { asc, desc }: any, sort: Sort) => {
	if (sort.by === "name") {
		return sort.order === "asc" ? asc(name) : desc(name);
	}

	if (sort.by === "modified") {
		return sort.order === "asc" ? asc(updatedAt) : desc(updatedAt);
	}

	return sort.order === "asc" ? asc(size) : desc(size);
};
