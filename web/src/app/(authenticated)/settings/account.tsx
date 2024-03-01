"use client";

import { FC } from "react";
import { User } from "lucia";
import { useRouter } from "next/navigation";
import { IconLogout, IconTrash } from "@tabler/icons-react";
import { useDisclosure, Button, Divider } from "@nextui-org/react";

import { trpc } from "@/trpc/client";

import { DeleteAccountModal } from "@/components/Modals/DeleteAccountModal";

export const AccountOptions: FC<{ user: User }> = ({ user }) => {
  const router = useRouter();

  const { isOpen, onOpenChange } = useDisclosure();

  const { isLoading, mutate } = trpc.auth.logoutOfAllDevice.useMutation({
    onSuccess: () => {
      router.replace("/sign-in");
    },
  });

  const handleLogout = () => {
    if (isLoading === false) {
      mutate();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8 pb-6">
        <div className="space-y-0.5">
          <p className="text-2xl font-bold">Account</p>
          <p className="text-sm text-default-500">
            Manage logout from all devices and delete your account
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold">Logout of all devices</h2>
            <p className="text-sm text-default-500">
              This will logout your account from all devices.
            </p>
          </div>
          <Button
            isLoading={isLoading}
            startContent={<IconLogout size={18} />}
            onClick={handleLogout}
          >
            Logout all devices
          </Button>
        </div>

        <Divider />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-danger">Delete my account</h2>
            <p className="text-sm text-default-500">
              This will permanently delete your account.
            </p>
          </div>
          <Button
            color="danger"
            startContent={<IconTrash size={18} />}
            onClick={onOpenChange}
          >
            Delete account
          </Button>
        </div>
      </div>

      <DeleteAccountModal
        user={user}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </>
  );
};
