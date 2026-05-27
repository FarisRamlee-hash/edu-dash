import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { classId, content } = await req.json();
  const note = await db.note.create({ data: { classId, content } });
  return NextResponse.json(note, { status: 201 });
}
