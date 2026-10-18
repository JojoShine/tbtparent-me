ALTER TABLE "Project" ADD COLUMN "is_open_source" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Project" SET "is_open_source" = true WHERE btrim("github") ~* '^https?://';
