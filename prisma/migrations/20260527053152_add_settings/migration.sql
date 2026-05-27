-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "googleTokens" TEXT,
    "driveFolderId" TEXT,
    "classroomCourseId" TEXT
);
