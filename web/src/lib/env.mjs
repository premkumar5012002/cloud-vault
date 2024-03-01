import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		AWS_REGION: z.string(),
		AWS_ENDPOINT: z.string().url(),
		AWS_ACCESS_KEY_ID: z.string(),
		AWS_SECRET_ACCESS_KEY: z.string(),
		AWS_S3_BUCKET_NAME: z.string(),
		REDIS_URL: z.string().url(),
		DATABASE_URL: z.string().url(),
		NODE_ENV: z.enum(["development", "production"]),
		WEBHOOK_SECRET_KEY: z.string(),
	},
	client: {},
	runtimeEnv: process.env,
});
