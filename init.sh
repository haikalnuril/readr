#!/usr/bin/env bash
set -e

echo "=== FileReader App — Init ==="

# 1. Install dependencies
echo "→ Installing dependencies..."
npm install

# 2. Cek environment
echo "→ Checking environment..."
if [ ! -f .env.local ]; then
  if [ -f .env.example ]; then
    echo "  .env.local tidak ada — menyalin dari .env.example"
    cp .env.example .env.local
  fi
fi

# 3. Typecheck
echo "→ Running typecheck..."
npm run typecheck

# 4. Lint
echo "→ Running lint..."
npm run lint

# 5. Test
echo "→ Running tests..."
npm run test

echo ""
echo "Init selesai. Environment sehat."
echo "Baca claude-progress.md untuk status sesi terakhir."
echo "Baca feature_list.json untuk fitur yang belum selesai."
echo ""
