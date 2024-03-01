import { FC } from "react";
import Link from "next/link";
import { Session } from "lucia";
import { Navbar as NextUINavbar, Button, NavbarBrand, NavbarContent } from "@nextui-org/react";

import Logo from "@/components/Logo";

export const NavBar: FC<{ session: Session | null }> = ({ session }) => {
	return (
		<NextUINavbar maxWidth="full">
			<NavbarBrand>
				<Logo />
			</NavbarBrand>
			<NavbarContent justify="end">
				{!session && (
					<Button as={Link} variant="light" href="/sign-in">
						Sign in
					</Button>
				)}
				<Button as={Link} color="primary" href={session ? "/drive" : "/sign-up"}>
					{session ? "Get Started" : "Join now"}
				</Button>
			</NavbarContent>
		</NextUINavbar>
	);
};
