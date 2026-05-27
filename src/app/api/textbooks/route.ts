import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json([]);
  const books = await db.textbook.findMany({
    where: { classId },
    orderBy: { addedAt: "desc" },
  });
  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const classId  = formData.get("classId") as string;
    const title    = (formData.get("title") as string) || "Untitled";
    const subject  = (formData.get("subject") as string) || "";
    const remarks  = (formData.get("remarks") as string) || "";
    const addedAt  = formData.get("addedAt") ? new Date(formData.get("addedAt") as string) : new Date();

    if (!file || !classId) {
      return NextResponse.json({ error: "Missing file or classId" }, { status: 400 });
    }

    // Sanitise filename and make unique
    const ext      = file.name.endsWith(".pdf") ? ".pdf" : ".pdf";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}_${safeName}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "textbooks");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(join(uploadDir, filename), buffer);

    const textbook = await db.textbook.create({
      data: { classId, title, subject, filename, fileSize: buffer.length, remarks, addedAt },
    });

    return NextResponse.json(textbook, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
