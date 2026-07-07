#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")"
MSG="${1:-update: $(date '+%Y-%m-%d %H:%M')}"
git add -A
git commit -m "$MSG" || echo "Tidak ada perubahan untuk di-commit."
git push origin main
echo "Selesai push ke GitHub."
