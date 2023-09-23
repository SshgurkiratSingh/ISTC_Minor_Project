"use client";
import React from "react";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  Link,
  Button,
  Code,
} from "@nextui-org/react";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = ["Home Page", "panel 2", "Settings", "About"];

  return (
    <Navbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      shouldHideOnScroll
      className="bg-black"
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <p className="font-bold text-inherit">Minor Project</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex gap-4 text-zinc-200"
        justify="center"
      >
        <NavbarBrand>
          <p className="font-bold text-inherit text-2xl">
            {" "}
            <Code color="danger" className="text-lg">
              {" "}
              Minor Project-IoT Enabled Home
            </Code>{" "}
          </p>
        </NavbarBrand>

        {/* <NavbarItem>
          <Link href="#" aria-current="page">
            Settings
          </Link>
        </NavbarItem> */}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button as={Link} color="warning" href="/" variant="bordered">
            Home
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Link href="#">About</Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link className="w-full" href="#" size="lg">
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};
export default NavBar;
