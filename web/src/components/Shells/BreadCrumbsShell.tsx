import { FC } from "react";
import { Skeleton } from "@nextui-org/react";
import { IconChevronRight } from "@tabler/icons-react";

export const BreadCrumbsShell: FC = () => {
  return (
    <div className="flex gap-1.5 pt-6 px-8 text-default-400">
      {new Array(4).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Skeleton className="rounded-lg w-[78px] h-[28px]" />
          {i < 3 && <IconChevronRight size={16} />}
        </div>
      ))}
    </div>
  );
};
