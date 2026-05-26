#!/usr/bin/env bash

set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

cert="$root/localhost+2.pem"
key="$root/localhost+2-key.pem"

if [[ ! -f "$cert" || ! -f "$key" ]]; then
  echo "Missing mkcert files: localhost+2.pem and localhost+2-key.pem" >&2
  echo "Generate them with: mkcert localhost 127.0.0.1 ::1" >&2
  exit 1
fi

export NITRO_SSL_CERT="$(cat "$cert")"
export NITRO_SSL_KEY="$(cat "$key")"

exec nuxt preview "$@"
