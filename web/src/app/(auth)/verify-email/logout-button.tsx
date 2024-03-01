"use client";

import { toast } from "sonner";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";

import { trpc } from "@/trpc/client";

export const LogoutButton = () => {
  const router = useRouter();

  const { isLoading, mutate } = trpc.auth.logout.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: () => {
      router.replace("/sign-in");
    },
  });

  const handleClick = () => {
    if (isLoading === false) {
      mutate();
    }
  };

  return (
    <Button variant="light" isLoading={isLoading} onClick={handleClick}>
      Logout
    </Button>
  );
};
