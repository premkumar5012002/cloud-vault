import { Link } from "@nextui-org/react";
import { redirect } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

import { getPageSession } from "@/lib/auth/lucia";

import { NavBar } from "../nav-bar";
import { ForgetPasswordForm } from "./forget-password-form";

export default async function Page() {
  const session = await getPageSession();

  if (session) {
    return redirect("/drive");
  }

  return (
    <>
      <NavBar />
      <div className="relative flex pt-20 items-center justify-center mx-auto px-6 lg:px-0">
        <div className="flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h2 className="text-2xl font-bold">Forgot your password</h2>
            <Link href="/sign-up">
              <IconArrowLeft size={18} className="mr-1" /> Back to sign in
            </Link>
          </div>
          <div className="pt-2">
            <ForgetPasswordForm />
          </div>
        </div>
      </div>
    </>
  );
}
