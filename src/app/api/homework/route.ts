import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { classId, title, description, dueDate, status } = await req.json();
  const hw = await db.homework.create({
    data: { classId, title, description, dueDate: new Date(dueDate), status: status ?? "pending" },
  });
  return NextResponse.json(hw, { status: 201 });
}
