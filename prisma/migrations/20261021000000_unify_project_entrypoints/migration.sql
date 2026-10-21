ALTER TABLE "Project" ADD COLUMN "mobile_url" TEXT;
ALTER TABLE "Project" ADD COLUMN "pc_url" TEXT;

UPDATE "Project"
SET "mobile_url" = CASE WHEN "project_type" = 'mobile'
      THEN COALESCE(NULLIF(NULLIF(BTRIM("demo_url"), ''), '#'), NULLIF(NULLIF(BTRIM("link"), ''), '#')) END,
    "pc_url" = COALESCE(
      NULLIF(NULLIF(BTRIM("console_url"), ''), '#'),
      CASE WHEN "project_type" <> 'mobile'
        THEN COALESCE(NULLIF(NULLIF(BTRIM("demo_url"), ''), '#'), NULLIF(NULLIF(BTRIM("link"), ''), '#')) END
    );
