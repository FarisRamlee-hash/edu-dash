import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const entries = await db.weeklyVocab.findMany({
    orderBy: { weekOf: "desc" },
    include: { class: { select: { name: true } } },
  });

  type Entry = typeof entries[number];
  const parsed = entries.map((e: Entry) => ({
    ...e,
    words: JSON.parse(e.words),
    sentences: JSON.parse(e.sentences),
  }));

  return NextResponse.json(parsed);
}

export async function POST(req: Request) {
  const { classId, weekOf, words, sentences } = await req.json();
  const entry = await db.weeklyVocab.create({
    data: {
      classId: classId || null,
      weekOf: new Date(weekOf),
      words: JSON.stringify(words),
      sentences: JSON.stringify(sentences),
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
