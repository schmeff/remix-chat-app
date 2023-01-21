-- CreateTable
CREATE TABLE "MessageEmojis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "messageId" INTEGER,
    CONSTRAINT "MessageEmojis_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
