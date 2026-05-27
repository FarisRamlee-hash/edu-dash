import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const classes = await db.class.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const { name, grade, subject } = await req.json();
  const cls = await db.class.create({ data: { name, grade, subject } });
  return NextResponse.json(cls, { status: 201 });
}
