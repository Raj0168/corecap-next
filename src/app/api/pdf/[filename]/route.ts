import { NextRequest, NextResponse } from "next/server";
import { bucket } from "@/lib/gcsClient";

// disable edge — we need Node.js streams
export const runtime = "nodejs";

// NOTE: Using 'any' for the context to bypass a persistent internal Next.js type generation error.
// We are also avoiding object destructuring in the function signature to further attempt to bypass the internal type check bug.
export async function GET(req: NextRequest, context: any) {
  const { filename } = context.params;

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 }
    );
  }

  try {
    const file = bucket.file(filename);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Stream the PDF from GCS
    const stream = file.createReadStream();

    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Error streaming GCS file:", err);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}
