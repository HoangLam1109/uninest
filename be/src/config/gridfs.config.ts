import mongoose from "mongoose";
import { Readable } from "node:stream";

export type PdfFileStream = {
  filename: string;
  contentType: string;
  stream: NodeJS.ReadableStream;
};

function getBucket() {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB is not connected");
  }

  return new mongoose.mongo.GridFSBucket(db, {
    bucketName: "contractFiles",
  });
}

export function uploadPdfToGridFs(
  filename: string,
  body: Buffer,
  metadata?: Record<string, unknown>
) {
  const bucket = getBucket();

  return new Promise<string>((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        ...metadata,
        contentType: "application/pdf",
      },
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
    uploadStream.end(body);
  });
}

export async function openPdfFromGridFs(fileId: string): Promise<PdfFileStream> {
  const bucket = getBucket();
  const objectId = new mongoose.Types.ObjectId(fileId);
  const files = await bucket.find({ _id: objectId }).toArray();
  const file = files[0];

  if (!file) {
    throw new Error("Contract file not found");
  }

  return {
    filename: file.filename,
    contentType: "application/pdf",
    stream: bucket.openDownloadStream(objectId),
  };
}

export async function downloadPdfFromGridFs(fileId: string): Promise<Buffer> {
  const file = await openPdfFromGridFs(fileId);
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    file.stream.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    file.stream.on("error", reject);
    file.stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

export async function openPdfFromUrl(fileUrl: string): Promise<PdfFileStream> {
  const response = await fetch(fileUrl);
  if (!response.ok || !response.body) {
    throw new Error("Cannot download contract PDF");
  }

  const filename = fileUrl.split("/").pop()?.split("?")[0] || "contract.pdf";

  return {
    filename,
    contentType: response.headers.get("content-type") ?? "application/pdf",
    stream: Readable.fromWeb(response.body as any),
  };
}
