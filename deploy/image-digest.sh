#!/usr/bin/env bash
# Exit 3 only for an explicitly missing manifest; transport/auth errors must stop publication.
set -euo pipefail
image=${1:?Usage: image-digest.sh IMAGE}
errors=$(mktemp)
trap 'rm -f "$errors"' EXIT
if manifest=$(docker buildx imagetools inspect "$image" --format '{{json .Manifest}}' 2>"$errors"); then
  printf '%s' "$manifest" | jq -er '.digest | select(test("^sha256:[a-f0-9]{64}$"))'
elif grep -Eiq 'manifest unknown|MANIFEST_UNKNOWN|: not found$|404 Not Found' "$errors"; then
  exit 3
else
  cat "$errors" >&2
  exit 1
fi
