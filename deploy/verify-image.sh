#!/usr/bin/env bash
# Exercise the exact runtime image against a disposable PostgreSQL, never .env/production.
set -euo pipefail
image=${1:?Usage: verify-image.sh IMAGE}
run_id="tbtparent-verify-${RANDOM}-$$"
network="$run_id"
database="${run_id}-db"
app="${run_id}-app"
cleanup() {
  result=$?
  if [ "$result" -ne 0 ]; then docker logs "$app" 2>/dev/null || true; fi
  docker rm -f "$app" "$database" >/dev/null 2>&1 || true
  docker network rm "$network" >/dev/null 2>&1 || true
  exit "$result"
}
trap cleanup EXIT
docker network create "$network" >/dev/null
docker run -d --name "$database" --network "$network" \
  -e POSTGRES_USER=migration -e POSTGRES_PASSWORD=isolated-test-password -e POSTGRES_DB=tbtparent \
  postgres:17-bookworm@sha256:639ab7ceb90e13123085b741fb31ef493fba25463002f6da665352e7b534b652 >/dev/null
for attempt in $(seq 1 60); do
  if docker exec "$database" pg_isready -U migration -d tbtparent >/dev/null 2>&1; then break; fi
  sleep 1
done
db_url="postgresql://migration:isolated-test-password@${database}:5432/tbtparent?schema=public&connect_timeout=2&pool_timeout=2"
run_task() {
  docker run --rm --network "$network" --no-healthcheck -e DATABASE_URL="$db_url" "$image" "$@"
}
run_task /app/bin/migrate
run_task /app/bin/migrate
run_task /app/bin/bootstrap
docker exec "$database" psql -U migration -d tbtparent -v ON_ERROR_STOP=1 -c 'UPDATE "Home" SET bio_zh = '\''existing-owner-content'\'' WHERE id = 1;' >/dev/null
run_task /app/bin/bootstrap
home_state=$(docker exec "$database" psql -U migration -d tbtparent -Atc 'SELECT count(*) || '\'':'\'' || min(bio_zh) FROM "Home";')
test "$home_state" = '1:existing-owner-content'
run_task node node_modules/prisma/build/index.js migrate diff --from-url "$db_url" --to-schema-datamodel prisma/schema.prisma --exit-code
# The web process uses a DML-only role, separate from the migration role.
docker exec -i "$database" psql -U migration -d tbtparent -v ON_ERROR_STOP=1 <<'SQL'
CREATE ROLE app_runtime LOGIN PASSWORD 'isolated-app-password';
GRANT CONNECT ON DATABASE tbtparent TO app_runtime;
GRANT USAGE ON SCHEMA public TO app_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_runtime;
SQL
if docker exec -e PGPASSWORD=isolated-app-password "$database" psql -h 127.0.0.1 -U app_runtime -d tbtparent -v ON_ERROR_STOP=1 -c 'CREATE TABLE forbidden_ddl(id int);' >/dev/null 2>&1; then
  echo 'Runtime role unexpectedly has DDL permission' >&2; exit 1
fi
runtime_url="postgresql://app_runtime:isolated-app-password@${database}:5432/tbtparent?schema=public&connect_timeout=2&pool_timeout=2"
docker run -d --name "$app" --network "$network" \
  -e DATABASE_URL="$runtime_url" -e ADMIN_SECRET=isolated-admin-secret \
  -e MINIO_ENDPOINT=minio.invalid -e MINIO_ACCESS_KEY=isolated -e MINIO_SECRET_KEY=isolated \
  "$image" >/dev/null
test "$(docker exec "$app" id -u)" != 0
for attempt in $(seq 1 60); do
  if docker exec "$app" /app/bin/healthcheck; then break; fi
  sleep 1
done
docker exec "$app" /app/bin/healthcheck
docker exec "$app" node --input-type=module -e 'for (const path of ["/", "/projects"]) { const r = await fetch(`http://127.0.0.1:8080${path}`); if (!r.ok) throw new Error(`${path}: ${r.status}`); }'
# Runtime must not contain any copied environment files.
docker exec "$app" node --input-type=module -e 'import { readdirSync } from "node:fs"; if (readdirSync("/app").some(name => /^\.env(?:\.|$)/.test(name))) process.exit(1);'
docker stop "$database" >/dev/null
if docker exec "$app" /app/bin/healthcheck; then
  echo 'Healthcheck incorrectly succeeded without its database' >&2; exit 1
fi
echo 'Image verified: migrations, schema, repeat-safe bootstrap, DML-only app, pages, and database-aware health.'
