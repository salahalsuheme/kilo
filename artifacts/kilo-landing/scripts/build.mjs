import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const landingRoot = path.resolve(here, "..");
const publicSrc = path.resolve(landingRoot, "../kilo-app/public");
const dist = path.resolve(landingRoot, "dist");

function copyDir(src, dest) {
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

function buildLanding() {
  if (!fs.existsSync(path.join(publicSrc, "landpage.html"))) {
    throw new Error(`Missing landing source: ${path.join(publicSrc, "landpage.html")}`);
  }
  if (!fs.existsSync(path.join(publicSrc, "landpage-en.html"))) {
    throw new Error(`Missing landing source: ${path.join(publicSrc, "landpage-en.html")}`);
  }

  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
  }
  fs.mkdirSync(dist, { recursive: true });

  const landingHtml = fs.readFileSync(path.join(publicSrc, "landpage.html"), "utf8");
  fs.writeFileSync(path.join(dist, "index.html"), landingHtml, "utf8");

  const landingEnHtml = fs.readFileSync(path.join(publicSrc, "landpage-en.html"), "utf8");
  fs.writeFileSync(path.join(dist, "en.html"), landingEnHtml, "utf8");

  for (const asset of ["fonts", "logo_kilo_white.webp", "kilo-logo.png", "login-bg.webp", "landpage.css", "landpage-bg.png"]) {
    const from = path.join(publicSrc, asset);
    if (!fs.existsSync(from)) continue;
    const to = path.join(dist, asset);
    if (fs.statSync(from).isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }

  console.log(`Landing built → ${dist}`);
}

buildLanding();
