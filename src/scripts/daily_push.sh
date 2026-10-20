#!/bin/bash

# PATHの明示的指定（cron対策）
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

# プロジェクトルートへ移動
PROJECT_DIR="/home/lulu/luna/luna_docker/luna-tech-web"
cd "$PROJECT_DIR" || exit 1

# ログディレクトリの作成
mkdir -p "$PROJECT_DIR/src/scripts/logs"

# 変更があればコミットして Push（画像も含めるため add . に変更）
if [ -n "$(git status --porcelain)" ]; then
    NOW=$(date +"%Y-%m-%d %H:%M")
    git add .
    git commit -m "auto: daily phied update ($NOW)" >> "$PROJECT_DIR/src/scripts/logs/cron.log" 2>&1
    git push origin main >> "$PROJECT_DIR/src/scripts/logs/cron.log" 2>&1
    echo "[$NOW] Successfully pushed to origin main" >> "$PROJECT_DIR/src/scripts/logs/cron.log"
else
    NOW=$(date +"%Y-%m-%d %H:%M")
    echo "[$NOW] No changes detected. Skip commit." >> "$PROJECT_DIR/src/scripts/logs/cron.log"
fi
