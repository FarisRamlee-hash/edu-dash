import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVocabPDF } from "@/lib/pdf";
import { uploadToDrive, postToClassroom, isGoogleConnected } from "@/lib/google";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const entry = await db.weeklyVocab.findUnique({
    where: { id },
    include: { class: { select: { name: true } } },
  });

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const words = JSON.parse(entry.words);
  const sentences = JSON.parse(entry.sentences);
  const weekLabel = new Date(entry.weekOf).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Generate PDF buffer
  const buffer = await generateVocabPDF({
    weekOf: weekLabel,
    className: entry.class?.name,
    words,
    sentences,
  });

  const filename = `vocab-${entry.weekOf.toISOString().split("T")[0]}${entry.class ? `-${entry.class.name.replace(/\s+/g, "-")}` : ""}.pdf`;

  let pdfUrl: string | null = null;
  let driveFileId: string | null = null;
  let classroomPostId: string | null = null;

  if (await isGoogleConnected()) {
    const settings = await db.settings.findUnique({ where: { id: "singleton" } });

    // Upload to Drive
    try {
      const uploaded = await uploadToDrive(buffer, filename, settings?.driveFolderId);
      pdfUrl = uploaded.webViewLink;
      driveFileId = uploaded.fileId;
    } catch (err) {
      console.error("Drive upload failed:", err);
      return NextResponse.json({ error: "Failed to upload to Google Drive" }, { status: 500 });
    }

    // Post to Classroom
    if (settings?.classroomCourseId) {
      try {
        const text = [
          `📚 Weekly Vocabulary — ${weekLabel}`,
          entry.class ? `Class: ${entry.class.name}` : "",
          "",
          "Words this week:",
          ...words.map((w: { word: string; definition: string }, i: number) => `${i + 1}. ${w.word} — ${w.definition}`),
        ]
          .filter(Boolean)
          .join("\n");

        classroomPostId = await postToClassroom(settings.classroomCourseId, text, driveFileId ?? undefined);
      } catch (err) {
        console.error("Classroom post failed:", err);
      }
    }
  } else {
    // No Google — serve PDF directly via data URL so the teacher can still download
    pdfUrl = `data:application/pdf;base64,${buffer.toString("base64")}`;
  }

  const updated = await db.weeklyVocab.update({
    where: { id },
    data: {
      pdfUrl,
      driveFileId,
      classroomPostId,
      uploadedAt: new Date(),
    },
  });

  return NextResponse.json({ ...updated, pdfUrl, classroomPostId });
}
