import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: assessmentId } = await params;
  const { marks } = await req.json();
  // marks: [{ studentId, score }]
  const results = await db.$transaction(
    marks.map((m: { studentId: string; score: number }) =>
      db.mark.upsert({
        where: { assessmentId_studentId: { assessmentId, studentId: m.studentId } },
        create: { assessmentId, studentId: m.studentId, score: m.score },
        update: { score: m.score },
      })
    )
  );
  return NextResponse.json(results);
}
