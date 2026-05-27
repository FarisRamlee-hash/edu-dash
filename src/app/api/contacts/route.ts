import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });
  const logs = await db.contactLog.findMany({
    where: { classId },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const { classId, student, note, date } = await req.json();
  const log = await db.contactLog.create({
    data: { classId, student, note, date: date ? new Date(date) : new Date() },
  });
  return NextResponse.json(log);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.contactLog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
