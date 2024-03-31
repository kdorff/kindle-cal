year: "numeric" as const, "use client";

import React from "react";

const KindleCal = () => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "America/Chicago",
  });
  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago",
  });

  return (
    <div className="w-[800px] h-[600px] p-4 mx-auto rounded-lg border-4 border-black flex-col items-center justify-center">
      <div className="text-4xl font-black w-full h-[150px] pt-[50px]">
        Today is...
      </div>
      <div className="font-black w-full mx-auto h-[45 0px] flex-row">
        <div className="text-[6rem]">{formattedDate}</div>
        <div className="text-[5rem] pt-4s">
          <span className="italic">after</span>{" "}
          <span className="pl-2">{currentTime}</span>
        </div>
      </div>
    </div>
  );
};
export default KindleCal;
