# Project Covers in MinIO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store every project cover in MinIO, render covers from database metadata, let administrators upload, replace, preview, or clear a cover, and add a software-plus-hardware project category for AroundMe.

**Architecture:** Add nullable cover URL and intrinsic dimension fields to `Project`. A protected project-cover upload endpoint writes images beneath `projects/covers/` in the existing MinIO bucket and returns the public proxy URL; project create/update persists that metadata. The public list consumes only database fields, with no name-to-file mapping.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 6, PostgreSQL, MinIO, Node test runner.

**Spec:** User-approved design in the current thread: covers live in MinIO, frontend reads them, admin can maintain them, hardcoded mappings are removed.

## Global Constraints

- Preserve source image aspect ratios without cropping or black bars.
- Keep the homepage unchanged.
- Reuse the existing authenticated MinIO and admin API patterns.
- Do not restore any frontend filtering for `custom_app`.
- Use the persisted project type key `integrated`, displayed as `软硬一体` in Chinese and `Integrated System` in English.
- Existing project data and unrelated dirty-worktree changes must be preserved.

## Review Focus

- A project with a URL but missing or invalid dimensions must fall back safely instead of causing layout shift.
- Uploads must reject non-image MIME types and missing files before contacting MinIO.
- Project POST and PUT must preserve the three cover fields and normalize numeric dimensions.
- Clearing a cover in the admin must persist null cover metadata and remove the preview.
- Migrating covers must match projects by both Chinese and English names and must not create project records.

---

### Task 1: Project cover data contract

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260919000000_add_project_covers/migration.sql`
- Modify: `src/app/api/projects/route.js`
- Modify: `src/lib/project-data.js`
- Modify: `src/lib/project-showcase.js`
- Test: `test/project-showcase.test.js`
- Test: `test/projects-route.test.js`

**Interfaces:**
- Produces: `Project.cover_url: string | null`, `cover_width: number | null`, `cover_height: number | null`.
- Produces: `getProjectCover(project)` returning `{ src, width, height } | null` from database metadata only.

- [ ] **Step 1: Write failing tests**

```js
assert.deepEqual(getProjectCover({ cover_url: '/api/archive/files?path=x', cover_width: 1536, cover_height: 1024 }), {
  src: '/api/archive/files?path=x', width: 1536, height: 1024,
})
assert.equal(getProjectCover({ name_zh: 'AroundMe' }), null)
```

Add a project route test whose POST body contains the three cover fields and assert the Prisma create payload preserves them as `string`, `number`, and `number`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- --test-name-pattern='project covers read|project API preserves cover'`

Expected: failure because the helper still uses hardcoded names and the API drops cover fields.

- [ ] **Step 3: Implement the minimal data contract**

Add nullable Prisma fields and SQL columns, include them in API field picking and cached project selection, and replace `PROJECT_COVERS` with validated database metadata.

- [ ] **Step 4: Regenerate Prisma and verify GREEN**

Run: `npx prisma generate && npm test -- --test-name-pattern='project covers read|project API preserves cover'`

Expected: focused tests pass.

### Task 2: Authenticated MinIO cover upload

**Files:**
- Create: `src/app/api/projects/cover/route.js`
- Test: `test/project-cover-route.test.js`

**Interfaces:**
- Consumes: existing `ensureBucket`, `minioClient`, `MINIO_BUCKET`, and `withAuth`.
- Produces: `POST /api/projects/cover` returning `{ cover_url }`, where the URL uses `/api/archive/files?path=`.

- [ ] **Step 1: Write failing upload route tests**

Test authenticated requests for a missing file, a `text/plain` file, and a PNG. The successful test must assert the object path starts with `projects/covers/`, preserves an image extension, and returns an encoded public proxy URL.

- [ ] **Step 2: Run the route tests and verify RED**

Run: `npm test -- --test-name-pattern='project cover upload'`

Expected: import failure because the route does not exist.

- [ ] **Step 3: Implement the route**

Accept only `image/jpeg`, `image/png`, `image/webp`, and `image/gif`, sanitize the basename, upload with the original MIME type, and return the proxy URL. Keep object deletion out of scope because replacing an association must not accidentally delete an object still referenced by another record.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- --test-name-pattern='project cover upload'`

Expected: all upload tests pass.

### Task 3: Admin cover maintenance and public rendering

**Files:**
- Modify: `src/app/admin/projects/page.js`
- Modify: `src/components/projects/ProjectsClient.jsx`
- Modify: `prisma/around-me-data.js`
- Modify: `test/project-showcase.test.js`

**Interfaces:**
- Consumes: upload response `cover_url` and browser-derived `cover_width` / `cover_height`.
- Consumes: `getProjectCover(project)` from Task 1.

- [ ] **Step 1: Add a failing behavior test for incomplete dimensions**

```js
assert.equal(getProjectCover({ cover_url: '/cover.png', cover_width: 0, cover_height: 1024 }), null)
assert.deepEqual(filterProjectCatalog([
  { id: 12, project_type: 'integrated', name_zh: 'AroundMe', name_en: 'AroundMe', tags_zh: [], tags_en: [] },
], { projectType: 'integrated' }).map(project => project.id), [12])
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- --test-name-pattern='project cover metadata requires'`

Expected: failure until numeric validation exists.

- [ ] **Step 3: Implement admin maintenance**

Add `cover_url`, `cover_width`, and `cover_height` to `emptyProject`. On file selection, derive intrinsic dimensions with `createImageBitmap(file)`, upload using the bearer token, and set all three fields. Render a ratio-preserving preview plus Replace and Clear controls. Clear sets all three fields to null. Keep the public `<Image>` rendering based solely on `getProjectCover`. Add `integrated` to the public type label/icon/filter and admin type options, and change AroundMe's persisted `project_type` to `integrated`.

- [ ] **Step 4: Verify focused and full tests**

Run: `npm test`

Expected: the full suite passes.

### Task 4: Upload and backfill the existing covers

**Files:**
- Create: `prisma/sync-project-covers.js`
- Modify: `package.json`
- Delete after successful migration: `public/images/projects/covers/*.png`

**Interfaces:**
- Consumes: existing local cover assets and Prisma `Project` rows.
- Produces: MinIO objects under `projects/covers/` and database cover metadata for AroundMe, DataMesh, FlowCraft, Owl, app-portfolio, PasswordManager, and ant-eyes.

- [ ] **Step 1: Implement an idempotent migration script**

Define a literal manifest containing each project alias, local source file, width, and height. Upload each object to a stable `projects/covers/<filename>` key, then update only the matched project row. Fail if a required project or file is missing.

- [ ] **Step 2: Apply the schema migration and run the backfill**

Run: `npx prisma migrate deploy && npm run db:sync-project-covers`

Expected: seven covers uploaded and seven project rows updated.

- [ ] **Step 3: Verify database and public API results**

Query projects and assert all seven have a MinIO proxy URL with positive dimensions, AroundMe is first with `project_type = 'integrated'`, and `custom_app` is absent.

- [ ] **Step 4: Remove local cover assets and verify production build**

Run: `npm test && npm run build`

Expected: tests pass and the production build exits 0. Existing unrelated lint failures are reported but not changed.

## Self-review

- Spec coverage: database storage, MinIO upload, public rendering, admin maintenance, migration, and hardcoded mapping removal are covered.
- Placeholder scan: no deferred implementation placeholders remain.
- Type consistency: the same `cover_url`, `cover_width`, and `cover_height` names are used across Prisma, API, admin, and rendering.
- Review focus: every listed input class is covered by a task-level check or explicit migration verification.
