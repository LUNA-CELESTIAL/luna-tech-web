import os
import json
import re
import urllib.request
import urllib.parse
import traceback
import ollama
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

COMFYUI_HOST = os.getenv("COMFYUI_HOST", "127.0.0.1:8188")

DEFAULT_JSON_PATH = PROJECT_ROOT / "luna.json"
JSON_WORKFLOW_PATH = Path(os.getenv("COMFYUI_JSON_PATH", str(DEFAULT_JSON_PATH)))

# モデル定義
MODEL_LUNA_FAMILY = "krea2Cocoamix_v004beta.safetensors"
MODEL_HINA_KOHAKU = "moodyCutieMixFreeKrea2_v60_int8.safetensors"

# 各メンバーの固定外見プロンプト（純粋な外見定義）
MEMBER_BASE_PROMPTS = {
    "luna": (
        "An anime style, a lovely girl with long brown hair and expressive eyes, "
        "wearing a black cyber choker with a glowing pink crown icon."
    ),
    "spica": (
        "An anime style, a cool and beautiful girl with dark navy long hair, "
        "calm expression with deep blue-green eyes, wearing a sleek dark blue coat with cyan accents. "
        "On her neck, a black cyber choker with a glowing cyan globe icon."
    ),
    "sirius": (
        "An anime style, vibrant pink short hair styled with small clips, "
        "playful amber-golden eyes, stylish white cyber-jacket with neon accents. "
        "On her neck, a black cyber choker with a glowing pink lightning icon."
    ),
    "stella": (
        "An anime style, warm amber-brown short hair with a small braid, "
        "bright golden-amber eyes, amber-toned vintage mechanic dress. "
        "On her neck, a black cyber choker with a glowing amber gear icon."
    ),
    "selene": (
        "An anime style, long silver-purple hair in a soft half-up style with lavender ribbons, "
        "glowing emerald-green eyes, lavender and white dress with delicate lace. "
        "On her neck, a black cyber choker with a glowing emerald crescent moon icon."
    ),
    "nano": (
        "An anime style, soft pastel cream-colored bob hair with orange-gradient tips, "
        "warm ruby-pink eyes, oversized soft pastel hoodie. "
        "On her neck, a black cyber choker with a glowing pink heart icon."
    ),
    "hina": (
        "16-year-old Japanese girl, brown hair with subtle pink tips styled in a high ponytail with blunt bangs, "
        "slender facial features, fair clear skin with a small mole on cheek. "
        "Wearing a white cotton hoodie layered under a navy blue wool blazer jacket with gold metallic buttons, "
        "and a navy blue plaid pleated mini skirt, white crew socks, white platform sneakers."
    ),
    "kohaku": (
        "16-year-old Japanese girl, light ash brown hair styled in a messy low side ponytail on the left with curtain bangs, "
        "soft youthful baby face with round features, large natural hazel brown eyes, clear light skin with a small mole on cheek. "
        "Wearing a white cotton collared blouse with a purple plaid ribbon bow tie, navy blue sleeveless V-neck jumper dress with a gold belt."
    )
}

def parse_llm_json_safely(raw_text: str) -> dict:
    """
    思考ログやシステムプロンプトのオウム返し（Example表記）を無視し、
    テキストの『一番最後』に出現する有効なJSONオブジェクト（{...}）を厳密抽出してパースする関数
    """
    json_blocks = re.findall(r'\{[\s\S]*?\}', raw_text)
    
    if not json_blocks:
        raise ValueError("テキスト内に有効なJSON構造（{...}）が見つかりませんでした。")

    # 一番最後のJSONブロックを採用（Ollamaは末尾に本番JSONを出力するため）
    json_str = json_blocks[-1]

    # 文法エラー自動補正（末尾カンマ削除、クォート補正）
    json_str = re.sub(r',\s*([}\]])', r'\1', json_str)
    json_str = re.sub(r"(?<=[\{\,])\s*\'([^\']+)\'\s*:", r'"\1":', json_str)

    return json.loads(json_str)

def generate_situational_json_realistic(tweet_text: str) -> dict:
    """【ひな・こはく用】LLMにカンマ区切りキーワードのみをJSON出力させる関数"""
    system_prompt = (
        "You are an AI specialized in analyzing tweets and generating image prompt keywords in JSON format.\n"
        "Output ONLY a raw JSON object with the exact keys shown below. Do NOT output any thinking, text, or markdown blocks.\n\n"
        "Example Output Format:\n"
        "{\n"
        '  "location": "minimalist Japanese workshop interior, clean white walls, natural wood desk",\n'
        '  "action_and_objects": "young woman sitting at desk, gently placing excess tools into a drawer, holding one sleek tool",\n'
        '  "avoid_elements": "ABSOLUTELY NO clutter, NO brand logos, NO messy background",\n'
        '  "camera_and_pose": "eye-level medium shot, three-quarter body pose seated at desk",\n'
        '  "expression_and_mood": "thoughtful calm facial expression, soft reflective smile, gentle natural lighting"\n'
        "}\n\n"
        f"Input Tweet: {tweet_text}\n"
        "JSON Output:"
    )

    try:
        response = ollama.generate(model="muse-unce:latest", prompt=system_prompt)
        raw_text = response.get('response', '').strip()
        return parse_llm_json_safely(raw_text)

    except Exception as e:
        print(f"[WARN] Ollama Realistic JSON解析失敗、デフォルト値へフォールバックします: {e}")
        print(f"[DEBUG] パース失敗対象の生テキスト:\n{raw_text if 'raw_text' in locals() else 'None'}")
        return {
            "location": "clean minimalist indoor space, wooden desk",
            "action_and_objects": "sitting at a wooden desk, handling essential tools",
            "avoid_elements": "ABSOLUTELY NO clutter, NO dangerous tools",
            "camera_and_pose": "medium shot, natural seated pose",
            "expression_and_mood": "calm thoughtful expression, soft natural lighting"
        }

def build_realistic_style_prompt_from_json(base_prompt: str, tweet_text: str) -> str:
    """JSONデータを受け取り、文脈の通った自然な英文プロンプトへガッチャンコして再構築"""
    data = generate_situational_json_realistic(tweet_text)

    env_section = f"{data.get('location', '')}. She is {data.get('action_and_objects', '')}. {data.get('avoid_elements', '')}".strip()
    comp_section = f"{data.get('camera_and_pose', '')}. {data.get('expression_and_mood', '')}, high quality, masterpiece".strip()

    return (
        f"A candid raw photo, natural lifestyle photography.\n\n"
        f"[Character Details]\n{base_prompt}\n\n"
        f"[Environment & Situation]\n{env_section}\n\n"
        f"[Composition & Lighting]\n{comp_section}"
    ).strip()

def generate_situational_json_anime(tweet_text: str) -> dict:
    """【ルナファミリー用】2Dアニメ調キーワードをJSON形式で抽出する関数"""
    system_prompt = (
        "You are an AI specialized in analyzing tweets and generating 2D anime style image prompt keywords in JSON format.\n"
        "Output ONLY a raw JSON object with the exact keys shown below. Do NOT output any thinking, text, or markdown blocks.\n\n"
        "Example Output Format:\n"
        "{\n"
        '  "location": "vibrant anime street cafe, glass windows, neon signage in Japanese, wet asphalt reflections",\n'
        '  "action_and_objects": "energetic young anime girl sitting at table, holding a glowing futuristic gadget",\n'
        '  "avoid_elements": "ABSOLUTELY NO realistic photorealistic human faces, NO photographic textures, NO camera noise",\n'
        '  "camera_and_gaze": "low angle medium close-up, gazing at glowing device, slight Dutch tilt",\n'
        '  "style_and_lighting": "cel shaded 2D anime key visual style, vibrant neon rim lighting, cyan glow"\n'
        "}\n\n"
        f"Input Tweet: {tweet_text}\n"
        "JSON Output:"
    )

    try:
        response = ollama.generate(model="muse-unce:latest", prompt=system_prompt)
        raw_text = response.get('response', '').strip()
        return parse_llm_json_safely(raw_text)

    except Exception as e:
        print(f"[WARN] Ollama Anime JSON解析失敗、デフォルト値へフォールバックします: {e}")
        print(f"[DEBUG] パース失敗対象の生テキスト:\n{raw_text if 'raw_text' in locals() else 'None'}")
        return {
            "location": "vibrant anime background style, clean stylized background art",
            "action_and_objects": "sitting comfortably at a modern cafe table",
            "avoid_elements": "ABSOLUTELY NO realistic photorealistic elements, NO real human faces, NO camera noise",
            "camera_and_gaze": "medium shot, crisp anime art style",
            "style_and_lighting": "soft studio lighting, vibrant colors, highly detailed"
        }

def build_anime_style_prompt_from_json(base_prompt: str, tweet_text: str) -> str:
    """JSONデータを受け取り、2Dアニメ調の文脈プロンプトを再構築"""
    data = generate_situational_json_anime(tweet_text)

    env_section = f"{data.get('location', '')}. She is {data.get('action_and_objects', '')}. {data.get('avoid_elements', '')}".strip()
    comp_section = f"{data.get('camera_and_gaze', '')}. {data.get('style_and_lighting', '')}, masterpiece".strip()

    return (
        f"Masterpiece 2D anime illustration, digital artwork style.\n\n"
        f"[Character Details]\n{base_prompt}\n\n"
        f"[Environment & Situation]\n{env_section}\n\n"
        f"[Composition & Gaze]\n{comp_section}"
    ).strip()

def clean_bad_words(text: str) -> str:
    """破綻を招く不適切なキーワードの削除処理"""
    bad_patterns = [
        r'studio portrait photo', r'portrait', r'looking at (the )?camera',
        r'looking into (the )?lens', r'facing (the )?camera', r'mirror', r'reflection'
    ]
    cleaned = text
    for pattern in bad_patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    return cleaned.strip()

def queue_comfyui_generation(prompt_text: str, reference_image_name: str, unet_model_name: str) -> str:
    """ComfyUI API へジョブ投入"""
    if not JSON_WORKFLOW_PATH.exists():
        print(f"[ERROR] ワークフローJSONが存在しません: {JSON_WORKFLOW_PATH}")
        return ""

    try:
        with open(JSON_WORKFLOW_PATH, "r", encoding="utf-8") as f:
            workflow = json.load(f)

        if "30:19" in workflow and "inputs" in workflow["30:19"]:
            workflow["30:19"]["inputs"]["value"] = prompt_text
        else:
            print("[ERROR] ノード 30:19 (User Prompt) が見つかりません。")
            return ""

        if "69" in workflow and "inputs" in workflow["69"]:
            workflow["69"]["inputs"]["image"] = reference_image_name
        else:
            print("[ERROR] ノード 69 (LoadImage) が見つかりません。")
            return ""

        if "30:10" in workflow and "inputs" in workflow["30:10"]:
            workflow["30:10"]["inputs"]["unet_name"] = unet_model_name
            print(f"⚙️ Diffusion Model 設定: {unet_model_name}")
        else:
            print("[WARN] ノード 30:10 (UNETLoader) が見つかりません。デフォルトのまま実行します。")

        payload = {"prompt": workflow}
        data = json.dumps(payload).encode('utf-8')
        
        req = urllib.request.Request(
            f"http://{COMFYUI_HOST}/prompt",
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            prompt_id = res.get("prompt_id", "")
            print(f"[SUCCESS] ComfyUI ジョブ登録完了! Prompt ID: {prompt_id} (Ref: {reference_image_name})")
            return prompt_id

    except Exception as e:
        print(f"[ERROR] ComfyUI API 接続エラー: {e}")
        traceback.print_exc()
        return ""

def generate_image_for_author(author_id: str, tweet_content: str) -> str:
    """著者IDに応じてモデル・JSONプロンプト構築関数・参照画像を完全に分離して選定"""
    base_prompt = MEMBER_BASE_PROMPTS.get(author_id, MEMBER_BASE_PROMPTS["luna"])
    ref_image_name = f"{author_id}.png"

    if author_id in ["hina", "kohaku"]:
        selected_model = MODEL_HINA_KOHAKU
        final_prompt = build_realistic_style_prompt_from_json(base_prompt, tweet_content)
    else:
        selected_model = MODEL_LUNA_FAMILY
        final_prompt = build_anime_style_prompt_from_json(base_prompt, tweet_content)

    print(f"🎨 キャラクター設定抽出: {author_id} (参照画像: {ref_image_name} | モデル: {selected_model})")
    print(f"📝 注入プロンプト（完全分離・JSONネイティブ型）:\n----------------------------------------\n{final_prompt}\n----------------------------------------")

    return queue_comfyui_generation(final_prompt, reference_image_name=ref_image_name, unet_model_name=selected_model)