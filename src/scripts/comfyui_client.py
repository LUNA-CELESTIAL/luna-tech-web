import os
import json
import urllib.request
import urllib.parse
import traceback
import ollama
from pathlib import Path
from dotenv import load_dotenv

# 1. パスの安全な自動解決（PROJECT_ROOT 直下の luna.json を特定）
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

# luna.json の絶対パスを確実にする（/home/lulu/luna/luna_docker/luna-tech-web/luna.json）
DEFAULT_JSON_PATH = PROJECT_ROOT / "luna.json"
JSON_WORKFLOW_PATH = Path(os.getenv("COMFYUI_JSON_PATH", str(DEFAULT_JSON_PATH)))

# モデル定義
MODEL_LUNA_FAMILY = "krea2Cocoamix_v003beta.safetensors"
MODEL_HINA_KOHAKU = "moodyCutieMixFreeKrea2_v60_int8.safetensors"

# 各メンバーの固定外見プロンプト（ベース）
MEMBER_BASE_PROMPTS = {
    "luna": (
        "An anime-style portrait of a lovely girl with long brown hair and expressive eyes, "
        "wearing a black cyber choker with a glowing pink crown icon."
    ),
    "spica": (
        "An anime-style portrait of a cool and beautiful girl with dark navy long hair. "
        "She has a calm and slightly distant expression with deep blue-green eyes. "
        "She wears a sleek dark blue coat with subtle cyan accents. "
        "On her neck, she wears a black cyber choker with a glowing cyan globe icon. "
        "Clean white background, soft studio lighting, masterpiece, high quality, elegant atmosphere."
    ),
    "sirius": (
        "An anime-style portrait of a fashionable and energetic girl with vibrant pink short hair styled with small clips. "
        "She has a bright and confident smile with playful amber-golden eyes. "
        "She wears a clean, stylish white cyber-jacket with subtle neon accents. "
        "On her neck, she wears a black cyber choker with a glowing pink lightning icon. "
        "Clean white background, soft studio lighting, masterpiece, high quality, lively atmosphere."
    ),
    "stella": (
        "An anime-style portrait of a cute and energetic girl with warm amber-brown short hair with a small braid. "
        "She has a curious and determined expression with bright golden-amber eyes. "
        "She wears a charming amber-toned vintage mechanic dress with delicate gear-patterned lace accents. "
        "On her neck, she wears a black cyber choker with a glowing amber gear icon. "
        "Clean white background, soft studio lighting, masterpiece, high quality, warm and cozy atmosphere."
    ),
    "selene": (
        "An anime-style portrait of a graceful and sweet girl with elegant long silver-purple hair in a soft half-up style with lavender ribbons. "
        "She has a gentle and slightly shy expression with glowing emerald-green eyes. "
        "She wears a lovely lavender and white dress with delicate lace and soft frills. "
        "On her neck, she wears a black cyber choker with a glowing emerald crescent moon icon. "
        "Clean white background, soft studio lighting, masterpiece, high quality, ethereal and dreamy atmosphere."
    ),
    "nano": (
        "An anime-style portrait of an adorably cute youngest girl with soft pastel cream-colored bob hair featuring vibrant orange-gradient tips. "
        "She has a bright, playful wink with warm ruby-pink eyes. "
        "She wears an oversized soft pastel hoodie with cute frills and heart motifs. "
        "On her neck, she wears a black cyber choker with a glowing pink heart icon. "
        "Clean white background, soft studio lighting, masterpiece, high quality, cheerful and sweet atmosphere."
    ),
    "hina": (
        "A candid, raw studio portrait photo of a 16-year-old Japanese high school girl with slender, sharp facial features and a defined jawline. "
        "Her hair is brown with subtle pink tips, styled in a high ponytail with blunt bangs and loose strands framing her face. "
        "She has natural, clear eyes with bright catchlights, a small refined nose, and natural lips. "
        "Her fair skin is completely smooth, clear, and flawless, featuring a subtle small facial mole on her cheek and a small mole on her shoulder. "
        "She wears a white cotton hoodie layered under a navy blue wool blazer jacket with gold metallic buttons, and a navy blue plaid pleated mini skirt with white crew socks and white platform sneakers."
    ),
    "kohaku": (
        "A candid, raw studio portrait photo of a 16-year-old Japanese high school girl with a soft, youthful baby face and round features. "
        "Her hair is light ash brown, styled in a messy low side ponytail on the left with loose strands framing her face and curtain bangs. "
        "She has large, natural hazel brown eyes with a gentle gaze and clear bright catchlights, a small low nose bridge, soft rounded cheeks, and full natural lips. "
        "Her skin is clear and smooth with a natural light skin tone, featuring a subtle small facial mole on her cheek. "
        "She wears a white cotton collared blouse with a purple plaid ribbon bow tie, a navy blue sleeveless V-neck jumper dress with a gold belt, navy blue knee-high socks, and black leather penny loafers."
    )
}

def generate_situational_sentence(tweet_text: str) -> str:
    """muse-unce:latest でシチュエーション英文を生成"""
    system_instruction = (
        "You are an AI assistant specialized in generating image description prompts for ComfyUI. "
        "Your job is to read a Japanese tweet and write 1-2 clear, descriptive English sentences "
        "that depict ONLY the situational environment, including camera angle, pose, and gaze direction "
        "(e.g., side view, looking down at a book, looking slightly away, turning slightly towards the desk, working on a laptop, profile angle). "
        "CRITICAL RULES:\n"
        "1. Do NOT describe character features like hair color, eye color, or clothing.\n"
        "2. Do NOT output any reasoning, chain-of-thought, XML tags, or markdown.\n"
        "3. Vary the camera angles and poses naturally based on the context.\n"
        "4. Output ONLY the raw English sentences describing the situation."
    )

    prompt_input = f"Japanese Tweet: {tweet_text}\nSituational English Description:"

    try:
        response = ollama.generate(
            model="muse-unce:latest",
            prompt=f"{system_instruction}\n\n{prompt_input}"
        )
        situational_text = response.get('response', '').strip()
        if "<|message|>" in situational_text:
            situational_text = situational_text.split("<|message|>")[-1].strip()
        return situational_text
    except Exception as e:
        print(f"[ERROR] Ollama API Error (muse-unce): {e}")
        traceback.print_exc()
        return ""
    
def queue_comfyui_generation(prompt_text: str, reference_image_name: str, unet_model_name: str) -> str:
    """ComfyUI API へジョブ投入（絶対パスによるワークフローJSON読み込み）"""
    if not JSON_WORKFLOW_PATH.exists():
        print(f"[ERROR] ワークフローJSONが存在しません: {JSON_WORKFLOW_PATH}")
        return ""

    try:
        with open(JSON_WORKFLOW_PATH, "r", encoding="utf-8") as f:
            workflow = json.load(f)

        # 1. ノード 30:19 (User Prompt) を更新
        if "30:19" in workflow and "inputs" in workflow["30:19"]:
            workflow["30:19"]["inputs"]["value"] = prompt_text
        else:
            print("[ERROR] ノード 30:19 (User Prompt) が見つかりません。")
            return ""

        # 2. ノード 69 (LoadImage) を更新
        if "69" in workflow and "inputs" in workflow["69"]:
            workflow["69"]["inputs"]["image"] = reference_image_name
        else:
            print("[ERROR] ノード 69 (LoadImage) が見つかりません。")
            return ""

        # 3. ノード 30:10 (UNETLoader) のモデルを動的に更新
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
    """著者IDに応じてモデル、プロンプト、参照画像を動的選定してジョブ投入"""
    base_prompt = MEMBER_BASE_PROMPTS.get(author_id, MEMBER_BASE_PROMPTS["luna"])
    ref_image_name = f"{author_id}.png"

    if author_id in ["hina", "kohaku"]:
        selected_model = MODEL_HINA_KOHAKU
    else:
        selected_model = MODEL_LUNA_FAMILY

    print(f"🎨 キャラクター設定抽出: {author_id} (参照画像: {ref_image_name} | モデル: {selected_model})")

    situational_sentence = generate_situational_sentence(tweet_content)
    final_prompt = f"{base_prompt} {situational_sentence}"
    print(f"📝 注入プロンプト: {final_prompt}")

    return queue_comfyui_generation(final_prompt, reference_image_name=ref_image_name, unet_model_name=selected_model)