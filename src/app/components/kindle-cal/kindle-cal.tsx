"use client";

import React, { use, useEffect } from "react";

interface KindleCalProps {
  battery: string | null;
}

const KindleCal = (props: Partial<KindleCalProps>) => {
  console.log("KindleCalProps", props);
  const TZ = process.env.TZ || "US/Central";
  const now = new Date();
  console.log(`TZ=${TZ}, now=${now}`);
  const formattedDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: TZ,
  });
  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  });

  useEffect(() => {
    const sendBatteryLevel = async () => {
      if (props.battery != null) {
        console.log(`Sending battery ${props.battery} level to HA`);
        const response = await fetch(`/battery?battery=${props.battery}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Response from /battery", data);
      } else {
        console.log("No battery level to send to HA");
      }
    };
    sendBatteryLevel().catch((error) => console.error(error));
  }, []);

  return (
    <div className="w-[800px] h-[600px] p-4 mx-auto rounded-lg border-4 border-black flex-col items-center justify-center">
      <div className="text-4xl font-black w-full h-[150px] pt-[50px]">
        Today is...
      </div>
      <div className="font-black w-full mx-auto h-[45 0px] flex-row">
        <div className="text-[6rem]">{formattedDate}</div>
        <div className="text-[5rem] pt-4">
          <span className="italic">after</span>{" "}
          <span className="pl-2">{currentTime}</span>
        </div>
      </div>
      <div className="text-[2xl] font-bold pt-[5rem]">
        {/* <BatteryLevel /> */}
        {props.battery != null ? `Battery Level ${props.battery}%` : null}
      </div>
    </div>
  );
};
export default KindleCal;
