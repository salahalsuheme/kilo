import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const port = Number(process.env.PORT ?? 3000);

if (!fs.existsSync(path.join(dist, "index.html"))) {
  throw new Error("Landing dist missing. Run build first.");
}

const app = express();
app.disable("x-powered-by");

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use(express.static(dist, { index: false }));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(dist, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Kilo landing listening on port ${port}`);
});
