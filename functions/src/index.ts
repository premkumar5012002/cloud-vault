import { createHmac } from "crypto";
import { Handler, S3Event } from "aws-lambda";

export const handler: Handler = async (event: S3Event) => {
  try {
    if (process.env.WEBHOOK_URL === undefined) {
      throw new Error("WEBHOOK_URL is not defined");
    }

    if (process.env.SECRET_KEY === undefined) {
      throw new Error("SECRET_KEY is not defined");
    }

    const objectCreated = {
      key: event.Records[0].s3.object.key,
      size: event.Records[0].s3.object.size,
      bucket: event.Records[0].s3.bucket.name,
    };

    const payload = JSON.stringify(objectCreated);

    const hash = createHmac("sha256", process.env.SECRET_KEY)
      .update(payload, "utf-8")
      .digest("hex");

    const result = await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: {
        "x-hmac-hash": hash,
        "Content-Type": "application/json",
      },
      body: payload,
    });

    if (!result.ok) {
      throw new Error(`Failed to send webhook: ${result.statusText}`);
    }

    return { statusCode: 200 };
  } catch (e) {
    console.error("Error in S3 event handler:", e);
    return { statusCode: 500 };
  }
};
