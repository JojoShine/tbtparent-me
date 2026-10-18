#!/bin/sh
# Local image verification only. Production builds/releases are handled by GitHub Actions.
set -eu
cd "$(dirname "$0")/.."
exec docker build --target runtime -t tbtparent-me:local .
