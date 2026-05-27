import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { classId, number, title, status } = await req.json();
  const chapter = await db.chapter.create({
    data: { classId, number, title, status: status ?? "upcoming" },
  });
  return NextResponse.json(chapter, { status: 201 });
}
