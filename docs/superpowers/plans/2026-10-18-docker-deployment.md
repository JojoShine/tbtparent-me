# Docker deployment implementation plan

**Goal:** Adopt JojoShine/deploy-standards/DEPLOYMENT.md for tbtparent-me without changing the running production deployment.

**Architecture:** One non-root Node 22 runtime image contains the Next.js standalone server, locked production dependencies, Prisma migration history, and explicit migration/bootstrap tools. Production Compose uses an external PostgreSQL and MinIO, and host Nginx proxies the root site. CI validates an isolated database and promotes the tested image digest on release.

**Constraints:** Business `tbtparent-me`; image `ghcr.io/jojoshine/tbtparent-me`; root BASE_PATH only; candidate host port 31000 (verify availability before cutover); app listens on 0.0.0.0:8080. Production secrets never enter build context. Existing port 5001 and Nginx are changed only during a separately performed server cutover. No automatic schema/data writes on application start.

## Tasks and checks

- [x] Runtime and database lifecycle: add /healthz (503 on DB failure), explicit bin/healthcheck, bin/migrate and bin/bootstrap; bootstrap creates missing Home/About singleton records and never updates existing data. Add the missing initial schema baseline before existing incremental migrations, document existing-database reconciliation. Verify health success/failure tests, repeat migrations/bootstrap in isolated PostgreSQL, and schema diff.
- [x] Container and production configuration: add Dockerfile/runtime, .dockerignore, compose.prod.yaml, .env.prod.example, root-site Nginx snippet; move database reads from build to request time. Replace old packaging entry with Docker workflow guidance and retain PM2 configuration only for rollback reference. Verify Compose rendering, non-root image build with no database credentials, app startup/health and unhealthy DB failure.
- [x] CI/release and operations: pin official actions, verify the single image before main publish, preserve full-SHA candidate tags, promote same digest for semver releases on main after CI success. Attach version-matched deployment assets. Document backup, migration, bootstrap, cutover, rollback, roles, logs and visibility. Verify workflow syntax, release validation behavior, shell scripts, full test suite and independent code review.

## Review focus

- Empty databases must replay the entire migration history; existing databases must not recreate tables or overwrite content.
- No environment files or production credentials in images/builds; app credentials and migration credentials remain separate.
- Release uses the successful main CI candidate digest without rebuilding or overwriting tags.
- Migration/bootstrap failures must stop deployment; DB outage must make health fail.
- Root Nginx snippet must preserve other applications such as /surveys and must not duplicate an existing location /.

## Verification results

- Runtime Docker image built successfully without a real DATABASE_URL or environment files.
- Disposable PostgreSQL replayed all six migrations; second migration run had no pending work; schema diff reported no difference.
- Bootstrap ran twice and preserved owner-edited Home content. Non-root application with a DML-only database role served / and /projects; health failed when PostgreSQL stopped.
- Node 22 full suite: 94/94 passed. Relevant ESLint: no errors. Shell syntax, Compose config and Actionlint workflow checks passed.
- Independent review identified registry lookup error handling and interrupted publication recovery. Both fixed; release tests cover lookup errors and same-digest recovery, candidate tests cover original-image revalidation without tag overwrite.
- Existing production database, PM2 and host Nginx were not modified. First cutover requires the documented database baseline reconciliation and port availability check.
