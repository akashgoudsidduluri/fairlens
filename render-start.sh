#!/usr/bin/env bash
set -e

echo "==> FairLens India Production Boot Sequence"

# Cleanup background jobs on exit
trap 'kill $(jobs -p) 2>/dev/null || true' EXIT

# 1. Start Sandbox Bank Models (Port 8010)
echo "==> [1/3] Starting Sandbox Target API on 127.0.0.1:8010..."
python -m sandbox.serve --host 127.0.0.1 --port 8010 &

# 2. Start Real UCI Datasets API (Port 8030)
echo "==> [2/3] Starting Real UCI Models API on 127.0.0.1:8030..."
python -m targets.real.serve --host 127.0.0.1 --port 8030 &

# 3. Start Public Audit Service on $PORT
PORT="${PORT:-8020}"
echo "==> [3/3] Starting Public Audit Coordinator on 0.0.0.0:${PORT}..."
exec python -m api.serve
