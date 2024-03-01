import { z } from "zod";
import {
  Input,
  Modal,
  Button,
  Divider,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalContent,
} from "@nextui-org/react";
import { FC } from "react";
import { User } from "lucia";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/trpc/client";

export const DeleteAccountModal: FC<{
  user: User;
  isOpen: boolean;
  onOpenChange: () => void;
}> = ({ user, isOpen, onOpenChange }) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<{ email: string }>({
    resolver: zodResolver(
      z.object({
        email: z.string().refine((values) => {
          return values === user.email;
        }),
      })
    ),
  });

  const { isLoading, mutate } = trpc.user.deleteAccount.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: async () => {
      router.replace("/");
    },
  });

  const onSubmit = handleSubmit(() => {
    if (isLoading === false) {
      mutate();
    }
  });

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={onSubmit}>
          <ModalHeader className="pb-2">
            <h3 className="text-2xl font-bold text-danger">
              Delete my account
            </h3>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-500 pb-3">
              This action cannot be undone. This will permanently delete your
              entire account. All private files and data will be deleted.
            </p>
            <Input
              labelPlacement="outside"
              placeholder={user.email}
              {...register("email")}
              label="Please type in your email to confirm."
            />
          </ModalBody>
          <Divider className="mt-4" />
          <ModalFooter>
            <Button onClick={onOpenChange}>Cancel</Button>
            <Button
              type="submit"
              color="danger"
              isLoading={isLoading}
              isDisabled={isValid === false}
            >
              Delete account
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
