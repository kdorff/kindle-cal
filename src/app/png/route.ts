import { chromium } from "playwright";
import sharp from "sharp";

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
async function transformImage(
  imageBuffer: Buffer
): Promise<Buffer | undefined> {
  let rotatedGrayscaleImage = undefined;
  console.log("Transforming image");
  await sharp(imageBuffer)
    .rotate(-90)
    .grayscale(true)
    .png({ colors: 2 })
    .toColorspace("grey8")
    .toBuffer()
    .then((info) => {
      console.log("Transform implage completed", info);
      rotatedGrayscaleImage = info;
    })
    .catch((err) => {
      console.log("Transform implage FAILED", err);
    });
  return rotatedGrayscaleImage;
}

export async function GET() {
  const imageBuffer = await grabScreenshot("http://localhost:3000");
  const transformedImage = await transformImage(imageBuffer);

  console.log("Returning png", transformedImage);
  const response = new Response(transformedImage);
  response.headers.set("content-type", "image/png");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
