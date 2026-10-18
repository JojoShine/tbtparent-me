ALTER TABLE "Project" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'completed';
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'planning';
UPDATE "Project" SET "status" = 'in_progress' WHERE lower("name_en") = 'datamesh';
UPDATE "Project" SET "status" = 'planning' WHERE lower(replace("name_en", ' ', '')) = 'aroundme';
