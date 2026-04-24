#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FIREBASE_BIN="${ROOT_DIR}/node_modules/.bin/firebase"
PROJECT_ID="tomoshibi-950e2"
EXPORT_DIR="${ROOT_DIR}/.firebase/emulator-data"
AUTOSAVE_INTERVAL_SEC="${EMULATOR_AUTOSAVE_INTERVAL_SEC:-20}"

if [[ ! -x "${FIREBASE_BIN}" ]]; then
  echo "firebase binary not found: ${FIREBASE_BIN}" >&2
  exit 1
fi

export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export PATH="/opt/homebrew/opt/openjdk@21/bin:${PATH}"

autosave_loop() {
  while true; do
    sleep "${AUTOSAVE_INTERVAL_SEC}"
    "${FIREBASE_BIN}" emulators:export "${EXPORT_DIR}" \
      --project "${PROJECT_ID}" \
      --config "${ROOT_DIR}/firebase.json" \
      --force >/dev/null 2>&1 || true
  done
}

AUTOSAVE_PID=""
cleanup() {
  if [[ -n "${AUTOSAVE_PID}" ]]; then
    kill "${AUTOSAVE_PID}" >/dev/null 2>&1 || true
    wait "${AUTOSAVE_PID}" 2>/dev/null || true
  fi
  "${FIREBASE_BIN}" emulators:export "${EXPORT_DIR}" \
    --project "${PROJECT_ID}" \
    --config "${ROOT_DIR}/firebase.json" \
    --force >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

autosave_loop &
AUTOSAVE_PID="$!"

echo "Starting emulators with autosave every ${AUTOSAVE_INTERVAL_SEC}s ..."
"${FIREBASE_BIN}" emulators:start \
  --project "${PROJECT_ID}" \
  --only firestore,functions,storage \
  --config "${ROOT_DIR}/firebase.json" \
  --import="${EXPORT_DIR}" \
  --export-on-exit="${EXPORT_DIR}"
