"use client";
import React from "react";
const ScheduleCard = ({}) => {
  return (
    <div className="card  text-gray-300 hover:brightness-90 transition-all cursor-pointer group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900 m-4 rounded-lg overflow-hidden relative xl:min-w-[500px] ">
      <div className="h-0.5 group-hover:w-full bg-gradient-to-l  via-red-950 group-hover:via-red-500 w-[70%] m-auto rounded transition-all"></div>{" "}
      <div className="h-2 w-full bg-gradient-to-l via-yellow-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute top-0"></div>
      <div className="px-8 py-10">
        <div className="uppercase font-bold text-xl">UA8A42</div>
        <div className="text-gray-300 uppercase tracking-widest">
          5 Minutes Ago
        </div>

        <div className="text-gray-400 mt-8">
          <p className="font-bold">From AManda to John</p>
          <p>Awaiting Location Response </p>
        </div>
      </div>
      <div className="h-2 w-full bg-gradient-to-l via-yellow-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute bottom-0"></div>
      <div className="h-0.5 group-hover:w-full bg-gradient-to-l  via-yellow-950 group-hover:via-yellow-500 w-[70%] m-auto rounded transition-all"></div>
    </div>
  );
};

export default ScheduleCard;
