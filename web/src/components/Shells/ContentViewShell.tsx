import { Skeleton } from "@nextui-org/react";
import { FC } from "react";

export const ContentViewShell: FC = () => {
  return (
    <div className="pt-4 grid gap-8 grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1700px]:grid-cols-6 min-[1900px]:grid-cols-8 overflow-y-auto px-6 w-full">
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center border border-divider rounded-xl py-8"
        >
          <Skeleton className="rounded-lg h-20 w-[100px]" />
          <Skeleton className="h-3 w-16 mt-5 rounded-lg" />
          <Skeleton className="h-2.5 w-24 mt-3.5 rounded-lg" />
        </div>
      ))}
    </div>
  );
};
