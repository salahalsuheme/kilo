import "./env-bootstrap.js";

// Never wipe the database on normal API start — reset is only via `pnpm db:setup`.
delete process.env.KILO_DEV_RESET;

import { createApp } from "./app.js";
import { runMigrations } from "./db/migrate.js";
import { getListenPort, validateProductionEnv } from "./env.js";
import { ensureSeedData } from "./modules/bootstrap/service.js";

async function main() {
  validateProductionEnv();

  await runMigrations();
  await ensureSeedData();

  const app = createApp();
  const port = getListenPort();

  app.listen(port, "0.0.0.0", () => {
    console.log(`Kilo API listening on port ${port}`);
    void import("./modules/finance/subscriptions-service.js")
      .then((mod) => mod.ensureSubscriptionInvoicesForAllOrgs())
      .catch((err) => console.error("[bootstrap] subscription invoices skipped:", err));
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
