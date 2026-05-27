import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("classId");
  const date = req.nextUrl.searchParams.get("date");
  if (!classId || !date) return NextResponse.json({ error: "classId and date required" }, { status: 400 });

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const records = await db.attendance.findMany({
    where: { classId, date: { gte: start, lte: end } },
    include: { student: { select: { id: true, name: true } } },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const { classId, date, records } = await req.json();
  // records: [{ studentId, status }]
  const day = new Date(date);
  day.setHours(12, 0, 0, 0);

  const results = await db.$transaction(
    records.map((r: { studentId: string; status: string }) =>
      db.attendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date: day } },
        create: { studentId: r.studentId, classId, date: day, status: r.status },
        update: { status: r.status },
      })
    )
  );
  return NextResponse.json(results);
}
