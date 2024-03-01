"use client";

import { z } from "zod";
import { FC } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Input, Button } from "@nextui-org/react";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/trpc/client";
import { User } from "lucia";

export const ProfileForm: FC<{ user: User }> = ({ user }) => {
  const { isLoading, mutate } = trpc.user.changeName.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: () => {
      resetField("firstName", { defaultValue: getValues("firstName") });
      resetField("lastName", { defaultValue: getValues("lastName") });
    },
  });

  const {
    reset,
    register,
    getValues,
    resetField,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<{ firstName: string; lastName: string }>({
    resolver: zodResolver(
      z.object({
        firstName: z.string().min(1, "First name can't be empty").max(128, {
          message: "First name cannot be more than 128 characters",
        }),
        lastName: z.string().min(1, "Last name can't be empty").max(128, {
          message: "Last name cannot be more than 128 characters",
        }),
      })
    ),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (isLoading === false) {
      mutate(data);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <div className="space-y-0.5">
        <p className="text-2xl font-bold">Profile</p>
        <p className="text-sm text-default-500">
          Update your photo and personal details
        </p>
      </div>

      <div className="flex items-center gap-5">
        <Input
          {...register("firstName")}
          label="First name"
          labelPlacement="outside"
          defaultValue={user.firstName}
          placeholder="Enter your first name"
          color={errors.firstName ? "danger" : "default"}
          errorMessage={errors.firstName && errors.firstName.message}
        />

        <Input
          {...register("lastName")}
          label="Last name"
          labelPlacement="outside"
          defaultValue={user.lastName}
          placeholder="Enter your first name"
          color={errors.lastName ? "danger" : "default"}
          errorMessage={errors.lastName && errors.lastName.message}
        />
      </div>

      <Input
        isDisabled
        label="Email"
        defaultValue={user.email}
        labelPlacement="outside"
        placeholder="Enter your email address"
      />

      {isDirty && (
        <div className="flex items-center justify-end gap-4">
          <Button variant="bordered" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="submit" isDisabled={isValid === false} color="primary">
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );
};
