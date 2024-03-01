"use client";

import { FC, useEffect } from "react";

import { Page } from "@/types";

import { useSelectionStore } from "@/store/selection";

import { SelectionBar } from "@/components/SelectionBar";
import { ToolBar } from "@/components/ToolBar";

export const ActionBarLayout: FC<{
  page: Page;
  folderId?: string;
  children: React.ReactNode;
}> = ({ page, folderId, children }) => {
  const { selectedFolders, selectedFiles, clearSelection } =
    useSelectionStore();

  useEffect(() => {
    clearSelection();
  }, []);

  return (
    <div>
      {selectedFolders.length + selectedFiles.length > 0 ? (
        <SelectionBar page={page} />
      ) : (
        <ToolBar page={page} folderId={folderId} />
      )}
      {children}
    </div>
  );
};
