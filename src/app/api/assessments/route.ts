import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });
  const assessments = await db.assessment.findMany({
    where: { classId },
    include: { marks: { include: { student: { select: { id: true, name: true } } } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const { classId, title, maxScore, date } = await req.json();
  const assessment = await db.assessment.create({
    data: { classId, title, maxScore: Number(maxScore), date: new Date(date) },
  });
  return NextResponse.json(assessment);
}
