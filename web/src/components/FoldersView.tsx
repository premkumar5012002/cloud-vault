"use client";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { Checkbox } from "@nextui-org/react";

import { Folder } from "@/types";
import { cn, formatRelativeDate, formatSize } from "@/lib/utils";

import { useSelectionStore } from "@/store/selection";

export const FolderGrid: FC<{ folder: Folder }> = ({ folder }) => {
  const { selectedFolders, addSelectedFolder, removeSelectedFolder } =
    useSelectionStore();

  const isSelected = selectedFolders.some(({ id }) => id === folder.id);

  const { id, name, parentId, isStarred, updatedAt } = folder;

  return (
    <Link
      key={id}
      href={"/drive/" + id}
      className={cn(
        "relative group flex flex-col items-center rounded-xl py-8 hover:bg-default-50 border",
        isSelected ? "bg-default-50 border-divider" : "border-transparent"
      )}
    >
      <Checkbox
        isSelected={isSelected}
        className={cn(
          "absolute top-2 right-0 block md:hidden group-hover:block",
          isSelected && "md:block"
        )}
        onClick={() => {
          isSelected
            ? removeSelectedFolder(id)
            : addSelectedFolder({ id, name, parentId, isStarred });
        }}
      />
      <Image src="/folder.svg" width={90} height={90} alt="Folder" />
      <div className="relative w-full pb-10">
        <div className="absolute text-center pt-2 px-6 inset-0">
          <p className="font-medium truncate">{folder.name}</p>
          <span className="text-xs text-default-500">
            {formatRelativeDate(updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export const FolderTableRow: FC<{ folder: Folder }> = ({ folder }) => {
  const { selectedFolders, addSelectedFolder, removeSelectedFolder } =
    useSelectionStore();

  const isSelected = selectedFolders.some(({ id }) => id === folder.id);

  const { id, name, parentId, size, isStarred, updatedAt, createdAt } = folder;

  return (
    <tr key={id}>
      <td className="px-6 py-4">
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => {
            isSelected
              ? removeSelectedFolder(id)
              : addSelectedFolder({ id, name, parentId, isStarred });
          }}
        />
      </td>
      <td className="px-6 py-4">
        <Image src="/folder.svg" width={30} height={30} alt="Folder" />
      </td>
      <td className="px-6 py-4">
        <Link href={"/drive/" + id} className="hover:underline">
          {name}
        </Link>
      </td>
      <td className="px-6 py-4">{formatSize(size)}</td>
      <td className="px-6 py-4">{formatRelativeDate(updatedAt)}</td>
      <td className="px-6 py-4">{formatRelativeDate(createdAt)}</td>
    </tr>
  );
};
