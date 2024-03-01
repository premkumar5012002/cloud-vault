"use client";

import { FC } from "react";
import { toast } from "sonner";
import { useDisclosure } from "@nextui-org/react";

import { Page } from "@/types";
import { trpc } from "@/trpc/client";

import { useSelectionStore } from "@/store/selection";

import { MobileSelectionBar } from "@/components/SelectionBar/Mobile";
import { DesktopSelectionBar } from "@/components/SelectionBar/Desktop";
import { TrashItemsModal } from "@/components/Modals/TrashItemsModal";
import { RenameItemModal } from "@/components/Modals/RenameModal";
import { MoveItemsModal } from "@/components/Modals/MoveItemsModal";
import { DeleteItemsModal } from "@/components/Modals/DeleteItemsModal";

export const SelectionBar: FC<{
  page: Page;
}> = ({ page }) => {
  const utils = trpc.useUtils();

  const { selectedFolders, selectedFiles, clearSelection } =
    useSelectionStore();

  const {
    isOpen: isTrashItemsModalOpen,
    onOpenChange: onTrashItemsOpenChange,
  } = useDisclosure();
  const {
    isOpen: isRenameItemsModalOpen,
    onOpenChange: onRenameItemsOpenChange,
  } = useDisclosure();
  const { isOpen: isMoveItemsModalOpen, onOpenChange: onMoveItemsOpenChange } =
    useDisclosure();
  const {
    isOpen: isDeleteItemsModalOpen,
    onOpenChange: onDeleteItemsOpenChange,
  } = useDisclosure();

  const { mutate: starItems, isLoading: isStarItemsLoading } =
    trpc.contents.star.useMutation({
      onError: (e) => {
        toast.error(e.message);
      },
      onSuccess: async () => {
        let hasRootFolder = false;
        let hasSelectedFolder = selectedFolders.length > 0;
        let hasSelectedFiles = selectedFiles.length > 0;

        const folderIds = new Set<string>();

        for (const selectedFolder of selectedFolders) {
          if (selectedFolder.parentId) {
            folderIds.add(selectedFolder.parentId);
          } else {
            hasRootFolder = true;
          }
        }

        for (const selectedFile of selectedFiles) {
          if (selectedFile.folderId) {
            folderIds.add(selectedFile.folderId);
          } else {
            hasRootFolder = true;
          }
        }

        if (hasRootFolder) {
          if (hasSelectedFolder) {
            await utils.folders.getFolders.invalidate({ page: "drive" });
          }

          if (hasSelectedFiles) {
            await utils.files.getFiles.invalidate({ page: "drive" });
          }
        }

        for (const folderId of folderIds) {
          if (hasSelectedFolder) {
            await utils.folders.getFolders.invalidate({
              page: "drive",
              folderId,
            });
          }

          if (hasSelectedFiles) {
            await utils.files.getFiles.invalidate({ page: "drive", folderId });
          }
        }

        if (hasSelectedFolder) {
          await utils.folders.getFolders.invalidate({ page: "starred" });
        }

        if (hasSelectedFiles) {
          await utils.files.getFiles.invalidate({ page: "starred" });
        }

        clearSelection();
        toast.success(
          "Your selected items have been added to your starred collection!"
        );
      },
    });

  const { mutate: unStarItems, isLoading: isUnStarItemsLoading } =
    trpc.contents.unstar.useMutation({
      onError: (e) => {
        toast.error(e.message);
      },
      onSuccess: async () => {
        let hasRootFolder = false;
        let hasSelectedFolder = selectedFolders.length > 0;
        let hasSelectedFiles = selectedFiles.length > 0;

        const folderIds = new Set<string>();

        for (const selectedFolder of selectedFolders) {
          if (selectedFolder.parentId) {
            folderIds.add(selectedFolder.parentId);
          } else {
            hasRootFolder = true;
          }
        }

        for (const selectedFile of selectedFiles) {
          if (selectedFile.folderId) {
            folderIds.add(selectedFile.folderId);
          } else {
            hasRootFolder = true;
          }
        }

        if (hasRootFolder) {
          if (hasSelectedFolder) {
            await utils.folders.getFolders.invalidate({ page: "drive" });
          }

          if (hasSelectedFiles) {
            await utils.files.getFiles.invalidate({ page: "drive" });
          }
        }

        for (const folderId of folderIds) {
          if (hasSelectedFolder) {
            await utils.folders.getFolders.invalidate({
              page: "drive",
              folderId,
            });
          }

          if (hasSelectedFiles) {
            await utils.files.getFiles.invalidate({ page: "drive", folderId });
          }
        }

        if (hasSelectedFolder) {
          await utils.folders.getFolders.invalidate({ page: "starred" });
        }

        if (hasSelectedFiles) {
          await utils.files.getFiles.invalidate({ page: "starred" });
        }

        clearSelection();
        toast.success(
          "Your selected items have been removed from your starred collection!"
        );
      },
    });

  const { mutate: restoreItems, isLoading: isRestoreItemsLoading } =
    trpc.contents.restore.useMutation({
      onError: (e) => {
        toast.error(e.message);
      },
      onSuccess: async () => {
        let hasRootFolder = false;
        let hasSelectedFolder = selectedFolders.length > 0;
        let hasSelectedFiles = selectedFiles.length > 0;

        const folderIds = new Set<string>();

        for (const selectedFolder of selectedFolders) {
          if (selectedFolder.parentId) {
            folderIds.add(selectedFolder.parentId);
          } else {
            hasRootFolder = true;
          }
        }

        for (const selectedFile of selectedFiles) {
          if (selectedFile.folderId) {
            folderIds.add(selectedFile.folderId);
          } else {
            hasRootFolder = true;
          }
        }

        if (hasRootFolder) {
          if (hasSelectedFolder) {
            await utils.folders.getFolders.invalidate({ page: "drive" });
          }

          if (hasSelectedFiles) {
            await utils.files.getFiles.invalidate({ page: "drive" });
          }
        }

        for (const folderId of folderIds) {
          if (hasSelectedFolder) {
            await utils.folders.getFolders.invalidate({
              page: "drive",
              folderId,
            });
          }

          if (hasSelectedFiles) {
            await utils.files.getFiles.invalidate({ page: "drive", folderId });
          }
        }

        if (hasSelectedFolder) {
          await utils.folders.getFolders.invalidate({ page: "trash" });
        }

        if (hasSelectedFiles) {
          await utils.files.getFiles.invalidate({ page: "trash" });
        }

        clearSelection();
        toast.success("Your selected items have been restored from trash!");
      },
    });

  const onUnStarItems = () => {
    unStarItems({
      folderIds: selectedFolders.map((folder) => folder.id),
      fileIds: selectedFiles.map((file) => file.id),
    });
  };

  const onStarItems = () => {
    starItems({
      folderIds: selectedFolders.map((folder) => folder.id),
      fileIds: selectedFiles.map((file) => file.id),
    });
  };

  const onRestoreItems = () => {
    restoreItems({
      folderIds: selectedFolders.map((folder) => folder.id),
      fileIds: selectedFiles.map((file) => file.id),
    });
  };

  return (
    <>
      <DesktopSelectionBar
        page={page}
        isStarItemsLoading={isStarItemsLoading}
        isUnStarItemsLoading={isUnStarItemsLoading}
        isRestoreItemsLoading={isRestoreItemsLoading}
        onStarItems={onStarItems}
        onUnStarItems={onUnStarItems}
        onRestoreItems={onRestoreItems}
        onTrashItems={onTrashItemsOpenChange}
        onRenameItem={onRenameItemsOpenChange}
        onMoveItems={onMoveItemsOpenChange}
        onDeleteItems={onDeleteItemsOpenChange}
      />
      <MobileSelectionBar
        page={page}
        onStarItems={onStarItems}
        onUnStarItems={onUnStarItems}
        onRestoreItems={onRestoreItems}
        onTrashItems={onTrashItemsOpenChange}
        onRenameItem={onRenameItemsOpenChange}
        onMoveItems={onMoveItemsOpenChange}
        onDeleteItems={onDeleteItemsOpenChange}
      />
      {/* Modals */}
      <TrashItemsModal
        isOpen={isTrashItemsModalOpen}
        onOpenChange={onTrashItemsOpenChange}
      />
      <RenameItemModal
        isOpen={isRenameItemsModalOpen}
        onOpenChange={onRenameItemsOpenChange}
      />
      <MoveItemsModal
        isOpen={isMoveItemsModalOpen}
        onOpenChange={onMoveItemsOpenChange}
      />
      <DeleteItemsModal
        isOpen={isDeleteItemsModalOpen}
        onOpenChange={onDeleteItemsOpenChange}
      />
    </>
  );
};
