"use client";

import { FC } from "react";
import { IconSearchOff } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { Code } from "@nextui-org/react";

export const NoSearchResultView: FC = () => {
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6 py-24 px-6 max-w-sm mx-auto">
      <div className="flex items-center justify-center bg-primary-50 w-36 h-36 rounded-full">
        <IconSearchOff size={90} className="text-primary" />
      </div>
      <div className="space-y-3 text-center">
        <h2 className="text-xl lg:text-2xl font-medium">No result found</h2>
        <p className="text-sm lg:text-base text-default-500">
          No folders or files found in name of the{" "}
          <Code>{searchParams.get("q")}</Code>.
        </p>
      </div>
    </div>
  );
};
