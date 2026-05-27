import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, rfidTag } = await req.json();
  const student = await db.student.update({
    where: { id },
    data: { name, rfidTag: rfidTag || null },
  });
  return NextResponse.json(student);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
