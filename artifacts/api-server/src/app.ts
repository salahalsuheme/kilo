import cors from "cors";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db/index.js";
import { getCorsOrigins, getSessionSecret } from "./env.js";
import authRouter from "./modules/auth/routes.js";
import customersRouter from "./modules/customers/routes.js";
import establishmentsRouter from "./modules/establishments/routes.js";
import usersRouter from "./modules/users/routes.js";
import vehiclesRouter from "./modules/vehicles/routes.js";
import dashboardRouter from "./modules/dashboard/routes.js";
import settingsRouter from "./modules/settings/routes.js";
import contractsRouter from "./modules/contracts/routes.js";
import invoicesRouter from "./modules/invoices/routes.js";
import financeRouter from "./modules/finance/routes.js";
import notificationsRouter from "./modules/notifications/routes.js";
import { securityHeaders } from "./security-headers.js";
import { getResolvedUploadsDir, getUploadsStorageMode, handleServeUploadedFile } from "./storage/uploads-runtime.js";

const PgSession = connectPgSimple(session);
const isProduction = process.env.NODE_ENV === "production";

function resolveClientDist(): string | null {
  const candidates = [
    path.resolve(process.cwd(), "artifacts/kilo-app/dist"),
    path.resolve(process.cwd(), "../kilo-app/dist"),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../kilo-app/dist"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "index.html"))) {
      return candidate;
    }
  }

  return null;
}

export function createApp() {
  const app = express();

  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");
  app.use(securityHeaders());

  const corsOrigins = getCorsOrigins();
  app.use(
    cors({
      origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  const uploadsPath = getResolvedUploadsDir();
  fs.mkdirSync(uploadsPath, { recursive: true });

  app.use(
    session({
      name: "kilo-sid",
      store: new PgSession({ pool, tableName: "session", createTableIfMissing: true }),
      secret: getSessionSecret(),
      resave: false,
      saveUninitialized: false,
      proxy: isProduction,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  if (getUploadsStorageMode() === "s3") {
    app.get("/uploads/:filename", (req, res) => {
      void handleServeUploadedFile(req, res);
    });
  } else {
    app.use("/uploads", express.static(uploadsPath));
  }

  const api = express.Router();
  api.get("/healthz", (_req, res) => res.json({ ok: true }));
  api.use(authRouter);
  api.use(customersRouter);
  api.use(establishmentsRouter);
  api.use(usersRouter);
  api.use(vehiclesRouter);
  api.use(contractsRouter);
  api.use(invoicesRouter);
  api.use(financeRouter);
  api.use(notificationsRouter);
  api.use(dashboardRouter);
  api.use(settingsRouter);
  app.use("/api", api);

  const clientDist = isProduction ? resolveClientDist() : null;
  if (clientDist) {
    app.use(express.static(clientDist, { index: false }));
    app.get(/^(?!\/api\/|\/uploads\/).*/, (_req, res, next) => {
      const indexPath = path.join(clientDist, "index.html");
      if (!fs.existsSync(indexPath)) {
        next();
        return;
      }
      res.sendFile(indexPath);
    });
  }

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (res.headersSent) return;
    console.error(err);
    res.status(500).json({ message: "حدث خطأ غير متوقع. حاول مرة أخرى." });
  });

  return app;
}
