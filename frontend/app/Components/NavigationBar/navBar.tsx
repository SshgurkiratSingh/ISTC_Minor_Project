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
  const mainMenuItems = [
    { heading: "Home", to: "/" },
    { heading: "Security System", to: "/securitySystem" },
    { heading: "Sensor History", to: "/historyPage" },
    { heading: "About", to: "/about" },
    { heading: "Low End Version ", to: "/lowEnd" },
    { heading: "Smart City Parking ", to: "/smartParking" },
    { heading: "Analysis", to: "/analysis" },
  ];

  return (
    <Navbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      shouldHideOnScroll
      className="dark "
      position="static"
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
          <p className="titBlock text-4xl">Minor Project </p>
        </NavbarBrand>

        {/* <NavbarItem>
          <Link href="#" aria-current="page">
            Settings
          </Link>
        </NavbarItem> */}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          {" "}
          <Link href="/">
            <Button
              as={Link}
              variant="bordered"
              className="font-bold hover:border-white transition"
            >
              Home
            </Button>
          </Link>
        </NavbarItem>
        <NavbarItem className="hidden xl:block ">
          <Link href="/securitySystem">
            <Button
              as={Link}
              variant="bordered"
              className="font-bold hover:border-white transition"
            >
              Security Systems
            </Button>
          </Link>
        </NavbarItem>
        <NavbarItem className="hidden xl:block">
          <Link href="/historyPage">
            <Button
              as={Link}
              variant="bordered"
              className="font-bold hover:border-white transition"
            >
              Sensor History
            </Button>
          </Link>
        </NavbarItem>{" "}
        {/* <NavbarItem className="hidden xl:block">
          <Link href="/smartParking">
            <Button
              as={Link}
              variant="bordered"
              className="font-bold hover:border-white transition"
            >
              Smart Parking
            </Button>
          </Link>
        </NavbarItem> */}
        <NavbarItem className="hidden xl:block">
          <Link href="/analysis">
            <Button
              as={Link}
              variant="bordered"
              className="font-bold hover:border-white transition"
            >
              Analysis
            </Button>
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="dark">
        {mainMenuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link className="w-full" href={item.to} size="lg">
              {item.heading}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};
export default NavBar;
