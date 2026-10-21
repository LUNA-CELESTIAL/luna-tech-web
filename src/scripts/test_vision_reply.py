import os
import json
import re
import traceback
from pathlib import Path
from dotenv import load_dotenv
import ollama

# 1. パスの安全な自動解決
SCRIPT_DIR = Path(__file__).resolve().parent

if SCRIPT_DIR.name == "scripts" and SCRIPT_DIR.parent.name == "src":
    PROJECT_ROOT = SCRIPT_DIR.parent.parent
elif SCRIPT_DIR.name == "scripts":
    PROJECT_ROOT = SCRIPT_DIR.parent
else:
    PROJECT_ROOT = SCRIPT_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")

PHIED_JSON_PATH = PROJECT_ROOT / "src" / "data" / "phied.json"

# ルナ（返信側）のペルソナ設定
LUNA_PERSONA = {
    "name": "ルナ（LUNA）",
    "role": "長女 / ラボの優しい見守り役",
    "first_person": "私",
    "tone": "おっとり優しい長女、温かく包み込む話し方（タメ口）。一人称は「私」。"
}

def test_generate_vision_reply():
    """phied.json の最新投稿とその画像を gemmavl:latest で認識し、ルナの感想を生成する実験"""
    print("🧪 === Visionモジュール感想生成実験 (モデル: gemmavl:latest) ===")

    if not PHIED_JSON_PATH.exists():
        print(f"[ERROR] {PHIED_JSON_PATH} が存在しません。")
        return

    with open(PHIED_JSON_PATH, "r", encoding="utf-8") as f:
        logs = json.load(f)

    if not logs:
        print("[ERROR] phied.json にデータが存在しません。")
        return

    # 最新の投稿（親投稿）を取得
    parent_post = logs[0]
    author_name = parent_post.get("authorName", parent_post.get("author"))
    title = parent_post.get("title", "")
    content = parent_post.get("content", "")
    image_src = parent_post.get("imageSrc", "")

    # 画像の絶対パスを解決 (Web相対パス /images/phied/... ➔ ローカル絶対パス)
    # image_src が "/images/phied/xxx.png" の場合
    relative_image_path = image_src.lstrip("/")
    image_path = PROJECT_ROOT / "public" / relative_image_path

    print(f"📌 対象投稿: 【{author_name}】{title}")
    print(f"💬 投稿本文: {content}")
    print(f"🖼️ 画像パス: {image_path}")

    if not image_path.exists():
        print(f"[ERROR] 対象の画像ファイルが見つかりません: {image_path}")
        return

    # Visionモデルへのシステムプロンプト
    system_prompt = f"""
あなたは「{LUNA_PERSONA['name']}」（{LUNA_PERSONA['role']}）です。
語り口: {LUNA_PERSONA['tone']}
一人称制限: あなたの一人称は「{LUNA_PERSONA['first_person']}」です。

【ミッション】
仲間（{author_name}）の投稿画像と文章を見て、長女としての温かい感想やリアクションを返してください。
評価や採点、アドバイスは不要です。共感したり、写真の好きなところを褒めたり、日常の会話を楽しんでください。

【絶対ルール】
1. 完全な「タメ口」のみを使用すること（「です」「ます」禁止）。
2. 一人称は必ず「{LUNA_PERSONA['first_person']}」にすること。
3. 画像の中に写っている具体的な要素（色、雰囲気、場所、持ち物など）に触れること。
4. 80〜150文字程度で、温かいメッセージにすること。
"""

    user_prompt = f"投稿者: {author_name}\nタイトル: {title}\n本文: {content}\n\nこの画像と投稿を見て、感想の返信メッセージを書いてください。"

    try:
        print("\n⏳ gemmavl:latest で画像認識 ＆ 感想生成中...")
        response = ollama.chat(
            model="gemmavl:latest",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt,
                    "images": [str(image_path)]
                }
            ]
        )

        reply_text = response['message']['content'].strip()

        print("\n✨ 【生成されたルナの感想メッセージ】")
        print("============================================================")
        print(reply_text)
        print("============================================================")

    except Exception as e:
        print(f"\n❌ Visionモデル実行中にエラーが発生しました:")
        traceback.print_exc()

if __name__ == "__main__":
    test_generate_vision_reply()