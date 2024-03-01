import { z } from "zod";
import Redis from "ioredis";
import { Readable } from "stream";
import * as express from "express";
import * as archiver from "archiver";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const zipSchema = z
  .object({
    key: z.string(),
    fullPath: z.string(),
  })
  .array();

const app = express();
const redis = new Redis();
const s3 = new S3Client();

const convertReadableStreamIntoReadable = (readableStream: ReadableStream) => {
  const reader = readableStream.getReader();
  return new Readable({
    async read() {
      const result = await reader.read();
      if (result.done) {
        this.push(null);
      } else {
        this.push(result.value);
      }
    },
  });
};

app.get("/download/:zipId", async (req, res) => {
  const zipId = req.params.zipId;

  const zip = await redis.get(zipId);

  if (zip === null) {
    return res.status(404).send("Zip not found");
  }

  const date = new Date();

  res.writeHead(200, {
    "Content-Type": "application/zip",
    "Content-disposition": `attachment; filename=CloudVault-${date.getFullYear()}-${date.getMonth()}-${date.getDay()}.zip`,
  });

  const archive = archiver("zip", { zlib: { level: 9 } });

  const parsed = zipSchema.safeParse(JSON.parse(zip));

  if (parsed.success === false) {
    return res.status(500).send("Invalid zip");
  }

  for (const zip of parsed.data) {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: zip.key,
    });

    const object = await s3.send(command);

    const fileStream = object.Body?.transformToWebStream();

    if (fileStream) {
      const readableStream = convertReadableStreamIntoReadable(fileStream);
      archive.append(readableStream, { name: zip.fullPath });
    }
  }

  archive.pipe(res);

  archive.finalize();
});
