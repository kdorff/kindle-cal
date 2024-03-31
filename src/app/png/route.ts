import fs from "fs";
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
    await page.goto("http://localhost:3000");
    console.log("Taking screenshot");
    return await page.screenshot();
  } finally {
    // Close the browser
    page && page.close();
    browser && browser.close();
  }
}

/**
 * Transform the png image in imageBuffer
 * by rotating it 90 degreesleft and converting it to grayscale.
 * Return as a png image in a Buffer
 * @param imageBuffer png image to transform
 * @returns Buffer for transformed png image
 */
async function rotateImage(imageBuffer: Buffer): Promise<Buffer | undefined> {
  let rotatedImage = undefined;
  console.log("Transforming image");
  // Greyscaling doesn't seem to work correct with sharp to
  // get an impage that is compat with Kindle. It generally
  // renders as RGB without repect to color space, etc.
  // Maybe if there check for grey4? grey16? Unsure.
  // 2 colors? 4? 8? 16?
  await sharp(imageBuffer)
    .rotate(-90)
    .grayscale(true)
    .toColorspace("b-w")
    .png({ colors: 2 })
    .toBuffer()
    .then((info) => {
      console.log("Transform implage completed", info);
      rotatedImage = info;
    })
    .catch((err) => {
      console.log("Transform implage FAILED", err);
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

export async function GET() {
  const imageBuffer = await grabScreenshot("http://localhost:3000");
  const rotatedImage = await rotateImage(imageBuffer);
  const greyscaledImage = greyscaleImage(rotatedImage);

  console.log("Returning png", greyscaledImage);
  const response = new Response(greyscaledImage);
  response.headers.set("content-type", "image/png");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
