"use client";

import { Code } from "@nextui-org/react";
import { useParams } from "next/navigation";
import { IconFolderOpen } from "@tabler/icons-react";

export const EmptyDriveView = () => {
  const params = useParams();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6 py-24 px-6 max-w-sm mx-auto">
      <div className="flex items-center justify-center bg-primary-50 w-36 h-36 rounded-full">
        <IconFolderOpen size={90} className="text-primary" />
      </div>
      <div className="space-y-2.5 text-center">
        <h2 className="text-xl lg:text-2xl font-medium">
          {params.slug ? "This folder is empty" : "No files uploaded yet"}
        </h2>
        <p className="text-sm lg:text-base text-default-500">
          Upload your files or folder by dragging them here or use the{" "}
          <Code>upload</Code> button at top.
        </p>
      </div>
    </div>
  );
};
