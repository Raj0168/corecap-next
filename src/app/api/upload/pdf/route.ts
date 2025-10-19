// src/app/api/uploads/pdf/route.ts
import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs/promises";
import { createGcpStorage } from "@/lib/gcp";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIMES = ["application/pdf"];

async function parseForm(req: Request) {
  const form = formidable({
    multiples: false,
    maxFileSize: MAX_FILE_SIZE,
    keepExtensions: true,
  });

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      // @ts-ignore
      form.parse(req as any, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    }
  );
}

export async function POST(req: Request) {
  try {
    const { bucket, bucketName } = createGcpStorage();
    const { files } = await parseForm(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Use field name 'file'." },
        { status: 400 }
      );
    }

    if (!file.mimetype || !ALLOWED_MIMES.includes(file.mimetype)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const buffer = await fs.readFile(file.filepath);

    const timestamp = Date.now();
    const original = (file.originalFilename ?? "upload").replace(
      /[^a-zA-Z0-9.\-_]/g,
      "-"
    );
    const destination = `pdfs/${timestamp}-${original}`;

    const gfile = bucket.file(destination);
    await gfile.save(buffer, {
      resumable: false,
      contentType: file.mimetype,
      metadata: { contentType: file.mimetype },
      public: true,
    });

    try {
      await gfile.makePublic();
    } catch (err) {
      console.warn("makePublic failed:", err);
    }

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/uploads/pdf error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
