#!/usr/bin/env bash
set -euo pipefail
commit=${COMMIT_SHA:?COMMIT_SHA is required}
[[ "$commit" =~ ^[a-f0-9]{40}$ ]] || exit 1
image=ghcr.io/jojoshine/tbtparent-me
candidate="$image:sha-$commit"
if digest=$(bash deploy/image-digest.sh "$candidate"); then
  # Recover an interrupted publication by re-verifying the original image, never replacing it.
  docker pull "$image@$digest"
  revision=$(docker image inspect "$image@$digest" --format '{{index .Config.Labels "org.opencontainers.image.revision"}}')
  source=$(docker image inspect "$image@$digest" --format '{{index .Config.Labels "org.opencontainers.image.source"}}')
  test "$revision" = "$commit"
  test "$source" = https://github.com/JojoShine/tbtparent-me
  bash deploy/verify-image.sh "$image@$digest"
else
  status=$?
  test "$status" -eq 3 || exit "$status"
  gzip -dc /tmp/verified-image.tar.gz | docker load
  docker tag tbtparent-me:verified "$candidate"
  docker push "$candidate"
  digest=$(bash deploy/image-digest.sh "$candidate")
fi
printf 'Commit: %s\nImage: %s@%s\n' "$commit" "$image" "$digest" | tee -a "${GITHUB_STEP_SUMMARY:-/dev/stdout}"
