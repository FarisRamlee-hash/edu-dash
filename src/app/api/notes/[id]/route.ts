import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { content } = await req.json();
  const note = await db.note.update({ where: { id }, data: { content } });
  return NextResponse.json(note);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.note.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
