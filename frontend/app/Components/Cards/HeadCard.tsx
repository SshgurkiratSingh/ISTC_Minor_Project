"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardFooter, Image } from "@nextui-org/react";
import ClientOnly from "../clientOnly";

const HeadingCard = () => {
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "medium",
    })
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(
        new Date().toLocaleString("en-US", {
          dateStyle: "full",
          timeStyle: "medium",
        })
      );
    }, 1000); // Update every 30 seconds

    return () => clearInterval(intervalId); // Clean up the interval on unmount
  }, []);

  return (
    <div>
      <ClientOnly>
        <Card
          isFooterBlurred
          className="w-full h-[300px] col-span-12 sm:col-span-7"
        >
          <CardHeader className="absolute z-10 top-1 flex-col items-start">
            <p className="text-tiny text-white/60 uppercase font-bold">
              Minor Project
            </p>
            <h4 className="text-white/90 font-medium text-xl">Istc</h4>
          </CardHeader>
          <Image
            removeWrapper
            alt="minor project background"
            className="z-0 w-full h-full object-cover"
            src="/bg.webp"
          />
          <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
            <div className="flex flex-grow gap-2 items-center">
              <Image
                alt="ICON"
                className="rounded-full w-10 h-11 bg-black"
                src="/ISTC.webp"
              />
              <div className="flex flex-col">
                <p className="text-tiny text-white/80 font-bold">
                  {currentDate}
                </p>
                <p className="text-tiny text-white/60"></p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </ClientOnly>
    </div>
  );
};

export default HeadingCard;
