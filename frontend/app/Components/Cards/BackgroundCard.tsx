"use client";
import { NextUIProvider } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
interface ClientOnlyProps {
  headChildren?: React.ReactNode;
  bodyChildren?: React.ReactNode;
  footerChildren?: React.ReactNode;
  darkMode?: boolean;
  className?: string;
}
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from "@nextui-org/react";
const BackGroundCard = ({
  headChildren,
  bodyChildren,
  footerChildren,
  darkMode = false,
  className = "",
}: ClientOnlyProps) => {
  return (
    <Card
      className={
        `min-w-[200px] max-w-[100%] min-h-[400px] ${darkMode ? "dark" : ""} ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        }` +
        " " +
        className
      }
    >
      <CardHeader className="flex gap-3">{headChildren}</CardHeader>
      <Divider />
      <CardBody>{bodyChildren}</CardBody>
      <Divider />
      <CardFooter className="gap-2 flex flex-col xl:flex-row justify-between items-center  content-center">
        {footerChildren}
      </CardFooter>
    </Card>
  );
};

export default BackGroundCard;
