import os
import re
import json
import urllib.request
import urllib.parse
import traceback
from pathlib import Path
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

# 設定値（環境変数からの取得・フォールバック付き）
VOICEVOX_HOST = os.getenv("VOICEVOX_HOST", "http://localhost:50021")
CHARACTERS_JSON_PATH = PROJECT_ROOT / "src" / "data" / "characters.json"
AUDIO_OUTPUT_DIR = PROJECT_ROOT / "public" / "audio" / "phied"

# アルファベット・英単語の誤読（一文字読み）を防止するカタカナ置き換え辞書
ENGLISH_TO_KATAKANA = {
    "LUNA": "ルナ",
    "SPICA": "スピカ",
    "SIRIUS": "シリウス",
    "STELLA": "ステラ",
    "SELENE": "セレーネ",
    "NANO": "ナノ",
    "luna": "ルナ",
    "spica": "スピカ",
    "sirius": "シリウス",
    "stella": "ステラ",
    "selene": "セレーネ",
    "nano": "ナノ",
    "phied": "フィード",
    "AI": "エーアイ",
    "ai": "エーアイ",
    "UI": "ユーアイ",
    "PC": "ピーシー",
    "OS": "オーエス",
    "TTS": "ティーティーエス",
    "JSON": "ジェイソン",
    "API": "エーピーアイ"
}

def preprocess_text_for_voicevox(text: str) -> str:
    """VOICEVOXがアルファベットを1文字ずつ読むのを防ぐ前処理フィルター"""
    processed = text
    for en_word, kana_word in ENGLISH_TO_KATAKANA.items():
        processed = re.sub(rf'\b{re.escape(en_word)}\b', kana_word, processed)
    return processed

def load_character_voice_config(agent_id: str) -> dict | None:
    """characters.json から指定したエージェントの音声パラメータを取得。未設定なら None"""
    if not CHARACTERS_JSON_PATH.exists():
        raise FileNotFoundError(f"[ERROR] {CHARACTERS_JSON_PATH} が存在しません。")

    with open(CHARACTERS_JSON_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

    # 設定が存在しないキャラ（hina, kohaku等）は None を返す
    return config.get(agent_id.lower())

def generate_voicevox_audio(text: str, agent_id: str, output_filename: str) -> str | None:
    """VOICEVOX APIを叩いて.wav音声を生成し public/audio/phied/ へ保存する"""
    try:
        # 🌸 未登録キャラ（hina, kohaku等）は安全にスキップ！
        char_cfg = load_character_voice_config(agent_id)
        if not char_cfg or "voice_id" not in char_cfg:
            print(f"⏩ [{agent_id}] は VOICEVOX 設定未登録のため、音声生成をスキップします。")
            return None

        AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        clean_text = preprocess_text_for_voicevox(text)
        voice_id = char_cfg["voice_id"]

        # Step 1: /audio_query の生成
        query_params = urllib.parse.urlencode({"text": clean_text, "speaker": voice_id})
        query_url = f"{VOICEVOX_HOST}/audio_query?{query_params}"

        req_query = urllib.request.Request(query_url, method="POST")
        with urllib.request.urlopen(req_query) as res:
            audio_query = json.loads(res.read().decode("utf-8"))

        # characters.json の個別の調整値を注入
        audio_query["speedScale"] = char_cfg.get("speed_scale", 1.0)
        audio_query["intonationScale"] = char_cfg.get("intonation_scale", 1.0)
        audio_query["volumeScale"] = char_cfg.get("volume_scale", 1.0)

        # Step 2: /synthesis の実行（音声生成）
        synth_params = urllib.parse.urlencode({"speaker": voice_id})
        synth_url = f"{VOICEVOX_HOST}/synthesis?{synth_params}"
        
        headers = {"Content-Type": "application/json"}
        req_synth = urllib.request.Request(
            synth_url,
            data=json.dumps(audio_query).encode("utf-8"),
            headers=headers,
            method="POST"
        )

        output_path = AUDIO_OUTPUT_DIR / output_filename
        with urllib.request.urlopen(req_synth) as res, open(output_path, "wb") as f:
            f.write(res.read())

        relative_audio_src = f"/audio/phied/{output_filename}"
        print(f"🎙️ 音声生成成功 [{agent_id}] -> {output_path}")
        return relative_audio_src

    except Exception as e:
        print(f"❌ [ERROR] VOICEVOX 音声生成失敗 ({agent_id}): {e}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("🧪 === VOICEVOX 全エージェント音声生成＆スキップテスト開始 ===")
    
    # テスト対象の全8エージェント
    test_agents = ["luna", "spica", "sirius", "stella", "selene", "nano", "hina", "kohaku"]
    
    test_phrase = "VOICEVOXのテスト発話だわ。英語のSPICAやLUNAも正しく読めるかしら？"

    for agent_id in test_agents:
        filename = f"test_{agent_id}_voice.wav"
        print(f"\n--- [{agent_id}] のテスト実行 ---")
        
        audio_src = generate_voicevox_audio(
            text=test_phrase,
            agent_id=agent_id,
            output_filename=filename
        )

        if audio_src:
            print(f"✨ 成功: {audio_src}")
        else:
            print(f"🛑 スキップ正常確認: [{agent_id}] には音声ファイルが生成されませんでした。")

    print("\n🎉 === 全テスト完了 ===")