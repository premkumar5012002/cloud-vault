import { Button, Link } from "@nextui-org/react";
import { IconMailCheck } from "@tabler/icons-react";

import { api } from "@/trpc/serverClient";

import { NavBar } from "../../nav-bar";

interface Params {
  params: {
    token: string;
  };
}

export default async function Page({ params }: Params) {
  const token = params.token;
  try {
    await api.auth.verifyEmail.mutate({ token });
    return (
      <>
        <NavBar />
        <div className="container mx-auto relative flex pt-12 md:pt-20 flex-col items-center justify-center px-4 lg:px-0">
          <div className="mx-auto flex w-full flex-col justify-center text-center space-y-6 sm:w-[370px]">
            <div className="flex h-full flex-col items-center justify-center space-y-6">
              <div className="bg-success-50 w-24 h-24 flex items-center justify-center rounded-full">
                <IconMailCheck size={50} className="text-success" />
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-2xl md:text-3xl">
                  Email Verified
                </h3>

                <p className="text-sm md:text-base text-default-500">
                  Thank you for verifying your email.
                </p>
              </div>

              <Button as={Link} color="primary" href={"/drive"}>
                Go to drive
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  } catch (e) {
    throw new Error("Unknown error occured");
  }
}
