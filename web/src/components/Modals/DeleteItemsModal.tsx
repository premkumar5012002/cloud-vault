import { FC } from "react";
import {
  Modal,
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalContent,
} from "@nextui-org/react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";

import { useSelectionStore } from "@/store/selection";

export const DeleteItemsModal: FC<{
  isOpen: boolean;
  onOpenChange: () => void;
}> = ({ isOpen, onOpenChange }) => {
  const utils = trpc.useUtils();

  const { selectedFolders, selectedFiles, clearSelection } =
    useSelectionStore();

  const { isLoading, mutate: deleteItems } = trpc.contents.delete.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: async () => {
      let hasSelectedFolder = selectedFolders.length > 0;
      let hasSelectedFiles = selectedFiles.length > 0;

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

  const handleClick = () => {
    deleteItems({
      folderIds: selectedFolders.map(({ id }) => id),
      fileIds: selectedFiles.map(({ id }) => id),
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className="text-xl">Delete Items</ModalHeader>
        <ModalBody>
          <p className="text-default-500">
            Are you sure you want to permanently delete the selected items.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onOpenChange} color="danger" variant="light">
            Cancel
          </Button>
          <Button color="danger" isLoading={isLoading} onClick={handleClick}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
