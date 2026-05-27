import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await db.bookSession.findUnique({
    where: { id },
    include: {
      submissions: { include: { student: true } },
      class: { include: { students: { orderBy: { name: "asc" } } } },
    },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.bookSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
