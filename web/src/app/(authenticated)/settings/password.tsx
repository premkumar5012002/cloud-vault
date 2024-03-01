"use client";

import { z } from "zod";
import { FC, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Button, Input } from "@nextui-org/react";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/trpc/client";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

export const PasswordForm: FC = () => {
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);

  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] =
    useState(false);

  const { isLoading, mutate } = trpc.user.changePassword.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: () => {
      reset();
    },
  });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }>({
    resolver: zodResolver(
      z
        .object({
          currentPassword: z
            .string()
            .min(8, { message: "Password must be mininum 8 characters" })
            .max(256, { message: "Password should not exceed 256 characters" }),
          newPassword: z
            .string()
            .min(8, { message: "Password must be mininum 8 characters" })
            .max(256, { message: "Password should not exceed 256 characters" }),
          confirmNewPassword: z.string(),
        })
        .refine(
          (values) => {
            return values.newPassword === values.confirmNewPassword;
          },
          {
            message: "New passwords must match!",
            path: ["confirmPassword"],
          }
        )
    ),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const toggleIsCurrentPasswordVisible = () => {
    setIsCurrentPasswordVisible((state) => !state);
  };

  const toggleIsNewPasswordVisible = () => {
    setIsNewPasswordVisible((state) => !state);
  };

  const toggleIsConfirmNewPasswordVisible = () => {
    setIsConfirmNewPasswordVisible((state) => !state);
  };

  const onSubmit = handleSubmit((data) => {
    if (isLoading === false) {
      mutate(data);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <div className="space-y-0.5">
        <p className="text-2xl font-bold">Password</p>
        <p className="text-sm text-default-500">
          Enter your current password to change your password
        </p>
      </div>

      <Input
        label="Current password"
        labelPlacement="outside"
        {...register("currentPassword")}
        placeholder="Enter your current password"
        type={isCurrentPasswordVisible ? "text" : "password"}
        color={errors.currentPassword ? "danger" : "default"}
        errorMessage={errors.currentPassword && errors.currentPassword.message}
        endContent={
          <button type="button" onClick={toggleIsCurrentPasswordVisible}>
            {isCurrentPasswordVisible ? <IconEyeOff /> : <IconEye />}
          </button>
        }
      />

      <Input
        label="New password"
        labelPlacement="outside"
        {...register("newPassword")}
        placeholder="Enter your new password should be 8 characters minimum"
        type={isNewPasswordVisible ? "text" : "password"}
        color={errors.newPassword ? "danger" : "default"}
        errorMessage={errors.newPassword && errors.newPassword.message}
        endContent={
          <button type="button" onClick={toggleIsNewPasswordVisible}>
            {isNewPasswordVisible ? <IconEyeOff /> : <IconEye />}
          </button>
        }
      />

      <Input
        label="Confirm new password"
        labelPlacement="outside"
        {...register("confirmNewPassword")}
        placeholder="Enter your new password again"
        type={isConfirmNewPasswordVisible ? "text" : "password"}
        color={errors.newPassword ? "danger" : "default"}
        errorMessage={
          errors.confirmNewPassword && errors.confirmNewPassword.message
        }
        endContent={
          <button type="button" onClick={toggleIsConfirmNewPasswordVisible}>
            {isNewPasswordVisible ? <IconEyeOff /> : <IconEye />}
          </button>
        }
      />

      {isDirty && (
        <div className="flex items-center justify-end gap-4">
          <Button variant="bordered" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="submit" isDisabled={!isValid} color="primary">
            Change password
          </Button>
        </div>
      )}
    </form>
  );
};
