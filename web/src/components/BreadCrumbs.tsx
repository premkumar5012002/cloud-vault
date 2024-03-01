"use client";

import { FC } from "react";
import Link from "next/link";
import { IconCloudFilled } from "@tabler/icons-react";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";

export const BreadCrumbs: FC<{
  breadCrumbs: { id: string; name: string }[];
}> = async ({ breadCrumbs }) => {
  return (
    <Breadcrumbs className="pt-6 px-8">
      <BreadcrumbItem>
        <Link
          href="/drive"
          className="flex items-center gap-1.5 text-lg font-medium"
        >
          <IconCloudFilled />
          Drive
        </Link>
      </BreadcrumbItem>
      {breadCrumbs.map(({ id, name }) => (
        <BreadcrumbItem key={id} size="lg">
          <Link href={`/drive/${id}`} className="text-lg font-medium">
            {name}
          </Link>
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
};
