import { chromium } from "playwright";
import sharp from "sharp";
// @ts-ignore
import { PNG } from "pngjs/browser";

/**
 * Take a screenshot of a web page.
 * Return as a png image in a Buffer
 * @param url URL to screenshot
 * @returns Buffer for png image
 */
async function grabScreenshot(url: string): Promise<Buffer> {
  let browser = undefined;
  let page = undefined;
  const imageBuffer = undefined;
  try {
    console.log("Launching chromium");
    browser = await chromium.launch();
    console.log("Opening page");
    page = await browser.newPage();
    console.log("Setting viewport size");
    await page.setViewportSize({ width: 800, height: 600 });
    console.log("Requesting URL");
    await page.goto(url);
    console.log("Taking screenshot");
    return await page.screenshot();
  } finally {
    // Close the browser
    browser && browser.close();
  }
}

/**
 * Rotate the png image in imageBuffer 90 degreesleft.
 * @param imageBuffer png image as Biffer to rotate
 * @returns Buffer for transformed png image
 */
async function rotateImage(imageBuffer: Buffer): Promise<Buffer | undefined> {
  let rotatedImage = undefined;
  console.log("Rotating image");
  // Greyscaling doesn't seem to work correct with sharp to
  // get an impage that is compat with Kindle. It generally
  // renders as RGB without repect to color space, etc.
  // Maybe if there check for grey4? grey16? Unsure.
  // I severalal thing things including...
  //   .grayscale(true)
  //   .toColorspace("b-w")
  //   .png({ colors: 2 })
  await sharp(imageBuffer)
    .rotate(-90)
    .toBuffer()
    .then((info) => {
      console.log("Rotate image completed");
      rotatedImage = info;
    })
    .catch((err) => {
      console.log("Rotate image FAILED", err);
    });
  return rotatedImage;
}

/**
 * Convert the png image Buffer in imageBuffer to grayscale.
 * @param imageBuffer image as Buffer to grayscale
 * @returns image Buffer in grayscale
 */
function greyscaleImage(imageBuffer: Buffer | undefined): Buffer | undefined {
  if (!imageBuffer) {
    return undefined;
  }
  const png = PNG.sync.read(imageBuffer);
  return PNG.sync.write(png, {
    width: 600,
    height: 800,
    colorType: 0,
  });
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
    console.log("Battery level sent to HA");
  } else {
    console.error(`HTTP error! status: ${response.status}`);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const battery: string | null = searchParams.get("battery");

  const url = `http://localhost:3000${
    battery != null ? "?battery=" + battery : ""
  }`;
  console.log("fetch url with battery", url);

  const imageBuffer = await grabScreenshot(url);
  const rotatedImage = await rotateImage(imageBuffer);
  const greyscaledImage = greyscaleImage(rotatedImage);

  // TODO: Send battery level to HA

  console.log("Returning png");
  const response = new Response(greyscaledImage);
  response.headers.set("content-type", "image/png");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
