"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button, Input } from "@nextui-org/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import { trpc } from "@/trpc/client";

import { SignUp, SignUpSchema } from "@/lib/validators/auth";

export const SignUpForm = () => {
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);

  const { isLoading, mutate } = trpc.auth.signUp.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: () => {
      router.replace("/verify-email");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUp>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data);
  });

  const toggleVisibility = () => setIsVisible((state) => !state);

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <div className="flex gap-4">
        <Input
          label="First name"
          placeholder="First name"
          labelPlacement="outside"
          {...register("firstName")}
          color={errors.firstName ? "danger" : "default"}
          errorMessage={errors.firstName && errors.firstName.message}
        />
        <Input
          id="lastName"
          label="Last name"
          placeholder="Last name"
          labelPlacement="outside"
          {...register("lastName")}
          color={errors.lastName ? "danger" : "default"}
          errorMessage={errors.lastName && errors.lastName.message}
        />
      </div>

      <Input
        type="email"
        label="Email"
        placeholder="Email"
        {...register("email")}
        labelPlacement="outside"
        color={errors.email ? "danger" : "default"}
        errorMessage={errors.email && errors.email.message}
      />

      <Input
        label="Password"
        placeholder="Password"
        labelPlacement="outside"
        {...register("password")}
        type={isVisible ? "text" : "password"}
        color={errors.password ? "danger" : "default"}
        errorMessage={errors.password && errors.password.message}
        endContent={
          <button type="button" onClick={toggleVisibility}>
            {isVisible ? <IconEyeOff /> : <IconEye />}
          </button>
        }
      />

      <div className="pt-4">
        <Button fullWidth type="submit" color="primary" isLoading={isLoading}>
          Sign up
        </Button>
      </div>
    </form>
  );
};
