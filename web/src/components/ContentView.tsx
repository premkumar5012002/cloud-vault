"use client";

import { FC, useEffect } from "react";
import { Checkbox } from "@nextui-org/react";

import { trpc } from "@/trpc/client";
import { Folder, File, Page } from "@/types";
import { sortItems } from "@/lib/helpers/sort";

import { useSelectionStore } from "@/store/selection";
import { usePerferenceContext } from "@/hooks/useContext";

import { FolderGrid, FolderTableRow } from "@/components/FoldersView";
import { NoRecentFilesView } from "@/components//NoRecentFilesView";
import { EmptyDriveView } from "@/components/EmptyDriveView";
import { NoStarredContentsView } from "@/components/NoStarredContentsView";
import { EmptyTrashView } from "@/components/EmptyTrashView";
import { NoSearchResultView } from "./NoSearchResultView";
import { FileGrid, FileTableRow } from "./FilesView";

const HEADERS = ["TYPE", "NAME", "SIZE", "MODIFIED AT", "CREATED AT"];

export const ContentView: FC<{
  page: Page;
  folderId?: string;
  data: { folders: Folder[]; files: File[] };
}> = ({ page, folderId, data }) => {
  const utils = trpc.useUtils();

  const { view, sort } = usePerferenceContext(({ view, sort }) => ({
    view,
    sort,
  }));

  const {
    selectedFolders,
    selectedFiles,
    setSelectedFolders,
    setSelectedFiles,
    clearSelection,
  } = useSelectionStore();

  const { data: folders } = trpc.folders.getFolders.useQuery(
    { page, folderId },
    { enabled: false, initialData: data.folders }
  );

  const { data: files } = trpc.files.getFiles.useQuery(
    { page, folderId },
    { enabled: false, initialData: data.files }
  );

  useEffect(() => {
    utils.folders.getFolders.setData({ page, folderId }, (prev) => {
      return prev?.sort((a, b) => sortItems(a, b, sort));
    });

    utils.files.getFiles.setData({ page, folderId }, (prev) => {
      return prev?.sort((a, b) => sortItems(a, b, sort));
    });
  }, [folders, files, sort]);

  if (page === "recent" && files.length === 0) {
    return <NoRecentFilesView />;
  }

  if (
    (page === "search" ? data.folders : folders).length === 0 &&
    (page === "search" ? data.files : files).length === 0
  ) {
    switch (page) {
      case "drive":
        return <EmptyDriveView />;
      case "starred":
        return <NoStarredContentsView />;
      case "trash":
        return <EmptyTrashView />;
      default:
        return <NoSearchResultView />;
    }
  }

  if (view === "grid") {
    return (
      <div className="pt-4 grid gap-8 grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1700px]:grid-cols-6 min-[1900px]:grid-cols-8 overflow-y-auto px-6">
        {(page === "search" ? data.folders : folders).map((folder) => (
          <FolderGrid key={folder.id} folder={folder} />
        ))}
        {(page === "search" ? data.files : files).map((file) => (
          <FileGrid key={file.id} file={file} />
        ))}
      </div>
    );
  }

  const isAllSelected =
    selectedFolders.length + selectedFiles.length ===
    folders.length + files.length;

  const onSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      setSelectedFolders(folders);
      setSelectedFiles(files);
    }
  };

  return (
    <div className="overflow-x-auto pt-2 px-6">
      <table className="w-full text-sm text-left rtl:text-right">
        <thead className="text-xs text-default-500 uppercase bg-default-50">
          <tr>
            <th scope="col" className="px-6 py-3">
              <Checkbox isSelected={isAllSelected} onClick={onSelectAll} />
            </th>
            {HEADERS.map((header) => (
              <th key={header} scope="col" className="px-6 py-3 truncate">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(page === "search" ? data.folders : folders).map((folder) => (
            <FolderTableRow key={folder.id} folder={folder} />
          ))}
          {(page === "search" ? data.files : files).map((file) => (
            <FileTableRow key={file.id} file={file} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
