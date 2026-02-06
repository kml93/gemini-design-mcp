#!/bin/bash
cd "$(dirname "$0")"
if [ ! -d "node_modules" ]; then
  bun install --silent
fi
exec bun build/index.js
