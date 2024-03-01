"use client";

import {
  Input,
  Modal,
  Button,
  Navbar,
  Avatar,
  Divider,
  Dropdown,
  Progress,
  NavbarItem,
  NavbarMenu,
  NavbarBrand,
  DropdownMenu,
  ModalContent,
  DropdownItem,
  NavbarContent,
  useDisclosure,
  NavbarMenuItem,
  DropdownTrigger,
  NavbarMenuToggle,
} from "@nextui-org/react";
import { FC } from "react";
import {
  IconSun,
  IconMoon,
  IconStar,
  IconTrash,
  IconCloud,
  IconClock,
  IconSearch,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Storage } from "@/types";
import { trpc } from "@/trpc/client";
import { calculateUsage, formatSize } from "@/lib/utils";

import Logo from "./Logo";

const LINKS = [
  { name: "Drive", href: "/drive", Icon: IconCloud },
  { name: "Recent", href: "/recent", Icon: IconClock },
  { name: "Starred", href: "/starred", Icon: IconStar },
  { name: "Trash", href: "/trash", Icon: IconTrash },
];

export const NavBar: FC<{ storage?: Storage }> = ({ storage }) => {
  const router = useRouter();

  const { isOpen: isSearchModalOpen, onOpenChange: onSearchModalOpenChange } =
    useDisclosure();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const query = searchParams.get("q");

  const { theme, setTheme } = useTheme();

  const { mutate } = trpc.auth.logout.useMutation({
    onSuccess: () => {
      router.replace("/sign-in");
    },
  });

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const usedStorage = storage?.usedStorage ?? 0;
  const totalStorage = storage?.totalStorage ?? 1024 * 1024 * 1024;

  const isCurrentPath = (path: string) => pathname.includes(path);

  return (
    <>
      <Navbar isBordered maxWidth="full">
        <NavbarContent>
          <NavbarMenuToggle className="lg:hidden" />
          <NavbarBrand>
            <Logo />
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="flex gap-1.5 md:gap-3" justify="end">
          <NavbarItem suppressHydrationWarning>
            <Button isIconOnly variant="light" onClick={toggleTheme}>
              {theme === "light" ? (
                <IconMoon size={20} />
              ) : (
                <IconSun size={20} />
              )}
            </Button>
          </NavbarItem>

          <NavbarItem className="flex md:hidden">
            <Button
              isIconOnly
              variant="light"
              onClick={onSearchModalOpenChange}
            >
              <IconSearch size={20} />
            </Button>
          </NavbarItem>

          <NavbarItem className="hidden md:flex">
            <Input
              type="search"
              placeholder="Search files..."
              labelPlacement="outside-left"
              defaultValue={query ? query : ""}
              startContent={<IconSearch size={16} />}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const value = (e.target as HTMLInputElement).value;
                  router.push(`/search?q=${encodeURIComponent(value)}`);
                }
              }}
            />
          </NavbarItem>

          <NavbarItem className="pl-0.5 md:pl-0">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light">
                  <Avatar size="sm" isBordered />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="settings"
                  startContent={<IconSettings size={18} />}
                  href="/settings"
                >
                  Settings
                </DropdownItem>

                <DropdownItem
                  key="logout"
                  startContent={<IconLogout size={18} />}
                  onClick={() => mutate()}
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          {LINKS.map(({ name, href, Icon }) => (
            <NavbarMenuItem key={name}>
              <Button
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
            </NavbarMenuItem>
          ))}

          <Divider className="my-2" />

          <NavbarMenuItem className="space-y-2">
            <Progress
              showValueLabel
              label="Storage"
              value={calculateUsage(usedStorage, totalStorage)}
              classNames={{ label: "text-sm", value: "text-sm" }}
            />
            <p className="pl-1 text-sm text-default-500">
              {`${formatSize(usedStorage)} of ${formatSize(totalStorage)} Used`}
            </p>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>

      <Modal isOpen={isSearchModalOpen} onOpenChange={onSearchModalOpenChange}>
        <ModalContent>
          <Input
            autoFocus
            type="search"
            variant="faded"
            placeholder="Search..."
            defaultValue={query ?? ""}
            startContent={<IconSearch size={18} />}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearchModalOpenChange();
                const value = (e.target as HTMLInputElement).value;
                router.push(`/search?q=${encodeURIComponent(value)}`);
              }
            }}
          />
        </ModalContent>
      </Modal>
    </>
  );
};
