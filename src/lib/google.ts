import { google } from "googleapis";
import { Readable } from "stream";
import { db } from "./db";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/auth/google/callback`
  );
}

export function getGoogleAuthUrl(): string {
  const auth = getOAuth2Client();
  return auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/classroom.announcements",
      "https://www.googleapis.com/auth/classroom.courses.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
}

async function getAuthClient() {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  if (!settings?.googleTokens) throw new Error("Google account not connected");

  const tokens = JSON.parse(settings.googleTokens);
  const auth = getOAuth2Client();
  auth.setCredentials(tokens);

  // Auto-refresh token and persist if changed
  auth.on("tokens", async (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    await db.settings.upsert({
      where: { id: "singleton" },
      update: { googleTokens: JSON.stringify(merged) },
      create: { id: "singleton", googleTokens: JSON.stringify(merged) },
    });
  });

  return auth;
}

export async function exchangeCodeForTokens(code: string) {
  const auth = getOAuth2Client();
  const { tokens } = await auth.getToken(code);
  return tokens;
}

export async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  folderId?: string | null
): Promise<{ fileId: string; webViewLink: string }> {
  const auth = await getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const stream = Readable.from(buffer);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType: "application/pdf",
      ...(folderId ? { parents: [folderId] } : {}),
    },
    media: { mimeType: "application/pdf", body: stream },
    fields: "id,webViewLink",
  });

  // Make file readable by anyone with the link
  await drive.permissions.create({
    fileId: res.data.id!,
    requestBody: { role: "reader", type: "anyone" },
  });

  return { fileId: res.data.id!, webViewLink: res.data.webViewLink! };
}

export async function postToClassroom(
  courseId: string,
  text: string,
  driveFileId?: string
): Promise<string> {
  const auth = await getAuthClient();
  const classroom = google.classroom({ version: "v1", auth });

  const res = await classroom.courses.announcements.create({
    courseId,
    requestBody: {
      text,
      state: "PUBLISHED",
      ...(driveFileId
        ? {
            materials: [
              {
                driveFile: {
                  driveFile: { id: driveFileId },
                  shareMode: "VIEW",
                },
              },
            ],
          }
        : {}),
    },
  });

  return res.data.id!;
}

export async function getClassroomCourses() {
  const auth = await getAuthClient();
  const classroom = google.classroom({ version: "v1", auth });
  const res = await classroom.courses.list({ teacherId: "me", courseStates: ["ACTIVE"] });
  return res.data.courses ?? [];
}

export async function isGoogleConnected(): Promise<boolean> {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  return !!settings?.googleTokens;
}
