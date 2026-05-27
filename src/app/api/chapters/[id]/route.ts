import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const chapter = await db.chapter.update({ where: { id }, data });
  return NextResponse.json(chapter);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.chapter.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
