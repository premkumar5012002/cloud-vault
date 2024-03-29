import { redirect } from "next/navigation";
import { IconMail } from "@tabler/icons-react";

import { getPageSession } from "@/lib/auth/lucia";

import { NavBar } from "../nav-bar";
import { ResendButton } from "./resend-button";
import { LogoutButton } from "./logout-button";

export default async function Page() {
  const session = await getPageSession();

  if (session === null) {
    return redirect("/sign-in");
  }

  if (session.user.isVerified) {
    return redirect("/drive");
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto relative flex pt-12 md:pt-20 flex-col items-center justify-center px-4 lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center text-center space-y-6 sm:w-[370px]">
          <div className="flex h-full flex-col items-center justify-center space-y-5">
            <div className="bg-primary-50 w-24 h-24 flex items-center justify-center rounded-full">
              <IconMail size={50} className="text-primary" />
            </div>

            <h3 className="font-semibold text-2xl md:text-3xl">
              Please verify your email
            </h3>

            <div className="space-y-1">
              <p className="text-sm md:text-base text-default-500">
                You&apos;re almost there! We sent an email to
              </p>
              <p className="text-sm md:text-base font-bold">
                {session.user.email}
              </p>
            </div>

            <p className="text-sm md:text-base text-center text-default-500">
              Just click on the verify button on the mail send to the email to
              complete your signup. if you don&apos;t see it, you may need to
              check your spam folder.
            </p>

            <div className="pt-4 flex flex-col gap-1.5">
              <ResendButton />
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
