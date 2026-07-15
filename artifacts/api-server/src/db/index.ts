import "../env-bootstrap.js";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { getDatabaseUrl } from "../env.js";
import { assertKiloDatabase } from "./assert-kilo-database.js";
import * as schema from "./schema.js";

const connectionString = getDatabaseUrl();

assertKiloDatabase(connectionString);

export const pool = new pg.Pool({ connectionString });
export const db = drizzle(pool, { schema });
