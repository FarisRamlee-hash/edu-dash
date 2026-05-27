import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("classId");
  const summary = req.nextUrl.searchParams.get("summary");

  // Summary mode: return session count + last session date grouped by classId
  if (summary === "true") {
    const sessions = await db.bookSession.findMany({
      select: { classId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    const map = new Map<string, { count: number; lastDate: string }>();
    for (const s of sessions) {
      if (!map.has(s.classId)) {
        map.set(s.classId, { count: 0, lastDate: s.createdAt.toISOString() });
      }
      map.get(s.classId)!.count++;
    }
    return NextResponse.json(Object.fromEntries(map));
  }

  if (!classId) return NextResponse.json([]);
  const sessions = await db.bookSession.findMany({
    where: { classId },
    orderBy: { createdAt: "desc" },
    include: {
      submissions: { include: { student: true } },
      _count: { select: { submissions: true } },
    },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const { classId, label } = await req.json();
  const session = await db.bookSession.create({
    data: { classId, label: label || "Book Signing" },
    include: { submissions: true },
  });
  return NextResponse.json(session);
}
