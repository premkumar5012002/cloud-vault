import { Client } from "pg";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

if (process.env.DATABASE_URL === undefined) {
	console.error("DATABASE_URL is not found in environment variables");
	process.exit(1);
}

const runMigrate = async () => {
	const client = new Client(process.env.DATABASE_URL);

	const db = drizzle(client);

	console.log("⏳ Running migrations...");

	const start = Date.now();

	await migrate(db, { migrationsFolder: "src/lib/db/migrations" });

	const end = Date.now();

	console.log(`✅ Migrations completed in ${end - start}ms`);

	process.exit(0);
};

runMigrate().catch((err) => {
	console.error("❌ Migration failed");
	console.error(err);
	process.exit(1);
});
