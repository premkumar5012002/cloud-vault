import { z } from "zod";
import {
  Input,
  Modal,
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalContent,
} from "@nextui-org/react";
import { FC } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/trpc/client";
import { Folder, File } from "@/types";
import { preventDefaultOnEnterKey } from "@/lib/utils";

import { useSelectionStore } from "@/store/selection";

export const RenameItemModal: FC<{
  isOpen: boolean;
  onOpenChange: () => void;
}> = ({ isOpen, onOpenChange }) => {
  const utils = trpc.useUtils();

  const { selectedFolders, selectedFiles, clearSelection } =
    useSelectionStore();

  const isSelectedFolder = selectedFolders.length > 0;

  const selectedItem = isSelectedFolder ? selectedFolders[0] : selectedFiles[0];

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string }>({
    values: { name: selectedItem.name },
    resolver: zodResolver(z.object({ name: z.string().min(1).max(128) })),
  });

  const { isLoading, mutate } = trpc.contents.rename.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: async () => {
      if (isSelectedFolder) {
        const { parentId } = selectedItem as Folder;
        await utils.folders.getFolders.invalidate({
          page: "drive",
          folderId: parentId ?? undefined,
        });
      } else {
        const { folderId } = selectedItem as File;
        await utils.files.getFiles.invalidate({
          page: "drive",
          folderId: folderId ?? undefined,
        });
      }

      clearSelection();
      toast.success("Item has been renamed successfully.");
    },
  });

  const onClose = () => {
    reset();
    onOpenChange();
  };

  const onSubmit = handleSubmit((data) => {
    mutate({ id: selectedItem.id, name: data.name });
  });

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <form onSubmit={onSubmit}>
        <ModalContent>
          <ModalHeader className="text-xl">Rename</ModalHeader>
          <ModalBody>
            <Input
              id="name"
              autoFocus
              {...register("name")}
              labelPlacement="outside"
              placeholder={`Enter your new name`}
              color={errors.name ? "danger" : "default"}
              errorMessage={errors.name && errors.name.message}
              onKeyDown={(e) => preventDefaultOnEnterKey(e, onSubmit)}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
            <Button type="submit" color="primary" isLoading={isLoading}>
              Rename
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};
