#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
mkdir -p assets/fonts
# Use Fontsource's versioned CDN, with its published npm package as fallback.
primary="https://cdn.jsdelivr.net/fontsource/fonts/ubuntu@5.3.0"
fallback="https://cdn.jsdelivr.net/npm/@fontsource/ubuntu@5.3.0/files"
for name in \
  ubuntu-latin-400-normal.woff2 \
  ubuntu-latin-400-italic.woff2 \
  ubuntu-latin-500-normal.woff2 \
  ubuntu-latin-500-italic.woff2 \
  ubuntu-latin-700-normal.woff2; do
  short_name="${name#ubuntu-}"
  if ! curl --fail --location --silent --show-error --retry 3 --retry-delay 2 \
    "${primary}/${short_name}" --output "assets/fonts/${name}"; then
    curl --fail --location --silent --show-error --retry 3 --retry-delay 2 \
      "${fallback}/${name}" --output "assets/fonts/${name}"
  fi
  # Verify genuine WOFF2 magic, not a CDN error page.
  if [[ "$(head -c 4 "assets/fonts/${name}")" != "wOF2" ]]; then
    echo "Invalid font asset: ${name}" >&2
    exit 1
  fi
done
# Keep the Ubuntu Font Licence alongside the publicly served font files.
curl --fail --location --silent --show-error --retry 3 --retry-delay 2 \
  "https://cdn.jsdelivr.net/npm/@fontsource/ubuntu@5.3.0/LICENSE" \
  --output assets/fonts/UBUNTU-FONT-LICENSE.txt
printf 'Ubuntu font assets successfully fetched for self-hosting.\n'
