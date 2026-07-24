import type { Browser } from "playwright";
import { chromium } from "playwright";
import { PLAYWRIGHT_PDF_PAGE_MARGIN } from "@workspace/print-domain";

const PDF_RENDER_TIMEOUT_MS = 90_000;

let browserPromise: Promise<Browser> | null = null;

async function launchBrowser(): Promise<Browser> {
  return chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error) => {
      browserPromise = null;
      throw error;
    });
  }
  return browserPromise;
}

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  page.setDefaultTimeout(PDF_RENDER_TIMEOUT_MS);

  try {
    await page.emulateMedia({ media: "print" });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
        ),
      );
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: PLAYWRIGHT_PDF_PAGE_MARGIN,
        right: PLAYWRIGHT_PDF_PAGE_MARGIN,
        bottom: PLAYWRIGHT_PDF_PAGE_MARGIN,
        left: PLAYWRIGHT_PDF_PAGE_MARGIN,
      },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
