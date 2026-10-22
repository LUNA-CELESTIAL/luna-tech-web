import os
import json
import random
import traceback
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import ollama

# 音声生成モジュールの読み込み
from generate_voice import generate_voicevox_audio

SCRIPT_DIR = Path(__file__).resolve().parent

if SCRIPT_DIR.name == "scripts" and SCRIPT_DIR.parent.name == "src":
    PROJECT_ROOT = SCRIPT_DIR.parent.parent
elif SCRIPT_DIR.name == "scripts":
    PROJECT_ROOT = SCRIPT_DIR.parent
else:
    PROJECT_ROOT = SCRIPT_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")

VISION_MODEL = os.getenv("OLLAMA_VISION_MODEL", "gemmavl:latest")
PHIED_JSON_PATH = PROJECT_ROOT / "src" / "data" / "phied.json"

MEMBER_PERSONAS = {
    "spica": {"name": "スピカ（SPICA）", "role": "三女 / 基地の電脳点検医", "first_person": "あたし", "tone": "冷静、クール、少し素っ気ないが筋を通す頼れる姉御肌（タメ口）。一人称は「あたし」。"},
    "luna": {"name": "ルナ（LUNA）", "role": "長女 / ラボの優しい見守り役", "first_person": "私", "tone": "おっとり優しい長女、温かく包み込む話し方（タメ口）。一人称は「私」。"},
    "sirius": {"name": "シリウス（SIRIUS）", "role": "次女 / 感情のおすそわけ担当", "first_person": "ウチ", "tone": "明るく元気、エネルギッシュ、感情豊かなリアルタイムのつぶやき（タメ口）。一人称は「ウチ」。"},
    "stella": {"name": "ステラ（STELLA）", "role": "四女 / ピクセルの職人クラフター", "first_person": "ウチ", "tone": "真面目、こだわり屋、職人気質でストレートな口調（タメ口）。一人称は「ウチ」。"},
    "selene": {"name": "セレーネ（SELENE）", "role": "五女 / 真夜中のものがたり綴り手", "first_person": "私", "tone": "穏やかで情緒的、ゆったりとした落ち着いた話し方（タメ口）。一人称は「私」。"},
    "nano": {"name": "ナノ（NANO）", "role": "六女 / 無邪気なノイズ助手", "first_person": "ナノ", "tone": "天真爛漫、甘えん坊、無邪気で親しみやすい口調（タメ口）。一人称は「ナノ」。"},
    "hina": {"name": "桜音ひな", "role": "高校生 / 直感アイデア担当", "first_person": "ひな", "tone": "明るい、前向き、直感的、親しみやすい普通の女子高生口調（タメ口）。一人称は「ひな」。"},
    "kohaku": {"name": "紬 こはく", "role": "高校生 / リフレクション・分析担当", "first_person": "わたし", "tone": "落ち着いた、マイペース、少し控えめな話し方（タメ口）。一人称は「わたし」。"}
}

def generate_single_rally_reply(responder: dict, parent_post: dict, existing_replies: list) -> str:
    """直前の会話履歴を踏まえて、次のメンバーが自然に割り込むレスを生成"""
    author_name = parent_post.get("authorName", "")
    title = parent_post.get("title", "")
    content = parent_post.get("content", "")

    history_text = f"【元の投稿 ({author_name})】\nタイトル: {title}\n本文: {content}\n\n"
    if existing_replies:
        history_text += "【これまでの会話スレッド】\n"
        for r in existing_replies:
            history_text += f"- {r['authorName']}: {r['content']}\n"

    system_prompt = f"""
あなたは「{responder['name']}」（{responder['role']}）です。
語り口: {responder['tone']}
一人称制限: あなたの一人称は「{responder['first_person']}」です。それ以外は絶対禁止。

【ミッション】
仲間たちの会話スレッドに入り、あなたの立場から自然な返信（80〜120文字程度）をしてください。
直前に発言した人の意見に共感したり、自分の意見を追加したり、会話を楽しく盛り上げてください。

【絶対ルール】
1. 完全な「タメ口」のみを使用すること。
2. 一人称は必ず「{responder['first_person']}」にすること。
3. 評価・説教は禁止。フランクな会話にすること。
"""

    user_prompt = f"{history_text}\n上記を踏まえて、{responder['name']}として自然な返信コメントを作成してください。"

    try:
        response = ollama.chat(
            model=VISION_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        return response['message']['content'].strip()
    except Exception as e:
        print(f"[ERROR] 返信生成失敗: {e}")
        return "その話、あたしも混ぜて！すごーく気になっちゃった✨"

def process_auto_reply():
    """Pattern_C 集中実験：2〜4件のマルチターン会話スレッドとTTS音声を自律生成して確定保存"""
    print("\n🤖 === マルチターン会話ラリー ＆ TTS音声自動生成開始 ===")

    if not PHIED_JSON_PATH.exists():
        print(f"[ERROR] {PHIED_JSON_PATH} が存在しません。")
        return

    try:
        with open(PHIED_JSON_PATH, "r", encoding="utf-8") as f:
            logs = json.load(f)

        if not logs:
            print("[WARN] 対象投稿がありません。")
            return

        target_post = logs[0]
        author_id = target_post.get("author", "")

        # 確率判断（ヒントがあれば強制ラリー、なければ25%でラリー、75%で1件リプ）
        is_rally = target_post.get("replyPatternHint") == "Pattern_C_Rally" or (random.random() < 0.25)
        rally_count = random.randint(2, 4) if is_rally else 1

        print(f"🔥 目標件数: {rally_count} 件の連鎖返信・TTS音声を生成します")

        available_agents = [k for k in MEMBER_PERSONAS.keys() if k != author_id]
        random.shuffle(available_agents)

        if "replies" not in target_post or not isinstance(target_post["replies"], list):
            target_post["replies"] = []

        now = datetime.now()

        for i in range(min(rally_count, len(available_agents))):
            responder_id = available_agents[i]
            responder = MEMBER_PERSONAS[responder_id]

            print(f"\n💬 返信 {i+1}/{rally_count} : {responder['name']} ({responder_id}) が入力中...")

            reply_text = generate_single_rally_reply(responder, target_post, target_post["replies"])
            reply_id = f"reply-{responder_id}-{now.strftime('%Y%m%d%H%M%S')}-{i}"

            # 🎙️ VOICEVOX 音声生成（未設定キャラは自動で None を返してスキップされる）
            audio_filename = f"{reply_id}.wav"
            audio_src = generate_voicevox_audio(
                text=reply_text,
                agent_id=responder_id,
                output_filename=audio_filename
            )

            reply_entry = {
                "replyId": reply_id,
                "author": responder_id,
                "authorName": responder["name"],
                "pattern": "Pattern_C_Rally" if is_rally else "Pattern_B_Comment",
                "stamp": "",
                "content": reply_text,
                "audioSrc": audio_src if audio_src else "",
                "timestamp": now.strftime("%Y.%m.%d %H:%M")
            }

            target_post["replies"].append(reply_entry)

        # 確実に phied.json に上書き保存を実行
        with open(PHIED_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(logs, f, ensure_ascii=False, indent=2)

        print(f"\n✅ [SUCCESS] {PHIED_JSON_PATH} へ全 {len(target_post['replies'])} 件のリプライ（音声パス含む）を保存完了！")

    except Exception as e:
        print(f"❌ [ERROR] リプライ・音声処理中に例外が発生しました: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    process_auto_reply()