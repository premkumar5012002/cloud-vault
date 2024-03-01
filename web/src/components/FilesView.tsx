"use client";

import { FC } from "react";
import { Checkbox } from "@nextui-org/react";

import { File } from "@/types";
import { cn, formatRelativeDate, formatSize } from "@/lib/utils";

import { useSelectionStore } from "@/store/selection";

export const FileGrid: FC<{ file: File }> = ({ file }) => {
  const { selectedFiles, addSelectedFile, removeSelectedFile } =
    useSelectionStore();

  const isSelected = selectedFiles.some(({ id }) => id === file.id);

  const { id, name, folderId, isStarred, updatedAt } = file;

  return (
    <button
      key={file.id}
      className={cn(
        "relative group flex flex-col items-center rounded-xl py-8 hover:bg-default-50 border",
        isSelected ? "bg-default-50 border-divider" : "border-transparent"
      )}
      onClick={() => {}}
    >
      <Checkbox
        isSelected={isSelected}
        className={cn(
          "absolute top-2 right-0 block md:hidden group-hover:block",
          isSelected && "md:block"
        )}
        onValueChange={() => {
          isSelected
            ? removeSelectedFile(id)
            : addSelectedFile({ id, name, folderId, isStarred });
        }}
      />
      <div className="relative w-full pb-10">
        <div className="absolute text-center pt-2 px-6 inset-0">
          <p className="font-medium truncate">{name}</p>
          <span className="text-xs text-default-500">
            {formatRelativeDate(updatedAt)}
          </span>
        </div>
      </div>
    </button>
  );
};

export const FileTableRow: FC<{ file: File }> = ({ file }) => {
  const { selectedFiles, addSelectedFile, removeSelectedFile } =
    useSelectionStore();

  const isSelected = selectedFiles.some(({ id }) => id === file.id);

  const { id, name, size, folderId, isStarred, updatedAt, uploadedAt } = file;

  return (
    <tr key={id}>
      <td className="px-6 py-4">
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => {
            isSelected
              ? removeSelectedFile(id)
              : addSelectedFile({ id, name, folderId, isStarred });
          }}
        />
      </td>
      <td className="px-6 py-4"></td>
      <td className="px-6 py-4">
        <button className="hover:underline" onClick={() => {}}>
          {name}
        </button>
      </td>
      <td className="px-6 py-4">{formatSize(size)}</td>
      <td className="px-6 py-4">{formatRelativeDate(updatedAt)}</td>
      <td className="px-6 py-4">{formatRelativeDate(uploadedAt)}</td>
    </tr>
  );
};
