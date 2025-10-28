import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chapter, { IChapter } from "@/models/Chapter";
import { getUserFromApiRoute } from "@/lib/auth-guard";

// NOTE: We no longer need the 'Context' interface, but we'll use a type assertion or 'any' on the function signature.

// The standard type for the context parameter is structurally:
// { params: { slug: string } }
// We use 'any' here to resolve the conflict with Next.js's internal types.

export async function GET(
  req: NextRequest,
  context: any // Using 'any' to bypass Next.js internal type checker conflict
) {
  // We destructure to ensure we still use the correct structure internally
  const { slug } = await context.params as { slug: string };
  await connectDB();
  const ch = await Chapter.findOne({ slug }).lean<IChapter>().exec();
  if (!ch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ch);
}

export async function PUT(
  req: NextRequest,
  context: any // Using 'any' to bypass Next.js internal type checker conflict
) {
  const { slug } = await context.params as { slug: string };
  await connectDB();
  const user = await getUserFromApiRoute();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const updated = await Chapter.findOneAndUpdate({ slug }, body, { new: true })
    .lean<IChapter>()
    .exec();
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id: updated._id.toString() });
}

export async function DELETE(
  req: NextRequest,
  context: any // Using 'any' to bypass Next.js internal type checker conflict
) {
  const { slug } = await context.params as { slug: string };
  await connectDB();
  const user = await getUserFromApiRoute();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const deleted = await Chapter.findOneAndDelete({ slug })
    .lean<IChapter>()
    .exec();
  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id: deleted._id.toString() });
}
