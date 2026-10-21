import os
import time
import json
import random
import traceback
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# 1. パスの安全な自動解決
SCRIPT_DIR = Path(__file__).resolve().parent

if SCRIPT_DIR.name == "scripts" and SCRIPT_DIR.parent.name == "src":
    PROJECT_ROOT = SCRIPT_DIR.parent.parent
elif SCRIPT_DIR.name == "scripts":
    PROJECT_ROOT = SCRIPT_DIR.parent
else:
    PROJECT_ROOT = SCRIPT_DIR.parent

# .env の安全な読み込み
load_dotenv(PROJECT_ROOT / ".env")

PHIED_JSON_PATH = Path(os.getenv("PHIED_JSON_PATH", PROJECT_ROOT / "src" / "data" / "phied.json"))

# generate_reply から必要な関数と定数のみを安全にインポート
from generate_reply import (
    MEMBER_PERSONAS,
    decide_reply_pattern_with_clef,
    generate_reply_content_with_vision
)

def find_unreplied_posts() -> list[tuple[int, dict]]:
    """phied.json 内の未返信投稿を古い順（インデックス逆順）で全件抽出する"""
    if not PHIED_JSON_PATH.exists():
        print(f"[ERROR] phied.json が見つかりません: {PHIED_JSON_PATH}")
        return []

    try:
        with open(PHIED_JSON_PATH, "r", encoding="utf-8") as f:
            logs = json.load(f)

        unreplied = []
        # 配列の末尾（過去の投稿）から先頭（最新の投稿）に向かって走査
        for idx in range(len(logs) - 1, -1, -1):
            post = logs[idx]
            replies = post.get("replies", [])
            if not isinstance(replies, list) or len(replies) == 0:
                unreplied.append((idx, post))

        return unreplied

    except Exception as e:
        print(f"[ERROR] phied.json 解析失敗: {e}")
        traceback.print_exc()
        return []

def process_reply_for_specific_post(post_index: int):
    """指定されたインデックスの親投稿に対して自律リプを生成・追加保存する"""
    if not PHIED_JSON_PATH.exists():
        return

    with open(PHIED_JSON_PATH, "r", encoding="utf-8") as f:
        logs = json.load(f)

    if post_index >= len(logs):
        return

    target_post = logs[post_index]
    author_id = target_post.get("author", "")
    author_name = target_post.get("authorName", author_id)
    image_src = target_post.get("imageSrc", "")

    # 投稿者以外のメンバーから選出
    available_responders = [k for k in MEMBER_PERSONAS.keys() if k != author_id]
    if not available_responders:
        available_responders = list(MEMBER_PERSONAS.keys())
    
    responder_id = random.choice(available_responders)
    responder = MEMBER_PERSONAS[responder_id]

    print(f"\n📌 処理対象 [{post_index + 1}/{len(logs)}]: 【{author_name}】{target_post.get('title')}")
    print(f"💬 返信選出: {responder['name']} ({responder_id})")

    # 画像パス解決（PROJECT_ROOT を基準に安全構築）
    relative_image_path = image_src.lstrip("/")
    image_path = PROJECT_ROOT / "public" / relative_image_path

    # Step 1: clef-flash 演出判定
    pattern = decide_reply_pattern_with_clef(
        target_post.get("title", ""),
        target_post.get("content", ""),
        target_post.get("insights", "")
    )

    # Step 2: gemmavl 視覚＆文章生成
    reply_text, stamp = generate_reply_content_with_vision(
        responder, author_name, target_post, image_path, pattern
    )

    # Step 3: データ保存
    now = datetime.now()
    reply_entry = {
        "replyId": f"reply-{responder_id}-{now.strftime('%Y%m%d%H%M%S')}",
        "author": responder_id,
        "authorName": responder["name"],
        "pattern": pattern,
        "stamp": stamp,
        "content": reply_text,
        "timestamp": now.strftime("%Y.%m.%d %H:%M")
    }

    if "replies" not in target_post or not isinstance(target_post["replies"], list):
        target_post["replies"] = []

    target_post["replies"].append(reply_entry)
    logs[post_index] = target_post

    with open(PHIED_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)

    print(f"✨ リプ完了! [{pattern}] {responder['name']}: {reply_text[:40]}...")

def run_backtrack_relay(interval_seconds: int = 3):
    """過去の未返信投稿を全て遡ってリプを埋めていく巡回バッチ"""
    print("🚀 === 既存投稿・過去遡り自律リプ巡回バッチ開始 ===")

    unreplied_list = find_unreplied_posts()
    total_unreplied = len(unreplied_list)

    if total_unreplied == 0:
        print("🎉 未返信の投稿はありません！全ての投稿にリプがついています。")
        return

    print(f"🔍 未返信の投稿を {total_unreplied} 件検知しました。過去の投稿から順番に処理を開始します...\n")

    processed = 0
    for idx, post in unreplied_list:
        processed += 1
        print(f"🏃 【進捗: {processed}/{total_unreplied} 件目】")
        try:
            process_reply_for_specific_post(idx)
        except Exception as e:
            print(f"❌ インデックス {idx} の処理中にエラー発生: {e}")
            traceback.print_exc()

        if processed < total_unreplied:
            time.sleep(interval_seconds)

    print(f"\n🎉 === 全 {total_unreplied} 件の過去投稿への自律リプ完了 ===")

if __name__ == "__main__":
    run_backtrack_relay(interval_seconds=3)