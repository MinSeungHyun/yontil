#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

corepack pnpm exec rimraf dist
corepack pnpm exec webpack --config webpack/webpack.prod.js

cp public/manifest.firefox.json dist/manifest.json

VERSION="$(node -p "require('./dist/manifest.json').version")"
XPI_NAME="yontil-firefox-${VERSION}.xpi"

rm -f "$XPI_NAME"
(cd dist && zip -qr "../$XPI_NAME" . -x "*.DS_Store")

echo "$XPI_NAME"
