import { z } from "zod";

function parseBattery(params: any): number | null {
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

/**
 * Send the battery level to Home Assistant.
 * @param battery battery level to send
 */
async function sendBatteryLevelToHA(battery: number) {
  const HA_URL = process.env.HA_URL || null;
  const HA_TOKEN = process.env.HA_TOKEN || null;
  if (!HA_URL || !HA_TOKEN) {
    console.error(
      "HA_URL or HA_TOKEN not defined (check environment variables)"
    );
    return;
  }

  console.log("Sending battery level to HA");
  const response = await fetch(HA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HA_TOKEN}`,
    },
    body: JSON.stringify({ state: battery }),
  });

  if (response.ok) {
    if (battery) console.log("Battery level sent to HA");
  } else {
    console.error(`HTTP error! status: ${response.status}`);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const battery = parseBattery(searchParams);
  console.log("battery is", battery);
  if (battery != null) {
    // No need to await this
    await sendBatteryLevelToHA(battery);
    return new Response(`HA updated to ${battery}`);
  } else {
    return new Response(
      `HA not updated, no valid battery value '${searchParams.get("battery")}'`
    );
  }
}
