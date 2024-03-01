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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/trpc/client";
import { preventDefaultOnEnterKey } from "@/lib/utils";

export const NewFolderModal: FC<{
  isOpen: boolean;
  folderId?: string;
  onOpenChange: () => void;
}> = ({ folderId, isOpen, onOpenChange }) => {
  const utils = trpc.useUtils();

  const { isLoading, mutate } = trpc.folders.new.useMutation({
    onSuccess: async () => {
      await utils.folders.getFolders.invalidate({ page: "drive", folderId });
      onClose();
    },
  });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string }>({
    resolver: zodResolver(
      z.object({
        name: z
          .string()
          .min(1, { message: "Folder name cannot be empty" })
          .max(128, { message: "Folder name exceeds 128 characters" }),
      })
    ),
  });

  const onClose = () => {
    reset();
    onOpenChange();
  };

  const onSubmit = handleSubmit((data) => {
    mutate({ name: data.name, parentId: folderId });
  });

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <form onSubmit={onSubmit}>
        <ModalContent>
          <ModalHeader className="text-xl font-semibold">
            New Folder
          </ModalHeader>
          <ModalBody>
            <Input
              id="name"
              autoFocus
              {...register("name")}
              labelPlacement="outside"
              placeholder="Enter your folder name"
              color={errors.name ? "danger" : "default"}
              errorMessage={errors.name && errors.name.message}
              onKeyDown={(e) => preventDefaultOnEnterKey(e, onSubmit)}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
            <Button type="submit" color="primary" isLoading={isLoading}>
              Create Folder
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};
