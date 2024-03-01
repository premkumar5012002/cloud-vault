"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button, Input } from "@nextui-org/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import { trpc } from "@/trpc/client";
import { ResetPassword, ResetPasswordSchema } from "@/lib/validators/auth";

export const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const { isLoading, mutate } = trpc.auth.resetPassword.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: () => {
      toast.success("Password reset successfully");
      router.push("/sign-in");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPassword>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = handleSubmit((data) => {
    if (isLoading === false) {
      mutate({ ...data, token });
    }
  });

  const togglePasswordVisibility = () =>
    setIsPasswordVisible((state) => !state);

  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible((state) => !state);

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div className="flex flex-col gap-5">
        <Input
          label="New password"
          placeholder="Choose new password"
          labelPlacement="outside"
          {...register("password")}
          type={isPasswordVisible ? "text" : "password"}
          color={errors.password ? "danger" : "default"}
          errorMessage={errors.password && errors.password.message}
          endContent={
            <button type="button" onClick={togglePasswordVisibility}>
              {isPasswordVisible ? <IconEyeOff /> : <IconEye />}
            </button>
          }
        />
        <Input
          label="Confirm password"
          placeholder="Confirm new password"
          labelPlacement="outside"
          {...register("confirmPassword")}
          type={isConfirmPasswordVisible ? "text" : "password"}
          color={errors.confirmPassword ? "danger" : "default"}
          errorMessage={
            errors.confirmPassword && errors.confirmPassword.message
          }
          endContent={
            <button type="button" onClick={toggleConfirmPasswordVisibility}>
              {isConfirmPasswordVisible ? <IconEyeOff /> : <IconEye />}
            </button>
          }
        />
      </div>

      <Button fullWidth type="submit" color="primary" isLoading={isLoading}>
        Reset password
      </Button>
    </form>
  );
};
