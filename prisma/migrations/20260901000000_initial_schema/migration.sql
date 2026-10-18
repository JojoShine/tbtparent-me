-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Home" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name_zh" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "bio_zh" TEXT NOT NULL,
    "bio_en" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Home_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name_zh" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_zh" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "tags_zh" TEXT[],
    "tags_en" TEXT[],
    "deadline_zh" TEXT NOT NULL,
    "deadline_en" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "github" TEXT,
    "demo_url" TEXT,
    "project_type" TEXT NOT NULL DEFAULT 'pc',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content_en" TEXT,
    "content_zh" TEXT,
    "recent_focus" BOOLEAN NOT NULL DEFAULT false,
    "video_url" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" SERIAL NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt_zh" TEXT NOT NULL,
    "excerpt_en" TEXT NOT NULL,
    "content_zh" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "cover_image" TEXT,
    "published_at" TIMESTAMP(3),
    "tags_en" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags_zh" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogImage" (
    "id" SERIAL NOT NULL,
    "blogId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "About" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "bio_zh" TEXT NOT NULL,
    "bio_en" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "About_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechStack" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechStack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" SERIAL NOT NULL,
    "name_zh" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_zh" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveVideo" (
    "id" SERIAL NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "description_zh" TEXT,
    "description_en" TEXT,
    "cover_url" TEXT,
    "video_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ongoing',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchiveVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveNovel" (
    "id" SERIAL NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "description_zh" TEXT,
    "description_en" TEXT,
    "cover_url" TEXT,
    "external_link" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ongoing',

    CONSTRAINT "ArchiveNovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NovelChapter" (
    "id" SERIAL NOT NULL,
    "novelId" INTEGER NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "content_zh" TEXT NOT NULL,
    "content_en" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chapter_number" INTEGER NOT NULL,

    CONSTRAINT "NovelChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveInterview" (
    "id" SERIAL NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "summary_zh" TEXT,
    "summary_en" TEXT,
    "link" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cover_url" TEXT,

    CONSTRAINT "ArchiveInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveManga" (
    "id" SERIAL NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "description_zh" TEXT,
    "description_en" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ongoing',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchiveManga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MangaEpisode" (
    "id" SERIAL NOT NULL,
    "mangaId" INTEGER NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "cover_url" TEXT,
    "video_url" TEXT,
    "aspect_ratio" TEXT DEFAULT 'landscape',
    "episode_number" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MangaEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveHighlight" (
    "id" SERIAL NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "description_zh" TEXT,
    "description_en" TEXT,
    "cover_url" TEXT,
    "video_url" TEXT,
    "published_at" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchiveHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QA" (
    "id" SERIAL NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "tags_zh" TEXT[],
    "tags_en" TEXT[],
    "content_zh" TEXT NOT NULL,
    "content_en" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteVisit" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkProject" (
    "id" SERIAL NOT NULL,
    "name_zh" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "summary_zh" TEXT NOT NULL,
    "summary_en" TEXT NOT NULL,
    "font_size" TEXT NOT NULL DEFAULT 'medium',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" SERIAL NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "visit_dates" TEXT[],
    "first_visit_date" TEXT,
    "last_visit_date" TEXT,
    "total_visits" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteVisit_date_key" ON "SiteVisit"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_visitor_id_key" ON "Visitor"("visitor_id");

-- AddForeignKey
ALTER TABLE "BlogImage" ADD CONSTRAINT "BlogImage_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NovelChapter" ADD CONSTRAINT "NovelChapter_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "ArchiveNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaEpisode" ADD CONSTRAINT "MangaEpisode_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "ArchiveManga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

