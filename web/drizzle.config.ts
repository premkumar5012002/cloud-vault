import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

if (process.env.DATABASE_URL === undefined) {
	console.error("DATABASE_URL is not found in environment variables");
	process.exit(1);
}

const config: Config = {
	driver: "pg",
	breakpoints: true,
	out: "./src/lib/db/migrations",
	schema: "./src/lib/db/schema.ts",
	dbCredentials: {
		connectionString: process.env.DATABASE_URL,
	},
};

export default config;
