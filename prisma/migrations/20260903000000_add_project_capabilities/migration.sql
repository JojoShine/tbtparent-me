CREATE TABLE "ProjectCapability" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "description_zh" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'circle',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectCapability_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectCapability_projectId_sortOrder_idx"
ON "ProjectCapability"("projectId", "sortOrder");

ALTER TABLE "ProjectCapability"
ADD CONSTRAINT "ProjectCapability_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
