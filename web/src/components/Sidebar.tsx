"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Progress } from "@nextui-org/react";
import { IconClock, IconCloud, IconStar, IconTrash } from "@tabler/icons-react";

import { Storage } from "@/types";
import { calculateUsage, formatSize } from "@/lib/utils";

const LINKS = [
  { name: "Drive", href: "/drive", Icon: IconCloud },
  { name: "Recent", href: "/recent", Icon: IconClock },
  { name: "Starred", href: "/starred", Icon: IconStar },
  { name: "Trash", href: "/trash", Icon: IconTrash },
];

export const SideBar: FC<{ storage?: Storage }> = ({ storage }) => {
  const pathName = usePathname();

  const usedStorage = storage?.usedStorage ?? 0;
  const totalStorage = storage?.totalStorage ?? 1024 * 1024 * 1024;

  const isCurrentPath = (href: string) => pathName.includes(href);

  return (
    <aside className="hidden fixed top-16 bottom-0 w-72 lg:flex flex-col justify-between border-r border-divider bg-background">
      <ul className="space-y-2 p-4">
        {LINKS.map(({ name, href, Icon }) => (
          <Button
            key={name}
            as={Link}
            fullWidth
            href={href}
            variant={isCurrentPath(href) ? "solid" : "light"}
            color={isCurrentPath(href) ? "primary" : "default"}
            startContent={<Icon size={18} />}
            className="justify-start"
          >
            {name}
          </Button>
        ))}
      </ul>
      <ul className="border-t border-divider space-y-2 px-4 py-6">
        <Progress
          showValueLabel
          label="Storage"
          value={calculateUsage(usedStorage, totalStorage)}
          classNames={{ label: "text-sm", value: "text-sm" }}
        />
        <p className="pl-1 text-sm text-default-500">
          {`${formatSize(usedStorage)} of ${formatSize(totalStorage)} Used`}
        </p>
      </ul>
    </aside>
  );
};
