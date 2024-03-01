import { Navbar as NextUINavbar, NavbarBrand } from "@nextui-org/react";

import Logo from "@/components/Logo";

export const NavBar = () => {
  return (
    <NextUINavbar maxWidth="full">
      <NavbarBrand>
        <Logo />
      </NavbarBrand>
    </NextUINavbar>
  );
};
