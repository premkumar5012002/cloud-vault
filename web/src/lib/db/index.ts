import { Client, Pool } from "pg";
import { Kyselify } from "drizzle-orm/kysely";
import { Kysely, PostgresDialect } from "kysely";
import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "@/lib/env.mjs";
import * as schema from "@/lib/db/schema";

const client = new Client(env.DATABASE_URL);

await client.connect();

interface Database {
  folders: Kyselify<typeof schema.folders>;
}

export const kysely = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: env.DATABASE_URL }),
  }),
});

export const db = drizzle(client, { schema });
