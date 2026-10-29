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
env_path = PROJECT_ROOT / ".env"
if not env_path.exists():
    env_path = PROJECT_ROOT / "src" / ".env"

load_dotenv(env_path, override=True)

COMFYUI_HOST = os.getenv("COMFYUI_HOST", "127.0.0.1:8188")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "127.0.0.1:11434")

DEFAULT_JSON_PATH = PROJECT_ROOT / "luna.json"
JSON_WORKFLOW_PATH = Path(os.getenv("COMFYUI_JSON_PATH", str(DEFAULT_JSON_PATH)))

# モデル定義
MODEL_LUNA_FAMILY = "krea2Cocoamix_v004beta.safetensors"
MODEL_HINA_KOHAKU = "moodyCutieMixFreeKrea2_v60_int8.safetensors"

# 各メンバーの固定外見プロンプト（8名完全版）
MEMBER_BASE_PROMPTS = {
    "luna": (
        "A lovely girl with long bright silver-blue hair, light blue-silver hair, pale ice blue glowing highlights, smooth shiny hair texture, falling in loose waves, with long side bangs and a small lifted strand at the crown. Expressive eyes, gentle smile. A tilted white sailor cap has a navy band bordered in white and a navy bow with trailing tails at the back. On her neck, she wears a black cyber choker with a glowing pink crown icon.\n\n"
        "[Top]\n"
        "A white short-sleeved sailor blouse with gently puffed sleeves. The broad navy sailor collar has three narrow white border stripes, pointed front ends and a square back panel. A white insert fills the front neckline. A navy neckerchief is knotted at the chest with two long pointed ends. Navy sleeve cuffs carry two narrow white stripes.\n\n"
        "[Bottom]\n"
        "A high-waisted navy miniskirt with a broad waistband and deep, evenly spaced pleats that flare outward.\n\n"
        "[Legwear and footwear]\n"
        "Opaque white thigh-high socks with two navy horizontal stripes near each top. Bare upper thighs remain visible between the skirt and socks. Glossy black round-toe Mary Jane shoes with single buckled instep straps, raised soles and low block heels.\n\n"
        "[Accessories]\n"
        "A small cream rectangular shoulder bag with a flap, navy piping around the edges, a navy bow on the front and a long navy strap with silver-toned fittings."
    ),
    "spica": (
        "A cool and beautiful girl with a calm and slightly distant expression and deep blue-green eyes. On her neck, she wears a black cyber choker with a glowing cyan globe icon. Pale lavender hair gathered into two low ponytails below the ears, with soft curled ends reaching the lower chest. Both tails fall forward over the shoulders through the lower opening of a black cat-ear hood. Soft bangs and short side strands frame the hairline, with two crossed lavender hairpins at the left temple. The hood has pointed black ears with fluffy lavender inner panels.\n\n"
        "[Outerwear]\n"
        "An oversized black zip-front hoodie with a loose open front, dropped shoulders, long baggy sleeves and ribbed cuffs. Lavender paw prints decorate the sleeves, and a small lavender cat outline sits on the left chest. Lavender drawstrings, silver zipper teeth and small silver zipper pulls contrast with the dark fabric.\n\n"
        "[Top]\n"
        "A fitted white ribbed cropped top with a gently curved neckline, exposing the midriff.\n\n"
        "[Bottom]\n"
        "A short dark gray pleated skirt with a lavender belt and a silver heart-shaped buckle. Additional lavender straps angle across the upper skirt, accompanied by silver rings and a hanging silver star.\n\n"
        "[Legwear and footwear]\n"
        "Thigh-high socks with black top bands and broad alternating black and lavender horizontal stripes. Bare thighs separate the socks from the skirt. Heavy black lace-up platform boots have lavender laces, rounded toes, silver buckles on black straps and thick black lug soles edged with lavender stripes.\n\n"
        "[Accessories]\n"
        "A narrow black choker with a central silver ring and dangling silver star. Small silver ear fittings. A rectangular black crossbody bag with silver rings and chains, a lavender cat-head charm and a long black strap."
    ),
    "sirius": (
        "A fashionable and energetic girl with a bright and confident smile and playful amber-golden eyes. Very long silver-blue hair in high twin ponytails with loose wavy ends and soft bangs. Pale blue and white ribbon bows and small white wing ornaments sit at the ties, with a tiny blue bow clip near the left temple. A fluffy white halo ring rests above the crown. A pale blue choker carries a small blue heart pendant. On her neck, she wears a black cyber choker with a glowing pink lightning icon.\n\n"
        "[Outerwear]\n"
        "A cropped white fluffy bolero with an open front, rounded short sleeves and broad soft cuffs. Two small raised white feathered wings decorate the center back.\n\n"
        "[Dress]\n"
        "A pale sky-blue short dress with a white-frilled neckline and a large white front bow centered by a faceted blue heart. A fitted upper section meets a high gathered waist. The glossy full skirt rounds into a soft bubble-like hem, with pale translucent ruffles showing beneath the curved blue edge.\n\n"
        "[Legwear and footwear]\n"
        "White thigh-high stockings with scattered pale blue cloud motifs. Fluffy white top bands sit above translucent white gathered frills, leaving bare thigh gaps below the dress. Glossy white platform Mary Janes have broad instep straps with blue heart buckles, blue heart ornaments at the outer heels and thick sculpted white soles.\n\n"
        "[Accessories]\n"
        "A translucent pale blue heart-shaped shoulder bag with white piping, a fluffy white cloud on the front and small white bows near the top. Large clear-blue beads joined by silver links form the shoulder strap."
    ),
    "stella": (
        "A cute and energetic girl with a curious and determined expression and bright golden-amber eyes. On her neck, she wears a black cyber choker with a glowing amber gear icon. "
        "Very long pale lavender hair with loose waves and softly divided bangs. A broad arched headband combines gathered white lace, black lace edging, black roses at both sides and black ribbon bows with long tails. Small silver-toned drop earrings accompany a black floral lace choker with a central black rose and dark teardrop pendant.\n\n"
        "[Dress]\n"
        "A black fitted-waist dress with a very full, short bell-shaped skirt. A white vertically pleated bib has a high ruffled neck, two small black buttons and white lace borders. Black shoulder bands frame the bib, and a broad black satin bow rests at its lower edge. The dark glossy fitted waist has fine black crisscross lacing along both sides, curved seams and a pointed lower outline. Long black sleeves have rounded puffed upper sections, narrow gathered bands with small black bows and fuller lower sections. White layered lace wrist cuffs are finished with black bows. The skirt combines a black velvet-like upper layer, broad crisp pure white floral lace borders, gathered black ruffles and pale sheer white lace beneath. Small black bows repeat along the lace-trimmed edges. The square back opening has white lace edging above black crisscross lacing and a large black waist bow.\n\n"
        "[Legwear and footwear]\n"
        "Black thigh-high stockings with broad scalloped floral lace tops and small pale ribbon bows at the front. Bare thighs separate the lace tops from the skirt. Glossy black platform Mary Janes have rounded toes, two buckled straps across each instep and high block heels.\n\n"
        "[Accessories]\n"
        "A rigid black coffin-shaped handbag with a short handle, silver-toned edge fittings, cross ornaments, fine corner decorations and a pale monochrome cross motif on the front."
    ),
    "selene": (
        "A graceful and sweet girl with a gentle and slightly shy expression and glowing emerald-green eyes. On her neck, she wears a black cyber choker with a glowing emerald crescent moon icon. Long light brown hair with voluminous loose curls, lifted half-up side sections and bright pink butterfly clips near the temples. Pink heart-shaped sunglasses rest on top of the head.\n\n"
        "[Outerwear]\n"
        "A cropped sleeveless indigo denim vest with a pointed collar, silver buttons, chest flap pockets, pink contrast stitching and small pale distressed marks.\n\n"
        "[Top]\n"
        "A fitted hot-pink cropped tank top with a white heart centered on the chest, exposing the midriff.\n\n"
        "[Bottom]\n"
        "Low-rise dark blue denim shorts with broad rolled cuffs showing pale denim underneath. Copper-pink topstitching outlines the fly, belt loops and curved pockets. A vivid pink belt has a large silver heart-shaped buckle.\n\n"
        "[Legwear and footwear]\n"
        "Ribbed thigh-high socks with broad alternating hot-pink and white stripes and pink top bands. Bare thighs show above the cuffs. Brown ankle boots have rounded toes, substantial dark soles, block heels, broad upper straps with square gold-toned buckles and additional diagonal straps across the front.\n\n"
        "[Accessories]\n"
        "A glossy translucent-pink rectangular shoulder bag with rounded corners, a pink strap, silver rings and a dangling white heart charm. A bracelet of clear pink round beads and milky white heart-shaped accents circles the right wrist."
    ),
    "nano": (
        "An adorably cute youngest girl with a bright, playful wink and warm ruby-pink eyes. On her neck, she wears a black cyber choker with a glowing pink heart icon. Very long dark brown hair tied into high twin ponytails, with soft bangs and long loose side sections. Red looped cord ornaments sit on both sides of the head, with white and gold bells and trailing red tassels.\n\n"
        "[Top]\n"
        "A white wrap-front top with a red-edged crossover collar and open shoulders. Red cords with small gold fittings run down the sides of the bodice. A small red cord bow with two hanging tassels decorates the chest. Separate white upper-arm sleeves widen into long bell shapes. Their broad openings are bordered with solid red bands and rows of short red rectangular marks.\n\n"
        "[Bottom]\n"
        "A high-waisted red pleated miniskirt with a broad red waistband. A large white bow at the front has two long tails ending in gold beads and red tassels. A matching large white bow decorates the back waist.\n\n"
        "[Legwear and footwear]\n"
        "White thigh-high socks with red interlocking diamond patterns around the top bands. Small red cord bows, gold bells and short red tassels decorate the outer sides of the cuffs. Bare thighs show above the socks. The white socks have divided big-toe sections inside red thong straps. Tall black platform sandals have gold lines around the soles and narrow black ankle straps with small gold buckles.\n\n"
        "[Accessories]\n"
        "An ivory gathered pouch hangs from a red-and-gold cord shoulder strap. A red flower-shaped cord knot, white beads and two red tassels decorate its front."
    ),
    "hina": (
        "A 16-year-old Japanese high school girl with slender, sharp facial features, a defined jawline, and a calm, slightly cool expression. Long dark brown hair in loose waves with layered bangs and a small curved strand at the crown. A tilted miniature royal-blue top hat has a silver band, a blue bow, a silver five-point star and short translucent white ribbon tails. Silver star drop earrings. Natural, clear eyes with a focused gaze and bright catchlights, a small refined nose, and natural lips. Her fair skin is completely smooth, clear, and flawless, featuring a subtle small facial mole on her cheek and a small mole on her shoulder for realistic detail, with no freckles, no blemishes, and no heavy makeup.\n\n"
        "[Top]\n"
        "A cropped white blouse with a high gathered neck frill and translucent short puff sleeves patterned with pale blue and pink diamonds. White cuffs have small silver buttons. A fitted royal-blue cropped vest overlays the blouse, with pointed lapels, silver piping, four round silver front buttons and blue-and-white shoulder frills. A silver outlined star decorates the upper back. The pointed vest hem leaves a narrow strip of midriff visible.\n\n"
        "[Bottom]\n"
        "Royal-blue fitted short shorts with silver-edged hems. A blue belt carries a large silver star at the front. A pointed blue hip flap edged in silver overlaps the right side, while cascading white ruffles hang from the left hip, with more white ruffles visible behind the right hip flap.\n\n"
        "[Legwear and footwear]\n"
        "White thigh-high socks with broad plain top bands, a silver star near each outer top and a narrow royal-blue stripe running down the outer side of each leg. Bare thighs show above the socks. White heeled lower-calf boots have subtle pale floral surface patterns, silver edging, front seams and blue outer-side bows with silver stars.\n\n"
        "[Accessories]\n"
        "White frilled wrist cuffs with royal-blue bows and silver star ornaments."
    ),
    "kohaku": (
        "A 16-year-old Japanese high school girl with a soft, youthful baby face, round features, and a calm, gentle expression. Very long light brown hair shading into rosy-pink ends, with loose flowing waves and soft bangs. Small high half-up sections are tied with pink bows and long trailing ribbons. A gold star clip decorates one temple. Gold star drop earrings and a fine gold necklace with a small star pendant. Large, natural hazel brown eyes with a gentle gaze and clear bright catchlights, a small low nose bridge, soft rounded cheeks, and full natural lips. Her skin is clear and smooth with a natural light skin tone, featuring a subtle small facial mole on her cheek for a realistic look, with no heavy makeup.\n\n"
        "[Outerwear]\n"
        "A short white bolero with rounded short sleeves, an open squared front and fine gold piping around its neckline, opening, cuffs and lower edge. Small gold loop-like ornaments sit along the front edges.\n\n"
        "[Top]\n"
        "A fitted pastel-pink camisole-style top with a softly squared neckline, vertical front seams, delicate gold edging and a small gold star at the center of the neckline.\n\n"
        "[Bottom]\n"
        "A short very pale lavender-gray pleated skirt with broad crisp folds, a flared hem and narrow gold edging. Two slender white straps edged in gold cross around the high waist, meeting at a raised gold star ornament at the front.\n\n"
        "[Legwear and footwear]\n"
        "White opaque thigh-high socks with two gold stripes near each top and a vertical row of three pink stars on each outer upper leg. Wide bare thigh gaps remain above the cuffs. White lace-up ankle boots have pale ribbon laces, gold eyelets, smooth rounded toes, thin gold edging around the soles and medium-height block heels."
    ),
}

def unload_ollama_vram(model_name: str = "muse-unce:latest"):
    """
    🧹 [VRAM最適化] OllamaモデルをVRAMから即座に破棄（アンロード）する。
    keep_alive: 0 を投げることで、GPUメモリを完全開放しサーマルスロットリングを防止する。
    """
    try:
        url = f"http://{OLLAMA_HOST}/api/generate"
        payload = json.dumps({
            "model": model_name,
            "keep_alive": 0
        }).encode("utf-8")
        
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=10) as res:
            pass
        print(f"🧹 [VRAM RELEASE] Ollamaモデル ({model_name}) のVRAM解放完了！")
    except Exception as e:
        print(f"⚠️ [WARN] Ollama VRAM解放リクエスト失敗 (継続処理可能): {e}")

def parse_llm_json_safely(raw_text: str) -> dict:
    """
    思考ログやシステムプロンプトのオウム返し（Example表記）を無視し、
    テキストの『一番最後』に出現する有効なJSONオブジェクト（{...}）を厳密抽出してパースする関数
    """
    json_blocks = re.findall(r'\{[\s\S]*?\}', raw_text)
    
    if not json_blocks:
        raise ValueError("テキスト内に有効なJSON構造（{...}）が見つかりませんでした。")

    json_str = json_blocks[-1]
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
        parsed_result = parse_llm_json_safely(raw_text)
        return parsed_result

    except Exception as e:
        print(f"[WARN] Ollama Realistic JSON解析失敗、デフォルト値へフォールバックします: {e}")
        return {
            "location": "clean minimalist indoor space, wooden desk",
            "action_and_objects": "sitting at a wooden desk, handling essential tools",
            "avoid_elements": "ABSOLUTELY NO clutter, NO dangerous tools",
            "camera_and_pose": "medium shot, natural seated pose",
            "expression_and_mood": "calm thoughtful expression, soft natural lighting"
        }
    finally:
        unload_ollama_vram("muse-unce:latest")

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
        parsed_result = parse_llm_json_safely(raw_text)
        return parsed_result

    except Exception as e:
        print(f"[WARN] Ollama Anime JSON解析失敗、デフォルト値へフォールバックします: {e}")
        return {
            "location": "vibrant anime background style, clean stylized background art",
            "action_and_objects": "sitting comfortably at a modern cafe table",
            "avoid_elements": "ABSOLUTELY NO realistic photorealistic elements, NO real human faces, NO camera noise",
            "camera_and_gaze": "medium shot, crisp anime art style",
            "style_and_lighting": "soft studio lighting, vibrant colors, highly detailed"
        }
    finally:
        unload_ollama_vram("muse-unce:latest")

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