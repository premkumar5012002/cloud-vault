"use client";

import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@nextui-org/react";

export const ResendButton = () => {
  const { isLoading, mutate } = trpc.auth.resendVerificationEmail.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const handleClick = () => {
    if (isLoading === false) {
      mutate();
    }
  };

  return (
    <Button color="primary" isLoading={isLoading} onClick={handleClick}>
      Resend email
    </Button>
  );
};
