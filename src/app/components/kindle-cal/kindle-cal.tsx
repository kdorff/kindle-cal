import React from "react";
import { BatteryType } from "../../png/battery-params";

const KindleCal = (props: Partial<BatteryType>) => {
  console.log("KindleCal props", props);
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

  const BatteryLevel = async () => {
    "use server";

    const HA_URL = process.env.HA_URL || null;
    const HA_TOKEN = process.env.HA_TOKEN || null;

    async function fetchBatteryLevel(): Promise<number | null> {
      if (!HA_URL || !HA_TOKEN) {
        // No HA. Just always return 100.
        console.error(
          "HA_URL or HA_TOKEN not defined. Not reading battery state from HA."
        );
        return null;
      }
      const response = await fetch(HA_URL, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HA_TOKEN}`,
        },
      });
      if (!response.ok) {
        console.error("Could not read battery level from HA");
        return null;
      }
      const json = await response.json();
      return parseInt(json.state);
    }

    const batteryLevel = await fetchBatteryLevel();
    return <>{batteryLevel != null && <>Battery Level {batteryLevel}%</>}</>;
  };

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
