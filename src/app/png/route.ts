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
  await sharp(imageBuffer)
    .rotate(-90)
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

async function greyscaleImage(
  imageBuffer: Buffer | undefined
): Promise<Buffer | undefined> {
  if (!imageBuffer) {
    return undefined;
  }
  fs.writeFileSync("/tmp/test-color.png", imageBuffer);
  const png = new PNG({
    width: 600,
    height: 800,
    colorType: 0,
  });
  const src = fs.createReadStream("/tmp/test-color.png");
  const dst = fs.createWriteStream("/tmp/test-gray.png");
  png.on("parsed", function () {
    png.pack().pipe(dst);
  });
  await src.pipe(png);
  return fs.readFileSync("/tmp/test-gray.png");
}

export async function GET() {
  const imageBuffer = await grabScreenshot("http://localhost:3000");
  const rotatedImage = await rotateImage(imageBuffer);
  const greyscaledImage = await greyscaleImage(rotatedImage);

  console.log("Returning png", greyscaledImage);
  const response = new Response(greyscaledImage);
  response.headers.set("content-type", "image/png");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
