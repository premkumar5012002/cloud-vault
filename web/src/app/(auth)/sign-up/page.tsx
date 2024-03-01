import { Link } from "@nextui-org/react";
import { redirect } from "next/navigation";

import { getPageSession } from "@/lib/auth/lucia";

import { NavBar } from "../nav-bar";
import { SignUpForm } from "./sign-up-form";

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
            <h2 className="text-2xl font-bold">Create an account</h2>
            <Link href="/sign-in">Already have an account? Sign in</Link>
          </div>
          <div className="pt-2">
            <SignUpForm />
          </div>
        </div>
      </div>
    </>
  );
}
