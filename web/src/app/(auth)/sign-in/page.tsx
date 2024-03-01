import { Link } from "@nextui-org/react";
import { redirect } from "next/navigation";

import { getPageSession } from "@/lib/auth/lucia";

import { SignInForm } from "./sign-in-form";
import { NavBar } from "../nav-bar";

export default async function Page() {
  const session = await getPageSession();

  if (session) {
    let path = "/drive";

    if (session.user.isVerified === false) {
      path = "/verify-email";
    }

    return redirect(path);
  }

  return (
    <>
      <NavBar />
      <div className="relative flex pt-20 items-center justify-center mx-auto px-6 lg:px-0">
        <div className="flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h2 className="text-2xl font-bold">Sign in to your account</h2>
            <Link href="/sign-up">Don&apos;t have an account?</Link>
          </div>
          <div className="pt-2">
            <SignInForm />
          </div>
        </div>
      </div>
    </>
  );
}
