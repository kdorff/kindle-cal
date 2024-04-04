import { z } from "zod";

export interface BatteryType {
  battery: number | null;
}

export function parseBattery(params: any): number | null {
  console.log("Parsing battery from", params);
  const schema = z.object({
    battery: z.coerce.number().min(0).max(100).nullable(),
  });

  try {
    const data = schema.parse({
      battery:
        typeof params.get === "function"
          ? params.get("battery")
          : params.battery,
    });
    console.log("Battery is", data.battery);
    return data.battery;
  } catch (e) {
    console.log("Parsing failed", e);
    return null;
  }
}
