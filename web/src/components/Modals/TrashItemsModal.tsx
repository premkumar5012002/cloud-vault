import {
  Modal,
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalContent,
} from "@nextui-org/react";
import { FC } from "react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";

import { useSelectionStore } from "@/store/selection";

export const TrashItemsModal: FC<{
  isOpen: boolean;
  onOpenChange: () => void;
}> = ({ isOpen, onOpenChange }) => {
  const utils = trpc.useUtils();

  const { selectedFolders, selectedFiles, clearSelection } =
    useSelectionStore();

  const { mutate: trashItems, isLoading } = trpc.contents.trash.useMutation({
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
          console.log("Running");

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
      onOpenChange();
    },
  });

  const onTrashItems = () => {
    trashItems({
      folderIds: selectedFolders.map(({ id }) => id),
      fileIds: selectedFiles.map(({ id }) => id),
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className="text-xl">Trash Items</ModalHeader>
        <ModalBody>
          <p className="text-default-500">
            Are you sure you want to send this selected items to the trash.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onOpenChange}>Cancel</Button>
          <Button color="danger" isLoading={isLoading} onClick={onTrashItems}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
