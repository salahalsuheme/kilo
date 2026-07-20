import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  renderAboutPage,
  renderFleetPage,
  renderHomePage,
  renderRobotsTxt,
  renderSitemapXml,
} from "@workspace/landing-domain";

const here = path.dirname(fileURLToPath(import.meta.url));
const landingRoot = path.resolve(here, "..");
const publicSrc = path.resolve(landingRoot, "../kilo-app/public");
const dist = path.resolve(landingRoot, "dist");

const STATIC_ASSETS = [
  "fonts",
  "logo_kilo_white.webp",
  "kilo-logo.png",
  "login-bg.webp",
  "landpage.css",
  "landpage.js",
  "landpage-bg.png",
  "landpage-bg.webp",
  "fleet-suzuki-refrigerated.webp",
  "fleet-suzuki-dry.webp",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "og-image.png",
  "site.webmanifest",
];

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
      continue;
    }
    fs.copyFileSync(from, to);
  }
}

function removeDarkBackground(data: Buffer): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    if (luminance < 28) {
      data[i + 3] = 0;
      continue;
    }

    if (luminance < 48) {
      data[i + 3] = Math.round(((luminance - 28) / 20) * 255);
    }
  }
}

async function generateFleetVehicleWebp(
  inputPath: string,
  outputPath: string,
  targetWidth: number,
): Promise<{ width: number; height: number }> {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  removeDarkBackground(data);

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 12 })
    .resize(targetWidth, null, { fit: "inside" })
    .webp({ quality: 85, alphaQuality: 100 })
    .toFile(outputPath);

  const outputMeta = await sharp(outputPath).metadata();

  return {
    width: outputMeta.width ?? targetWidth,
    height: outputMeta.height ?? targetWidth,
  };
}

async function generateImages(): Promise<void> {
  const logoPath = path.join(publicSrc, "kilo-logo.png");
  const faviconPath = path.join(publicSrc, "favicon-32x32.png");
  const bgPath = path.join(publicSrc, "landpage-bg.png");

  if (fs.existsSync(faviconPath)) {
    await sharp(faviconPath).resize(16, 16, { fit: "contain", background: "#ffffff" }).png().toFile(path.join(publicSrc, "favicon-16x16.png"));
    await sharp(faviconPath).resize(180, 180, { fit: "contain", background: "#ffffff" }).png().toFile(path.join(publicSrc, "apple-touch-icon.png"));
  } else if (fs.existsSync(logoPath)) {
    await sharp(logoPath).resize(32, 32, { fit: "contain", background: "#0d0d1a" }).png().toFile(faviconPath);
    await sharp(logoPath).resize(16, 16, { fit: "contain", background: "#0d0d1a" }).png().toFile(path.join(publicSrc, "favicon-16x16.png"));
    await sharp(logoPath).resize(180, 180, { fit: "contain", background: "#0d0d1a" }).png().toFile(path.join(publicSrc, "apple-touch-icon.png"));
  }

  if (!fs.existsSync(logoPath)) {
    return;
  }

  const ogBase = sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 13, g: 13, b: 26, alpha: 1 },
    },
  });
  const logoBuffer = await sharp(logoPath).resize(360, 360, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await ogBase
    .composite([{ input: logoBuffer, gravity: "centre" }])
    .png()
    .toFile(path.join(publicSrc, "og-image.png"));

  if (fs.existsSync(bgPath)) {
    await sharp(bgPath).webp({ quality: 82 }).toFile(path.join(publicSrc, "landpage-bg.webp"));
  }

  const fleetImages: Array<{ source: string; output: string }> = [
    {
      source: "fleet-suzuki-refrigerated.png",
      output: "fleet-suzuki-refrigerated.webp",
    },
    {
      source: "fleet-suzuki-dry.png",
      output: "fleet-suzuki-dry.webp",
    },
  ];

  for (const fleetImage of fleetImages) {
    const fleetImagePath = path.resolve(landingRoot, "assets", fleetImage.source);
    if (!fs.existsSync(fleetImagePath)) continue;

    await generateFleetVehicleWebp(
      fleetImagePath,
      path.join(publicSrc, fleetImage.output),
      480,
    );
  }
}

function writeGeneratedPages(publicDir: string, distDir: string): void {
  const publicPages: Array<{ file: string; html: string }> = [
    { file: "landpage.html", html: renderHomePage("ar") },
    { file: "landpage-en.html", html: renderHomePage("en") },
    { file: "about.html", html: renderAboutPage("ar") },
    { file: "about-en.html", html: renderAboutPage("en") },
    { file: "fleet.html", html: renderFleetPage("ar") },
    { file: "fleet-en.html", html: renderFleetPage("en") },
  ];

  for (const page of publicPages) {
    fs.writeFileSync(path.join(publicDir, page.file), page.html, "utf8");
  }

  fs.writeFileSync(path.join(publicDir, "robots.txt"), renderRobotsTxt(), "utf8");
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), renderSitemapXml(), "utf8");
  fs.writeFileSync(
    path.join(publicDir, "site.webmanifest"),
    JSON.stringify(
      {
        name: "كيلو",
        short_name: "Kilo",
        icons: [
          { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
          { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
        theme_color: "#0d0d1a",
        background_color: "#0d0d1a",
        display: "standalone",
        lang: "ar",
      },
      null,
      2,
    ),
    "utf8",
  );

  fs.writeFileSync(path.join(distDir, "index.html"), renderHomePage("ar"), "utf8");
  for (const page of publicPages) {
    fs.writeFileSync(path.join(distDir, page.file), page.html, "utf8");
  }
  fs.copyFileSync(path.join(publicDir, "robots.txt"), path.join(distDir, "robots.txt"));
  fs.copyFileSync(path.join(publicDir, "sitemap.xml"), path.join(distDir, "sitemap.xml"));
  fs.copyFileSync(path.join(publicDir, "site.webmanifest"), path.join(distDir, "site.webmanifest"));
}

function copyStaticAssets(distDir: string): void {
  for (const asset of STATIC_ASSETS) {
    const from = path.join(publicSrc, asset);
    if (!fs.existsSync(from)) continue;
    const to = path.join(distDir, asset);
    if (fs.statSync(from).isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

async function buildLanding(): Promise<void> {
  fs.mkdirSync(publicSrc, { recursive: true });
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
  }
  fs.mkdirSync(dist, { recursive: true });

  await generateImages();
  copyStaticAssets(dist);
  writeGeneratedPages(publicSrc, dist);
  console.log(`Landing built → public + ${dist}`);
}

buildLanding().catch((error) => {
  console.error(error);
  process.exit(1);
});
