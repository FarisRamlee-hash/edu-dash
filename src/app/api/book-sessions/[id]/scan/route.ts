import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const { rfidTag, studentId: directStudentId } = await req.json();

  let studentId = directStudentId;

  if (!studentId && rfidTag) {
    const student = await db.student.findFirst({ where: { rfidTag } });
    if (!student) {
      return NextResponse.json({ error: "No student with this RFID tag" }, { status: 404 });
    }
    studentId = student.id;
  }

  if (!studentId) return NextResponse.json({ error: "Missing studentId or rfidTag" }, { status: 400 });

  const existing = await db.bookSubmission.findFirst({ where: { sessionId, studentId } });
  if (existing) return NextResponse.json({ duplicate: true, submission: existing });

  const submission = await db.bookSubmission.create({
    data: { sessionId, studentId },
    include: { student: true },
  });
  return NextResponse.json({ duplicate: false, submission });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const { studentId } = await req.json();
  await db.bookSubmission.deleteMany({ where: { sessionId, studentId } });
  return NextResponse.json({ ok: true });
}
