import { Divider } from "@nextui-org/react";
import { redirect } from "next/navigation";

import { getPageSession } from "@/lib/auth/lucia";

import { ProfileForm } from "./profile";
import { PasswordForm } from "./password";
import { AccountOptions } from "./account";

export default async function Page() {
  const session = await getPageSession();

  if (session === null) {
    return redirect("/sign-in");
  }

  return (
    <div className="max-w-lg m-8 md:m-12 lg:m-16 space-y-10">
      <h2 className="text-4xl font-bold">Settings</h2>
      <ProfileForm user={session.user} />
      <Divider />
      <PasswordForm />
      <Divider />
      <AccountOptions user={session.user} />
    </div>
  );
}
