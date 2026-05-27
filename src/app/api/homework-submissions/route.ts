import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const homeworkId = req.nextUrl.searchParams.get("homeworkId");
  if (!homeworkId) return NextResponse.json({ error: "homeworkId required" }, { status: 400 });
  const subs = await db.homeworkSubmission.findMany({
    where: { homeworkId },
    include: { student: { select: { id: true, name: true } } },
  });
  return NextResponse.json(subs);
}

export async function POST(req: NextRequest) {
  const { homeworkId, studentId } = await req.json();
  const sub = await db.homeworkSubmission.upsert({
    where: { homeworkId_studentId: { homeworkId, studentId } },
    create: { homeworkId, studentId },
    update: {},
    include: { student: { select: { id: true, name: true } } },
  });
  return NextResponse.json(sub);
}

export async function DELETE(req: NextRequest) {
  const { homeworkId, studentId } = await req.json();
  await db.homeworkSubmission.deleteMany({ where: { homeworkId, studentId } });
  return NextResponse.json({ ok: true });
}
