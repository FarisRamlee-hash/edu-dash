import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json([], { status: 400 });
  const students = await db.student.findMany({
    where: { classId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const { classId, name, rfidTag } = await req.json();
  const student = await db.student.create({
    data: { classId, name, rfidTag: rfidTag || null },
  });
  return NextResponse.json(student);
}
