import fs from "fs";
import { chromium } from "playwright";
import sharp from "sharp";
// @ts-ignore
import { PNG } from "pngjs/browser";

export async function GET() {
  // Take the screenshot
  console.log("Launching chromium");
  const browser = await chromium.launch();
  console.log("Opening page");
  const page = await browser.newPage();
  console.log("Setting viewport size");
  await page.setViewportSize({ width: 800, height: 600 });
  console.log("Requesting URL");
  await page.goto("http://localhost:3000");
  console.log("Taking screenshot");
  const imageBuffer = await page.screenshot();

  // Close the browser
  page.close();
  browser.close();

  // Rotate the image.
  console.log("Rating the image");
  const rotatedImageBuffer = await sharp(imageBuffer)
    .rotate(-90)
    // .toBuffer()
    .toFile("/tmp/test-color.png")
    .then((info) => {
      console.log(info);
    })
    .catch((err) => {
      console.log(err);
    });
  console.log("Rotated image written");

  // Grayscale the buffer
  console.log("Grayscale, 4 bit the PNG");

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

  // Send it as a response
  console.log("Returning result");
  const response = new Response(fs.readFileSync("/tmp/test-gray.png"));
  response.headers.set("content-type", "image/png");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
