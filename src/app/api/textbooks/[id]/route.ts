import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const book = await db.textbook.update({
    where: { id },
    data: {
      ...(body.title   !== undefined && { title:   body.title }),
      ...(body.remarks !== undefined && { remarks: body.remarks }),
      ...(body.subject !== undefined && { subject: body.subject }),
    },
  });
  return NextResponse.json(book);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await db.textbook.findUnique({ where: { id } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Remove the physical file
  const filePath = join(process.cwd(), "public", "uploads", "textbooks", book.filename);
  if (existsSync(filePath)) {
    await unlink(filePath).catch(() => {});
  }

  await db.textbook.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
