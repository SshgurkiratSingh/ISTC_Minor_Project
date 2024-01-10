"use client";
import { formatDistanceToNow } from "date-fns";
import React from "react";
interface ScheduleCardProps {
  UID?: string;
  From?: string;
  To?: string;
  Time?: string;
  Status?: string;
}
const ScheduleCard = ({
  UID = "55DA58AAF",
  From = "Anonymous",
  To = "Unknown",
  Time = String(new Date()),
  Status = "Not Yet Started",
}: ScheduleCardProps) => {
  return (
    <div className="card  text-gray-300 hover:brightness-90 transition-all cursor-pointer group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900 m-4 rounded-lg overflow-hidden relative xl:min-w-[500px] ">
      <div className="h-0.5 group-hover:w-full bg-gradient-to-l  via-red-950 group-hover:via-red-500 w-[70%] m-auto rounded transition-all"></div>{" "}
      <div className="h-2 w-full bg-gradient-to-l via-yellow-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute top-0"></div>
      <div className="px-8 py-10">
        <div className="uppercase font-bold text-xl">{UID}</div>
        <div className="text-gray-300 uppercase tracking-widest"></div>
        {formatDistanceToNow(new Date(Time), {
          addSuffix: true,
        })}

        <div className="text-gray-400 mt-8">
          <p className="font-bold">
            From {From} to {To}
          </p>
          <p>{Status} </p>
        </div>
      </div>
      <div className="h-2 w-full bg-gradient-to-l via-yellow-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute bottom-0"></div>
      <div className="h-0.5 group-hover:w-full bg-gradient-to-l  via-yellow-950 group-hover:via-yellow-500 w-[70%] m-auto rounded transition-all"></div>
    </div>
  );
};

export default ScheduleCard;
