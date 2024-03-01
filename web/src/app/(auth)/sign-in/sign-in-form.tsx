"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Link } from "@nextui-org/react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";

import { trpc } from "@/trpc/client";
import { SignIn, SignInSchema } from "@/lib/validators/auth";

export const SignInForm = () => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [isVisible, setIsVisible] = useState(false);

  const redirect = searchParams.get("r");

  const { isLoading, mutate } = trpc.auth.signIn.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: (data) => {
      if (data.result === "SUCCESS") {
        router.replace(redirect ? decodeURIComponent(redirect) : "/drive");
      } else {
        router.replace("/verify-email");
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignIn>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = handleSubmit((data) => {
    if (isLoading === false) {
      mutate(data);
    }
  });

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
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
        {...register("password")}
        labelPlacement="outside"
        type={isVisible ? "text" : "password"}
        color={errors.password ? "danger" : "default"}
        errorMessage={errors.password && errors.password.message}
        endContent={
          <button type="button" onClick={toggleVisibility}>
            {isVisible ? <IconEyeOff /> : <IconEye />}
          </button>
        }
      />

      <div className="flex items-center justify-end">
        <Link href="/forget-password">Forget password?</Link>
      </div>

      <div className="pt-4">
        <Button fullWidth type="submit" color="primary" isLoading={isLoading}>
          Sign in
        </Button>
      </div>
    </form>
  );
};
