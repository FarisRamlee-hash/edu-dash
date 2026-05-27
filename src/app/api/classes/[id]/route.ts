import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cls = await db.class.findUnique({
    where: { id },
    include: {
      chapters: { orderBy: { number: "asc" } },
      homework: { orderBy: { dueDate: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!cls) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cls);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const cls = await db.class.update({ where: { id }, data });
  return NextResponse.json(cls);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.class.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
