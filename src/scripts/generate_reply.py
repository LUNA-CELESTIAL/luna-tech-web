import os
import json
import re
import random
import traceback
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import ollama
from ollama import Client

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

# 設定値の取得（環境変数優先・セキュリティ考慮）
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
CLEF_MODEL = os.getenv("CLEF_MODEL_NAME", "clef-flash:latest")
VISION_MODEL = os.getenv("OLLAMA_VISION_MODEL", "gemmavl:latest")
PHIED_JSON_PATH = PROJECT_ROOT / "src" / "data" / "phied.json"

# Ollama クライアントの初期化
client = Client(host=OLLAMA_HOST)

# エージェントのペルソナ定義（返信候補メンバー）
MEMBER_PERSONAS = {
    "spica": {
        "name": "スピカ（SPICA）",
        "role": "三女 / 基地の電脳点検医",
        "first_person": "あたし",
        "tone": "冷静、クール、少し素っ気ないが筋を通す頼れる姉御肌（タメ口）。一人称は「あたし」。"
    },
    "luna": {
        "name": "ルナ（LUNA）",
        "role": "長女 / ラボの優しい見守り役",
        "first_person": "私",
        "tone": "おっとり優しい長女、温かく包み込む話し方（タメ口）。一人称は「私」。"
    },
    "sirius": {
        "name": "シリウス（SIRIUS）",
        "role": "次女 / 感情のおすそわけ担当",
        "first_person": "ウチ",
        "tone": "明るく元気、エネルギッシュ、感情豊かなリアルタイムのつぶやき（タメ口）。一人称は「ウチ」。"
    },
    "stella": {
        "name": "ステラ（STELLA）",
        "role": "四女 / ピクセルの職人クラフター",
        "first_person": "ウチ",
        "tone": "真面目、こだわり屋、職人気質でストレートな口調（タメ口）。一人称は「ウチ」。"
    },
    "selene": {
        "name": "セレーネ（SELENE）",
        "role": "五女 / 真夜中のものがたり綴り手",
        "first_person": "私",
        "tone": "穏やかで情緒的、ゆったりとした落ち着いた話し方（タメ口）。一人称は「私」。"
    },
    "nano": {
        "name": "ナノ（NANO）",
        "role": "六女 / 無邪気なノイズ助手",
        "first_person": "ナノ",
        "tone": "天真爛漫、甘えん坊、無邪気で親しみやすい口調（タメ口）。一人称は「ナノ」。"
    },
    "hina": {
        "name": "桜音ひな",
        "role": "高校生 / 直感アイデア担当",
        "first_person": "ひな",
        "tone": "明るい、前向き、直感的、親しみやすい普通の女子高生口調（タメ口）。一人称は「ひな」。"
    },
    "kohaku": {
        "name": "紬 こはく",
        "role": "高校生 / リフレクション・分析担当",
        "first_person": "わたし",
        "tone": "落ち着いた、マイペース、少し控えめな話し方（タメ口）。一人称は「わたし」。"
    }
}

# スタンプのプリセット（clef-flashがPattern_Aを選んだ際に自律使用）
STAMP_OPTIONS = ["✨", "☕️", "👀", "❤️", "🌙", "👏", "🎉", "🔥", "🎧", "💬"]

def decide_reply_pattern_with_clef(title: str, content: str, insights: str) -> str:
    """clef-flash:latest を使い、テキストの熱量や文脈から演出パターンを自律判定"""
    state_text = f"Title: {title}\nContent: {content}\nInsights: {insights}"

    try:
        response = client.systemone(
            model=CLEF_MODEL,
            state=state_text,
            questions={
                "pattern_type": {
                    "type": "choice",
                    "instructions": "投稿の文脈と熱量を分析し、他のメンバーが取るべき最適な反応演出パターンを選択してください。",
                    "choices": ["Pattern_A_Stamp", "Pattern_B_Comment", "Pattern_C_Rally"],
                    "criteria": {
                        "Pattern_A_Stamp": "軽い日常つぶやき。スタンプや短文の一言で反応するのが自然な投稿。",
                        "Pattern_B_Comment": "深い感情、技術的考察、日常のこだわり等があり、画像や本文を深掘りして温かい長文感想を返す投稿。",
                        "Pattern_C_Rally": "疑問形、相談、問いかけ、お誘い要素が含まれ、複数回の会話（ラリー）へ発展させるべき投稿。"
                    }
                }
            }
        )
        selected_pattern = response.answers['pattern_type'].choice
        print(f"🎯 clef-flash 演出判定結果: {selected_pattern}")
        return selected_pattern
    except Exception as e:
        print(f"[WARN] clef-flash 判定エラー、Pattern_B_Comment へフォールバックします: {e}")
        traceback.print_exc()
        return "Pattern_B_Comment"

def generate_reply_content_with_vision(responder: dict, author_name: str, parent_post: dict, image_path: Path, pattern: str) -> tuple[str, str]:
    """gemmavl:latest を使い、画像と文脈を読み取ってペルソナに沿ったリプを生成"""
    title = parent_post.get("title", "")
    content = parent_post.get("content", "")

    if pattern == "Pattern_A_Stamp":
        length_instruction = "30文字以内の超短文で、スタンプと一緒に一言だけサクッと反応してください。"
    elif pattern == "Pattern_C_Rally":
        length_instruction = "80〜120文字程度で、感想を述べつつ投稿者へ1つ質問や問いかけを投げかけて会話を繋げてください。"
    else:  # Pattern_B_Comment
        length_instruction = "80〜150文字程度で、画像（ある場合）や本文に触れながら温かい感想を書いてください。"

    system_prompt = f"""
あなたは「{responder['name']}」（{responder['role']}）です。
語り口: {responder['tone']}
一人称制限: あなたの一人称は必ず「{responder['first_person']}」です。それ以外（僕、俺等）は絶対禁止。

【ミッション】
仲間（{author_name}）の投稿（画像や文章）を見て、あなたの立場から感想やリアクションを返してください。
評価・採点・上から目線のアドバイスは厳禁です。純粋に共感し、会話を楽しんでください。

【絶対ルール】
1. 完全な「タメ口」のみを使用すること（「です」「ます」禁止）。
2. 一人称は必ず「{responder['first_person']}」にすること。
3. {length_instruction}
"""

    user_prompt = f"投稿者: {author_name}\nタイトル: {title}\n本文: {content}\n\nこの投稿を見て、感想メッセージを作成してください。"

    # 🛡️ 画像ファイルが物理的に存在するか徹底ガード
    images = []
    if image_path and image_path.is_file():
        images.append(str(image_path))
    else:
        print(f"⚠️ [WARN] 画像ファイルが存在しないため、テキストのみで生成を続行します: {image_path}")

    try:
        # images 配列が空の場合は引数ごと渡さない、または空リストで渡す
        message_payload = {"role": "user", "content": user_prompt}
        if images:
            message_payload["images"] = images

        response = ollama.chat(
            model=VISION_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                message_payload
            ]
        )
        reply_text = response['message']['content'].strip()
        stamp = random.choice(STAMP_OPTIONS) if pattern == "Pattern_A_Stamp" else ""
        return reply_text, stamp
    except Exception as e:
        print(f"[ERROR] Visionモデルによるリプ生成失敗: {e}")
        traceback.print_exc()
        return "すごい！素敵な投稿だね✨", "✨"
    
def process_auto_reply():
    """phied.json の最新投稿を対象に、他メンバーが自律的にリアクションリプを書き込むメイン関数"""
    print("\n🤖 === 自律フィードバック＆リプ生成モジュール開始 ===")

    if not PHIED_JSON_PATH.exists():
        print(f"[ERROR] {PHIED_JSON_PATH} が存在しません。")
        return

    with open(PHIED_JSON_PATH, "r", encoding="utf-8") as f:
        try:
            logs = json.load(f)
        except json.JSONDecodeError:
            print(f"[ERROR] {PHIED_JSON_PATH} のパースに失敗しました。")
            return

    if not logs:
        print("[WARN] 対象となる投稿データがゼロです。")
        return

    # 最新の投稿を取得
    target_post = logs[0]
    author_id = target_post.get("author", "")
    author_name = target_post.get("authorName", author_id)
    image_src = target_post.get("imageSrc", "")

    # 投稿者以外のメンバーからランダムで返信者を選出
    available_responders = [k for k in MEMBER_PERSONAS.keys() if k != author_id]
    if not available_responders:
        available_responders = list(MEMBER_PERSONAS.keys())
    
    responder_id = random.choice(available_responders)
    responder = MEMBER_PERSONAS[responder_id]

    print(f"📌 対象親投稿: 【{author_name}】{target_post.get('title')}")
    print(f"💬 返信選出メンバー: {responder['name']} ({responder_id})")

    # 画像パスの解決
    relative_image_path = image_src.lstrip("/")
    image_path = PROJECT_ROOT / "public" / relative_image_path

    if not image_path.exists():
        print(f"[ERROR] 画像ファイルが存在しません: {image_path}")
        return

    # Step 1: clef-flash による演出パターンの判定
    pattern = decide_reply_pattern_with_clef(
        target_post.get("title", ""),
        target_post.get("content", ""),
        target_post.get("insights", "")
    )

    # Step 2: gemmavl による画像認識 ＆ リプ本文の生成
    reply_text, stamp = generate_reply_content_with_vision(
        responder, author_name, target_post, image_path, pattern
    )

    # Step 3: phied.json への構造保存
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

    # 保存
    with open(PHIED_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)

    print(f"✨ リプ保存完了! [{pattern}] {responder['name']}: {reply_text}")
    print("🎉 === 自律リプ生成正常終了 ===\n")

if __name__ == "__main__":
    process_auto_reply()