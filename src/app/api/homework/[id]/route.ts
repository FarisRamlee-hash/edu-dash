import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, title, description, dueDate } = await req.json();
  const hw = await db.homework.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
    },
  });
  return NextResponse.json(hw);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.homework.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
