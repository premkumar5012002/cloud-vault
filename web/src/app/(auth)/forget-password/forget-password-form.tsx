"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Button, Input } from "@nextui-org/react";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/trpc/client";

import { ForgetPassword, ForgetPasswordSchema } from "@/lib/validators/auth";

export const ForgetPasswordForm = () => {
  const { isLoading, mutate } = trpc.auth.forgetPassword.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: () => {
      reset();
      toast.success(
        "An mail has been sent to your email address to the reset password"
      );
    },
  });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPassword>({
    resolver: zodResolver(ForgetPasswordSchema),
  });

  const onSubmit = handleSubmit((data) => {
    if (isLoading === false) {
      mutate(data);
    }
  });

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        <p className="text-center text-default-500 tracking-wide">
          We will send you a link where you can change your password.
        </p>
        <Input
          type="email"
          label="Email"
          placeholder="Email"
          {...register("email")}
          labelPlacement="outside"
          color={errors.email ? "danger" : "default"}
          errorMessage={errors.email && errors.email.message}
        />
      </div>
      <div className="pt-4">
        <Button fullWidth type="submit" color="primary" isLoading={isLoading}>
          Submit
        </Button>
      </div>
    </form>
  );
};
