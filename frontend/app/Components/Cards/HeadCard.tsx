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
import PowerConsumptionCard from "./PowerUsage";
interface HeadingCardProps {
  children?: React.ReactNode;
  tankLevel?: number;
  areaCleaned?: number;
  sunlightIntensity?: number;
  powerConsumption?: number;
}
const HeadingCard = ({
  tankLevel,
  areaCleaned,
  sunlightIntensity,
  powerConsumption,
}: HeadingCardProps) => {
  return (
    <div>
      <ClientOnly>
        <Card
          isFooterBlurred
          className="w-full max-h-[14rem] col-span-12 sm:col-span-7 text-white dark"
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
            <Divider />
            <PowerConsumptionCard
              powerConsumption={Number(powerConsumption?.toFixed(4)) || 0}
            />
          </CardHeader>
          <Image
            removeWrapper
            alt="minor project background"
            className="z-0 w-full h-full object-cover"
            src="/back2.webp"
          />
        </Card>
      </ClientOnly>
    </div>
  );
};

export default HeadingCard;
