import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { classId, names } = await req.json() as { classId: string; names: string[] };
  const clean = names.map(n => n.trim()).filter(Boolean);
  const students = await db.$transaction(
    clean.map(name => db.student.create({ data: { classId, name } }))
  );
  return NextResponse.json(students);
}
