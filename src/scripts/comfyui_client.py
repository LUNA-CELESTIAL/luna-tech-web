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
        "a lovely long-haired girl with warm brown hair. She wears a modern Japanese-style pink outfit with soft frills. "
        "On her neck, she wears a black cyber choker with a glowing pink crown icon. eye Highlight. "
        "A black headband carries two exceptionally long black bunny ears with hot-pink inner panels, one upright and one bent sideways. "
        "Two small glossy red horns and black-and-pink bows sit at the ear bases. "
        "[Outerwear] A cropped hot-pink bolero has short rounded puff sleeves, black cuffs, pointed black-edged lapels and small silver studs. "
        "A black heart-and-arrow emblem sits on the left chest. The back has an open triangular area above a black horizontal strap with a small pink heart. "
        "[Top] A fitted glossy black sweetheart corset has hot-pink piping, curved bust panels, vertical seams, small metal fittings and a pink-edged black heart between the bust panels. "
        "Two short pointed front hem panels leave a strip of abdomen visible above the shorts. "
        "[Bottom] Fitted hot-pink short shorts have black edging, vertical side lines, small silver studs and small black bows at the outer leg openings. "
        "A broad black belt has a large black heart buckle outlined in hot pink and narrow pink-edged loops. "
        "[Legwear and footwear] Sheer black thigh-high stockings have broad floral lace tops, small pink bows and dark heart centers. "
        "Glossy black pointed-toe pumps have tall heels edged in pink and slim black ankle straps fastened with pink-edged heart buckles. "
        "[Accessories] Short black fingerless gloves have hot-pink heart patches and narrow pink wrist stripes. A black choker and small dangling earrings carry pink-edged hearts. "
        "A black heart-shaped hip bag has a large pink heart-and-arrow graphic, silver rings and a narrow black strap. "
        "Hot-pink bat-wing membranes have black ribs and one small black heart on each wing. A slender black tail ends in a large pointed heart divided into glossy black and hot-pink panels."
    ),
    "spica": (
        "a cool and beautiful girl with dark navy long hair. She has a calm and slightly distant expression with deep blue-green eyes. "
        "On her neck, she wears a black cyber choker with a glowing cyan globe icon. "
        "A broad black tricorn hat has gold edging, a central gold skull with bat wings and crossed bones, a long burgundy feather plume and a hanging gold coin chain. "
        "Two ridged red horns project through the front sides of the hat. "
        "[Blouse and corset] A cream off-the-shoulder blouse has a ruffled neckline, a small red front bow and elbow-length puff sleeves gathered into layered frilled cuffs. "
        "Brown shoulder straps with gold buckles pass over the bare shoulders. A fitted dark-brown leather corset has visible vertical panels, gold eyelets, crossed black front lacing and pointed lower edges. "
        "[Bottom] Black fitted short shorts sit beneath an open-front burgundy overskirt. Its long uneven side and back panels are edged in gold scrolling trim, with ragged navy underlayers and torn openings near the lower edges. "
        "A wide angled brown belt has a large gold rectangular buckle. Gold chains and round coin pendants drape over the right hip, while a small brown flap pouch with a gold skull plate and buckle sits at the left hip. "
        "A narrow brown buckled band with a hanging gold ring circles the left upper thigh. "
        "[Footwear] Brown leather knee-high boots have broad turned-down navy cuffs edged in gold, buckled leather straps around the upper shafts and ankles, shaped seams, softly creased legs, rounded toes and medium block heels. "
        "The thighs and knees remain bare above the boot tops. "
        "[Accessories] A black choker has small gold fittings, a red jewel and a hanging gold anchor. Gold earrings hold red oval stones and small rings. "
        "A broad brown studded cuff circles the right wrist; red cords and small coin pendants circle the left. A small gold ring sits on the right hand. "
        "Navy bat wings have aged-gold ribs, ragged perforated edges and burgundy patches outlined by visible gold stitches. "
        "A brown tail ends in a glossy burgundy spade, with gold rings and hanging coin charms beneath the tip."
    ),
    "sirius": (
        "energetic girl with vibrant pink short hair styled with small clips. She has a bright and confident smile with playful amber-golden eyes subtle neon accents. "
        "On her neck, she wears a black cyber choker with a glowing pink lightning icon. "
        "Large black ribbon bows and short silver chains sit near two curved dark graphite horns with black bases and small silver rings. "
        "[Top] An oversized charcoal knitted pullover with a broad ribbed diagonal neckline resting below the shoulders. A pale diamond-mesh inner top rises above the neckline to cover the upper chest and shoulders, beside thin black straps. "
        "The pullover has loose draped folds, a partly tucked front, long balloon sleeves and ribbed cuffs. Long open strips along the outer sleeves are crossed by pale grey ribbon lacing threaded through silver eyelets; loose ribbon ends hang near the cuffs. "
        "[Bottom] A very short grey-and-black tartan wrap skirt with angular overlapping front panels, an uneven pointed hem and small black buckled side straps. "
        "A black waist belt has a large round silver buckle, and two silver chain loops with pointed star pendants drape across the hips. "
        "[Legwear and footwear] Fine black diamond-fishnet tights cover the legs. A black thigh strap carries silver rings and small hanging pointed ornaments. "
        "Slouchy charcoal ribbed leg covers bunch around the lower calves and ankles, with pale crossed side lacing and small metal rings. "
        "Glossy black platform ankle boots have rounded reinforced toes, multiple broad silver-buckled straps, deep black tread, graphite-grey sole edges and tall block heels. "
        "[Accessories] A narrow black buckle choker holds a small pendant. Smoky black bat wings have thin dark ribs and silver chains with pointed star charms hanging from the outer tips. "
        "A thin black tail curves to a broad graphite spade-heart tip, with a short silver chain and pointed star pendant beneath it."
    ),
    "stella": (
        "a cute and energetic girl with warm amber-brown short hair with a small braid. She has a curious and determined expression with bright golden-amber eyes. "
        "On her neck, she wears a black cyber choker with a glowing amber gear icon. "
        "Two curved bronze horns have segmented spiral ridges. Round bronze-rimmed goggles sit across their roots on a dark strap, and small gold gear-and-key earrings hang beside the hair. "
        "[Blouse and waistcoat] An ivory blouse has a small stand collar, a large curved chest opening, narrow decorative lines, long lightly puffed sleeves and fitted cuffs with gold buttons. "
        "Dark brown buckled bands circle the upper arms. A short fitted dark-brown waistcoat has bronze-edged curved panels, shoulder straps, small brass fittings and overlapping buckled bands below the bust. "
        "On the back, dark straps cross around a large round brass gear ornament between the wing roots. "
        "[Bottom] Camel high-waisted shorts have rounded front tucks and short turned hems. A narrow brown waist belt carries brass buckles, loops and small rings. "
        "Short split dark-leather apron panels hang over the outer thighs, with rounded lower edges, rows of brass rivets, fine border stitching and small straps and buckles. "
        "A dark-brown flap pouch sits at one hip, and a brass chain with a small wheel-shaped charm drapes across the front. A narrow brown buckled band circles the left upper thigh. "
        "[Legwear and footwear] Smooth sheer warm-brown tights cover both legs. Dark-brown lower-calf gaiters have broad buckled bands and overlapping leather panels. "
        "Heavy brown ankle boots have several large brass-buckled straps, ribbed bronze toe caps, thick dark soles and low block heels. "
        "[Accessories] Amber-brown bat-wing membranes sit within articulated bronze ribs, with circular gear-shaped joints, small bolts and long hooked lower tips. "
        "A segmented bronze-and-brown tail has regularly spaced brass collars and a large elongated faceted arrowhead with raised angular ridges."
    ),
    "selene": (
        "a graceful and sweet girl with elegant long silver-purple hair in a soft half-up style with layered side-swept bangs, small side braids and purple ribbon bows. "
        "Two glossy violet horns curve upward and outward, with fine pale bands and small hanging faceted charms near their bases. "
        "She has a gentle and slightly shy expression with glowing emerald-green eyes. On her neck, she wears a black cyber choker with a glowing emerald crescent moon icon. "
        "[Capelet] A short midnight-blue capelet has a high collar, gold piping, scattered gold stars and fine constellation lines. "
        "Its layered scalloped edge has a sheer pale-lavender ruffled border. A gold crescent surrounding a pale round jewel closes the front above a small hanging violet crystal. "
        "A large gold circular star chart and crescent decorate the back. "
        "[Top] A fitted deep-violet velvet sweetheart bustier with shaped vertical panels, three pale-gold four-pointed star clasps down the front and two pointed lower tips. "
        "The dark back panel has central crossed lacing. The upper chest is bare between the bustier and capelet, and a narrow strip of midriff separates the bustier from the waist belt. "
        "[Bottom] A short full skirt with overlapping pointed and flared panels, shifting from midnight blue to violet and lavender toward the hem. "
        "Small pale stars and bright diamond shapes cover the fabric, with lavender ruffles beneath the uneven hem. A black belt with gold fittings circles the waist; fine gold chains and hanging violet-and-white crystal drops drape over the hips. "
        "[Legwear and footwear] Sheer smoky-violet tights carry pale star constellations and fine dotted connecting lines. "
        "Metallic silver-lavender ankle boots have purple front lacing, shaped toe panels, block heels and buckled upper straps with small crescent ornaments. "
        "[Accessories] A narrow dark choker with a small pale oval fitting sits above the capelet collar. A dark book-shaped hip bag has pale-gold borders, a circular crescent-and-star design and a chain strap. "
        "Purple ribbon wrist bows carry small faceted pendants, and long earrings combine circular metal shapes with small hanging crystals. "
        "Lavender bat wings have dark-violet ribs, scattered pale-gold stars and dangling star and diamond charms. A thin purple tail ends in a silver crescent with a small suspended violet crystal."
    ),
    "nano": (
        "cute youngest girl with soft pastel cream-colored bob hair featuring vibrant orange-gradient tips. She has a bright, playful wink with warm ruby-pink eyes. "
        "On her neck, she wears a black cyber choker with a glowing pink heart icon. "
        "A black two-pointed drooping cloth hat has magenta and turquoise inset panels, small pointed metal decorations, ribbon bows and long diamond-shaped gem pendants at the two tips. "
        "Two segmented black horns with magenta tips rise in front of the hat. Small magenta and turquoise bows cluster around the horn roots. "
        "[Top] A fitted black corset has a curved sweetheart edge with fine pale lace trim, magenta and turquoise vertical side panels and small heart and diamond-shaped metal ornaments down the center. "
        "A magenta heart jewel sits between the bust panels. Narrow black shoulder straps have small rectangular buckles, and the back has magenta crossed lacing. "
        "Separate short black puff sleeves and layered arm ruffles have small magenta-and-turquoise ribbon bows. "
        "Several diagonal black waist belts carry champagne-toned metal buckles and rings; fine chains loop across the hips. "
        "[Bottom] A very short, exceptionally full layered skirt has magenta upper panels patterned with dark bat, heart and curling motifs, turquoise lower panels with dark ornamental patterns, "
        "thin pale ruffled edges and broad black ruffles and lace between and beneath the colored layers. "
        "Black-and-colored bows, small heart fittings, pointed ribbon tails and suspended diamond-shaped gems decorate the hips and skirt sides. "
        "[Legwear and footwear] The thigh-high stockings form a mismatched pair: one has broad magenta-and-black horizontal stripes and the other turquoise-and-black stripes. "
        "Wide black thigh bands sit above the stockings, with narrow suspender straps, metal rings, short chains and colored diamond pendants. "
        "Glossy black calf boots have thick black fur cuffs, tall block heels, heavy front platforms, deep tread soles, crossed buckled straps and colored inserts. Magenta diamond-shaped charms hang near the outer boot straps. "
        "[Accessories] Short black fingerless gloves have ruffled cuffs and colored bows. A black buckle choker holds a turquoise jewel, and small earrings carry colored diamond drops. "
        "The bat wings form a two-color pair, one with a magenta membrane and the other turquoise, both with black ribs and pointed edges. "
        "A thin black tail ends in a glossy magenta-and-black pointed heart, with a small metal bell and a magenta diamond pendant hanging below it."
    ),
    "hina": (
        "A candid, raw studio portrait photo of a 16-year-old Japanese high school girl with slender, sharp facial features and a defined jawline. "
        "She is looking directly into the camera lens with a calm, slightly cool expression. Her hair is brown with subtle pink tips, styled in a high ponytail with swept bangs and an orange-and-black striped bow at each side. "
        "A black headband carries two smooth curved black horns and small orange jack-o'-lantern ornaments with green leaves. "
        "She has natural, clear eyes with a focused gaze and bright catchlights, a small refined nose, and natural lips. Her fair skin is completely smooth, clear, and flawless, featuring a subtle small facial mole on her cheek and a small mole on her shoulder for realistic detail, with no freckles, no blemishes, and no heavy makeup. "
        "[Outfit] A pumpkin-orange outfit has a gathered low square neckline edged in black scallops, three small black front buttons and rounded short puff sleeves. The sleeves end in orange ruffles, narrow black bands and black bows. "
        "A wide black corset waist has tall curved panels, metal eyelets, bright orange crisscross front lacing and an orange bow above long dark ribbon ends. The back has narrow black shoulder straps, a low open upper-back area and black waist lacing. "
        "The lower section forms very short rounded balloon shorts with deep orange folds and pointed black triangular edging around the leg openings. "
        "[Legwear and footwear] Broad orange-and-black horizontal stripes cover thigh-high stockings, with black top bands and small purple bows at the outer thighs. Glossy black mid-calf platform boots have rounded toes, front lacing, two broad straps with large silver rectangular buckles, orange trim inside the tops and very thick lug soles. "
        "[Accessories] An orange pumpkin pendant sits on a black choker with small purple and dark beads. Small pumpkin earrings hang beside the hair. Orange ruffled wrist cuffs have black ribbon ties. "
        "A rounded orange pumpkin hip bag has a green stem and leaves, a black triangular-eyed zigzag jack-o'-lantern face, a purple star detail and black edging. Orange bat wings have black ribs, pointed tips and black scalloped trim. "
        "A black tail ends in an orange pointed heart-arrow tip, with purple and black-and-orange wrapped-candy charms hanging from a small bow near the end."
    ),
    "kohaku": (
        "A candid, raw studio portrait photo of a 16-year-old Japanese high school girl with a soft, youthful baby face and round features. "
        "She is looking directly into the camera lens with a calm, gentle expression. Her hair is light ash brown, styled in a messy low side ponytail on the left with loose strands framing her face and curtain bangs accented by a small dark-red star-shaped ornament. "
        "Two glossy segmented blue-black horns curve upward. Small red-and-silver drop earrings hang beside the hair. "
        "She has large, natural hazel brown eyes with a gentle gaze and clear bright catchlights, a small low nose bridge, soft rounded cheeks, and full natural lips. Her skin is clear and smooth with a natural light skin tone, featuring a subtle small facial mole on her cheek for a realistic look, with no heavy makeup. "
        "[Top] A dark-navy cropped sailor-collar jacket has broad pointed front collar panels and a rectangular back collar bordered by two narrow cream stripes. A large mulberry bow at the chest has a small silver bat-shaped central brooch. "
        "Dark diamond mesh fills the area above the neckline below a high black lace choker. The long sleeves have softly gathered shoulders, silver eyelets and mulberry ribbon lacing along the outer forearms. Cream-striped cuffs end in black lace frills. "
        "A wide black leather corset belt has pointed front panels, two horizontal silver-buckled straps, small rivets and central back lacing. Fine silver chains and narrow red crystal pendants hang from the hips. "
        "[Bottom] A very short full navy box-pleated skirt has mulberry inset panels between the dark pleats. Small dark ornamental motifs sit near the hem, with a narrow black floral-lace underlayer extending below it. "
        "[Legwear and footwear] Continuous sheer charcoal tights cover the legs. Glossy black platform ankle boots have rounded toes, several broad buckled straps, small pointed silver ornaments, thick front platforms and tall block heels with mulberry-red rear faces. "
        "[Accessories] Broad mulberry bat-wing membranes are divided by dark navy-black ribs, with sharply hooked outer tips, pointed lower edges and silver star-shaped fittings near the upper tips and diamond-shaped pendants at the lower points. "
        "A thin dark tail ends in a glossy pointed heart with mulberry inner panels and a small silver fitting above it."
    )
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