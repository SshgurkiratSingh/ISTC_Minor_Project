"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  Image,
  Progress,
  Divider,
} from "@nextui-org/react";
import ClientOnly from "../clientOnly";
interface HeadingCardProps {
  children?: React.ReactNode;
  tankLevel?: number;
  areaCleaned?: number;
  sunlightIntensity?: number;
}
const HeadingCard = ({
  tankLevel,
  areaCleaned,
  sunlightIntensity,
}: HeadingCardProps) => {
  return (
    <div>
      <ClientOnly>
        <Card
          isFooterBlurred
          className="w-full max-h-[15rem] col-span-12 sm:col-span-7 text-white dark"
        >
          <CardHeader
            className="absolute z-10 top-1 flex-col gap-2 p-4 dark"
            style={{ backdropFilter: "blur(15px)" }}
          >
            <p className="text-tiny text-white/60 uppercase font-bold">
              Minor Project
            </p>
            <Divider />
            <Progress
              label="Tank Level"
              size="sm"
              value={tankLevel}
              maxValue={100}
              color="warning"
              showValueLabel={true}
              className="max-w-md "
            />
            <Progress
              label="Area Cleaned By Cleaning Robot"
              size="sm"
              value={areaCleaned}
              maxValue={100}
              color="warning"
              showValueLabel={true}
              className="max-w-md "
            />
            <Progress
              label="Sunlight Intensity"
              size="sm"
              value={sunlightIntensity}
              maxValue={1024}
              color="warning"
              showValueLabel={true}
              className="max-w-md "
            />
          </CardHeader>
          <Image
            removeWrapper
            alt="minor project background"
            className="z-0 w-full h-full object-cover"
            src="/bg.webp"
          />
          {/* <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
            <div className="flex flex-grow gap-2 items-center">
              <Image
                alt="ICON"
                className="rounded-full w-10 h-11 bg-black"
                src="/ISTC.webp"
              />
              <div className="flex flex-col">
                <p className="text-tiny text-white/80 font-bold"></p>
                <p className="text-tiny text-white/60"></p>
              </div>
            </div>
          </CardFooter> */}
        </Card>
      </ClientOnly>
    </div>
  );
};

export default HeadingCard;
