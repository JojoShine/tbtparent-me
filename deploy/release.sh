#!/usr/bin/env bash
# Promote a tested main candidate without rebuilding it. Run only from release.yml.
set -euo pipefail
version=${RELEASE_TAG:?RELEASE_TAG is required}
commit=${RELEASE_SHA:?RELEASE_SHA is required}
repository=${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}
[[ "$version" =~ ^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]] || { echo 'Expected vX.Y.Z' >&2; exit 1; }
[[ "$commit" =~ ^[a-f0-9]{40}$ ]] || { echo 'Expected full commit SHA' >&2; exit 1; }
test "$repository" = JojoShine/tbtparent-me
test "$(git rev-parse "$version^{commit}")" = "$commit"
git merge-base --is-ancestor "$commit" origin/main
passed=$(gh run list --repo "$repository" --workflow ci.yml --commit "$commit" --event push --limit 100 \
  --json headBranch,headSha,status,conclusion \
  --jq '[.[] | select(.headBranch == "main" and .status == "completed" and .conclusion == "success")] | length')
test "$passed" -gt 0 || { echo 'No successful main CI for this commit' >&2; exit 1; }
image=ghcr.io/jojoshine/tbtparent-me
candidate="$image:sha-$commit"
if gh release view "$version" --repo "$repository" >/dev/null 2>&1; then
  echo 'Release already exists; refusing to replace assets' >&2; exit 1
fi
digest=$(bash deploy/image-digest.sh "$candidate")
if version_digest=$(bash deploy/image-digest.sh "$image:$version"); then
  test "$version_digest" = "$digest" || { echo 'Version exists with a different digest' >&2; exit 1; }
else
  status=$?
  test "$status" -eq 3 || exit "$status"
  docker buildx imagetools create --prefer-index=false --tag "$image:$version" "$image@$digest"
  version_digest=$(bash deploy/image-digest.sh "$image:$version")
  test "$version_digest" = "$digest"
fi
assets=$(mktemp -d)
trap 'rm -rf "$assets"' EXIT
cp compose.prod.yaml "$assets/compose.prod.yaml"
cp .env.prod.example "$assets/.env.prod.example"
cp nginx/business.conf.example "$assets/business.conf.example"
cp DEPLOYMENT.md "$assets/DEPLOYMENT.md"
sed "s|^APP_IMAGE=.*|APP_IMAGE=$image@$digest|" .env.prod.example > "$assets/.env.prod.example"
printf 'Version: %s\nCommit: %s\nImage: %s@%s\nPlatform: linux/amd64\n' "$version" "$commit" "$image" "$digest" > "$assets/version.txt"
gh release create "$version" --repo "$repository" --verify-tag --title "$version" \
  --notes-file "$assets/version.txt" \
  "$assets/compose.prod.yaml" "$assets/.env.prod.example" "$assets/business.conf.example" \
  "$assets/DEPLOYMENT.md" "$assets/version.txt"
