-- CreateTable
CREATE TABLE "YouTubeResourceProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "isWatched" BOOLEAN NOT NULL DEFAULT false,
    "watchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouTubeResourceProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YouTubeResourceProgress_userId_idx" ON "YouTubeResourceProgress"("userId");

-- CreateIndex
CREATE INDEX "YouTubeResourceProgress_resourceId_idx" ON "YouTubeResourceProgress"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeResourceProgress_userId_resourceId_key" ON "YouTubeResourceProgress"("userId", "resourceId");

-- AddForeignKey
ALTER TABLE "YouTubeResourceProgress" ADD CONSTRAINT "YouTubeResourceProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeResourceProgress" ADD CONSTRAINT "YouTubeResourceProgress_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "YouTubeResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
