import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClassroomCourses, isGoogleConnected } from "@/lib/google";

export async function GET() {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  const connected = await isGoogleConnected();

  let courses: Array<{ id: string; name: string }> = [];
  if (connected) {
    try {
      const raw = await getClassroomCourses();
      courses = raw.map((c) => ({ id: c.id!, name: c.name! }));
    } catch {
      // silently fail — tokens may be expired
    }
  }

  return NextResponse.json({
    connected,
    driveFolderId: settings?.driveFolderId ?? null,
    classroomCourseId: settings?.classroomCourseId ?? null,
    courses,
  });
}

export async function PUT(req: Request) {
  const { driveFolderId, classroomCourseId } = await req.json();
  const settings = await db.settings.upsert({
    where: { id: "singleton" },
    update: { driveFolderId, classroomCourseId },
    create: { id: "singleton", driveFolderId, classroomCourseId },
  });
  return NextResponse.json(settings);
}
