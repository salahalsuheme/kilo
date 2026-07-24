import type { Browser } from "playwright";
import { chromium } from "playwright";
import {
  PLAYWRIGHT_PDF_BOTTOM_MARGIN,
  PLAYWRIGHT_PDF_FOOTER_TEMPLATE,
  PLAYWRIGHT_PDF_HEADER_TEMPLATE,
} from "@workspace/print-domain";

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: true });
  }
  return browserPromise;
}

export async function renderHtmlToPdf(html: string, baseURL?: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.emulateMedia({ media: "print" });
    await page.setContent(html, {
      waitUntil: "networkidle",
      ...(baseURL ? { baseURL } : {}),
    });
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
      displayHeaderFooter: true,
      headerTemplate: PLAYWRIGHT_PDF_HEADER_TEMPLATE,
      footerTemplate: PLAYWRIGHT_PDF_FOOTER_TEMPLATE,
      margin: {
        top: "12mm",
        right: "12mm",
        bottom: PLAYWRIGHT_PDF_BOTTOM_MARGIN,
        left: "12mm",
      },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
