import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVocabPDF } from "@/lib/pdf";
import { uploadToDrive, postToClassroom, isGoogleConnected } from "@/lib/google";

// Vercel cron: runs every Monday at 08:00 MYT (00:00 UTC)
// vercel.json: "0 0 * * 1"

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isGoogleConnected())) {
    return NextResponse.json({ skipped: "Google not connected" });
  }

  const settings = await db.settings.findUnique({ where: { id: "singleton" } });

  // Find all unuploaded vocab sheets for this week
  const weekStart = getThisMonday();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const pending = await db.weeklyVocab.findMany({
    where: {
      weekOf: { gte: weekStart, lt: weekEnd },
      uploadedAt: null,
    },
    include: { class: { select: { name: true } } },
  });

  const results = [];

  for (const entry of pending) {
    try {
      const words = JSON.parse(entry.words);
      const sentences = JSON.parse(entry.sentences);
      const weekLabel = new Date(entry.weekOf).toLocaleDateString("en-MY", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const buffer = await generateVocabPDF({
        weekOf: weekLabel,
        className: entry.class?.name,
        words,
        sentences,
      });

      const filename = `vocab-${entry.weekOf.toISOString().split("T")[0]}${entry.class ? `-${entry.class.name.replace(/\s+/g, "-")}` : ""}.pdf`;

      const { fileId, webViewLink } = await uploadToDrive(buffer, filename, settings?.driveFolderId);

      let classroomPostId: string | null = null;
      if (settings?.classroomCourseId) {
        const text = [
          `📚 Weekly Vocabulary — ${weekLabel}`,
          entry.class ? `Class: ${entry.class.name}` : "",
          "",
          "Words this week:",
          ...words.map((w: { word: string; definition: string }, i: number) => `${i + 1}. ${w.word} — ${w.definition}`),
        ]
          .filter(Boolean)
          .join("\n");

        classroomPostId = await postToClassroom(settings.classroomCourseId, text, fileId);
      }

      await db.weeklyVocab.update({
        where: { id: entry.id },
        data: { pdfUrl: webViewLink, driveFileId: fileId, classroomPostId, uploadedAt: new Date() },
      });

      results.push({ id: entry.id, status: "uploaded" });
    } catch (err) {
      console.error(`Failed to process vocab entry ${entry.id}:`, err);
      results.push({ id: entry.id, status: "error", error: String(err) });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

function getThisMonday(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
