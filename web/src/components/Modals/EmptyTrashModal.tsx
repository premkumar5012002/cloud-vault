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

export const EmptyTrashModal: FC<{
  isOpen: boolean;
  onOpenChange: () => void;
}> = ({ isOpen, onOpenChange }) => {
  const utils = trpc.useUtils();

  const { isLoading, mutate } = trpc.contents.emptyTrash.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: async () => {
      await utils.folders.getFolders.invalidate({ page: "trash" });
      await utils.files.getFiles.invalidate({ page: "trash" });
      onOpenChange();
    },
  });

  const handleClick = () => {
    mutate();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className="text-xl">Empty Trash</ModalHeader>
        <ModalBody>
          <p className="text-default-500">
            Are you sure you want to permanently delete all the items in the
            trash.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onOpenChange}>Cancel</Button>
          <Button color="danger" isLoading={isLoading} onClick={handleClick}>
            Delete all
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
