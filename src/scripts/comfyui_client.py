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

# 🎯 モデル定義（メンバーごとに適用するモデルを切り替え）
MODEL_HINA_KOHAKU = "moodyCutieMixFreeKrea2_v60_int8.safetensors"
MODEL_LUNA_OTHERS = "krea2_anime_tuned_turbo_fp8_scaled.safetensors"

def unload_ollama_vram(model_name: str = "muse-unce:latest"):
    """
    🧹 [VRAM最適化] OllamaモデルをVRAMから即座に破棄（アンロード）する。
    """
    try:
        url = f"http://{OLLAMA_HOST}/api/generate"
        payload = json.dumps({
            "model": model_name,
            "keep_alive": 0
        }).encode("utf-8")
        
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=5) as res:
            pass
        print(f"🧹 [VRAM RELEASE] Ollamaモデル ({model_name}) のVRAM解放完了！")
    except Exception as e:
        print(f"⚠️ [WARN] Ollama VRAM解放リクエスト失敗 (ログ出力のみで処理継続): {e}")

def parse_llm_json_safely(raw_text: str) -> dict:
    """
    テキストの『一番最後』に出現する有効なJSONオブジェクト（{...}）を厳密抽出してパース
    """
    json_blocks = re.findall(r'\{[\s\S]*?\}', raw_text)
    
    if not json_blocks:
        raise ValueError("テキスト内に有効なJSON構造が見つかりませんでした。")

    json_str = json_blocks[-1]
    json_str = re.sub(r',\s*([}\]])', r'\1', json_str)
    json_str = re.sub(r"(?<=[\{\,])\s*\'([^\']+)\'\s*:", r'"\1":', json_str)

    return json.loads(json_str)

def generate_scene_and_action_json(tweet_text: str, is_realistic: bool) -> dict:
    """
    【情景と行動限定】スタイル（実写 vs イラスト）ごとに抽出ルールを分離。
    アイテムを禁止するのではなく、明るい色合い・パステルカラーの可愛いアイテムとして描写させる。
    """
    common_rules = (
        "CRITICAL RULES:\n"
        "- ABSOLUTELY NO clothing details, NO outfit descriptions (e.g., shirt, dress, jacket, shoes, skirt, color of clothes).\n"
        "- ABSOLUTELY NO facial hair or hair styling details.\n"
        "- PROP & COLOR RULE: When including props or items (such as a smartphone, mug, bag, book, or stationery), NEVER describe them as black, dark, or plain. Always style them as cute items in pastel colors, white, or bright soft tones (e.g., 'a smartphone in a cute pastel pink case', 'a bright cream-colored mug').\n"
        "- Focus strictly on: WHERE she is, WHAT cute/bright item she is holding or interacting with (if relevant to the tweet), and WHERE she is looking.\n\n"
    )

    if is_realistic:
        # 実写写真風（ひな・こはく専用）の抽出プロンプト
        style_instruction = (
            "You are an expert AI prompt engineer extracting natural, candid everyday 'Location/Environment' and 'Action/Gaze' keywords for realistic photography.\n"
            f"{common_rules}"
            "Example Output Format:\n"
            "{\n"
            '  "focus_and_action": "medium close-up shot, eyes focused directly on the cookies on a pastel plate, calm happy expression, holding a baking tray with chocolate chip cookies",\n'
            '  "environment_and_situation": "bright cozy kitchen setup, clean white countertops, soft natural daylight from window, indoor plants on shelf, clean and bright atmosphere"\n'
            "}\n\n"
        )
    else:
        # 可愛いイラスト風（ルナ・スピカ・シリウス・ステラ・セレーネ・ナノ専用）の抽出プロンプト
        style_instruction = (
            "You are an expert AI prompt engineer extracting cute, gentle, heartwarming 'Location/Environment' and 'Action/Gaze' keywords for a cute 2D character illustration.\n"
            "Avoid harsh, overly dramatic, or modern gritty anime descriptions. Keep the scene soft, adorable, and bright.\n"
            f"{common_rules}"
            "Example Output Format:\n"
            "{\n"
            '  "focus_and_action": "knee-up shot, smiling warmly while holding a cute pastel-colored teacup with both hands, gentle happy expression, looking slightly toward the viewer",\n'
            '  "environment_and_situation": "bright cozy cafe table with pastel accents, soft warm daylight, gentle bokeh background, clean and cute atmosphere"\n'
            "}\n\n"
        )

    system_prompt = (
        f"{style_instruction}"
        "Output ONLY a raw JSON object with the exact keys shown above. Do NOT output any thinking, text, markdown blocks, or commentary.\n\n"
        f"Input Tweet: {tweet_text}\n"
        "JSON Output:"
    )

    try:
        response = ollama.generate(model="muse-unce:latest", prompt=system_prompt)
        raw_text = response.get('response', '').strip()
        parsed_result = parse_llm_json_safely(raw_text)
        return parsed_result

    except Exception as e:
        print(f"[WARN] Ollama JSON解析失敗、デフォルト情景へフォールバックします: {e}")
        print(f"[DEBUG] 詳細スタックトレース:\n{traceback.format_exc()}")
        if is_realistic:
            return {
                "focus_and_action": "medium close-up shot, eyes naturally focused on her immediate task, calm expression, natural focus",
                "environment_and_situation": "clean bright indoor space, soft natural daylight, simple cute setup"
            }
        else:
            return {
                "focus_and_action": "knee-up shot, smiling gently with a cute expression, relaxed natural pose",
                "environment_and_situation": "bright cozy room with soft pastel tones, gentle warm lighting, clean cute background"
            }
    finally:
        unload_ollama_vram("muse-unce:latest")


def build_edit_prompt_from_tweet(author_id: str, tweet_text: str) -> str:
    """
    メンバー（イラスト vs 実写）ごとにスタイル表現を動的に分離。
    """
    is_realistic = author_id in ["hina", "kohaku"]
    data = generate_scene_and_action_json(tweet_text, is_realistic=is_realistic)

    focus_action = data.get("focus_and_action", "").strip()
    environment = data.get("environment_and_situation", "").strip()

    if is_realistic:
        # 実写写真風スタイル（ひな・こはく専用）
        prompt = (
            f"change her\n"
            f"A candid raw lifestyle photo, unposed moment.\n\n"
            f"[Focus & Action]\n{focus_action}, natural focus, candid photo, bright soft lighting, high quality, masterpiece.\n\n"
            f"[Environment & Situation]\n{environment}.\n\n"
            f"[Character Identity]\n"
            f"A 16-year-old Japanese high school girl with slender, sharp facial features, a defined jawline, and a calm expression. "
            f"Natural, clear eyes with a focused gaze and bright catchlights. "
            f"Her fair skin is completely smooth, clear, and flawless, featuring a subtle small facial mole on her cheek for realistic detail."
        )
    else:
        # 可愛いイラストスタイル（ルナ、スピカ、シリウス、ステラ、セレーネ、ナノ専用）
        # モダンアニメ調を排除し、元画像の可愛いタッチと明るい色調を維持
        prompt = (
            f"change her\n"
            f"[Focus & Action]\n{focus_action}, cute soft illustration style, gentle expressive eyes, adorable pastel atmosphere, keeping original character design.\n\n"
            f"[Environment & Situation]\n{environment}, cute soft-toned background illustration."
        )
    
    return prompt

def queue_comfyui_generation(prompt_text: str, reference_image_name: str, unet_model_name: str) -> str:
    """
    ComfyUI API へジョブ投入。
    ノードID（55, 72, 84）または class_type で動的に探索してパラメータを挿入。
    """
    if not JSON_WORKFLOW_PATH.exists():
        print(f"[ERROR] ワークフローJSONが存在しません: {JSON_WORKFLOW_PATH}")
        return ""

    try:
        with open(JSON_WORKFLOW_PATH, "r", encoding="utf-8") as f:
            workflow = json.load(f)

        # 1. 参照画像ノードの書き換え (LoadImage)
        image_node_found = False
        if "72" in workflow and workflow["72"].get("class_type") == "LoadImage":
            workflow["72"]["inputs"]["image"] = reference_image_name
            image_node_found = True
        else:
            for node_id, node_data in workflow.items():
                if node_data.get("class_type") == "LoadImage":
                    node_data["inputs"]["image"] = reference_image_name
                    image_node_found = True
                    break
        
        if not image_node_found:
            print("[ERROR] LoadImage ノードが見つかりません。")
            return ""

        # 2. プロンプトノードの書き換え (Krea2EditGroundedEncode または CLIPTextEncode)
        prompt_node_found = False
        if "84" in workflow:
            workflow["84"]["inputs"]["prompt"] = prompt_text
            prompt_node_found = True
        else:
            for node_id, node_data in workflow.items():
                if node_data.get("class_type") in ["Krea2EditGroundedEncode", "CLIPTextEncode"]:
                    if node_id != "85":  # ネガティブプロンプト用ノード(85)を回避
                        node_data["inputs"]["prompt"] = prompt_text
                        prompt_node_found = True
                        break

        if not prompt_node_found:
            print("[ERROR] プロンプト注入対象のノードが見つかりません。")
            return ""

        # 3. モデルノードの書き換え (UNETLoader)
        model_node_found = False
        if "55" in workflow and "inputs" in workflow["55"]:
            workflow["55"]["inputs"]["unet_name"] = unet_model_name
            model_node_found = True
        else:
            for node_id, node_data in workflow.items():
                if node_data.get("class_type") == "UNETLoader":
                    node_data["inputs"]["unet_name"] = unet_model_name
                    model_node_found = True
                    break

        if model_node_found:
            print(f"⚙️ Diffusion Model 設定: {unet_model_name}")
        else:
            print("[WARN] UNETLoader ノードが見つかりませんでした。デフォルト値で実行を続行します。")

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
            print(f"[SUCCESS] ComfyUI ジョブ登録完了! Prompt ID: {prompt_id} (Ref: {reference_image_name} | Model: {unet_model_name})")
            return prompt_id

    except Exception as e:
        print(f"[ERROR] ComfyUI API 接続エラー: {e}")
        traceback.print_exc()
        return ""

def generate_image_for_author(author_id: str, tweet_content: str) -> str:
    """
    著者IDに応じたモデル振り分けと参照画像選定を実施。
    hina/kohaku -> MODEL_HINA_KOHAKU
    それ以外のメンバー -> MODEL_LUNA_OTHERS
    """
    ref_image_name = f"{author_id}.png"
    
    # 🎯 メンバーごとの使用モデル自動判定
    if author_id in ["hina", "kohaku"]:
        selected_model = MODEL_HINA_KOHAKU
    else:
        selected_model = MODEL_LUNA_OTHERS

    # 🎯 著者IDを渡してプロンプトスタイルを正しく分岐
    final_prompt = build_edit_prompt_from_tweet(author_id, tweet_content)

    print(f"🎨 キャラクター生成準備: {author_id} (参照画像: {ref_image_name} | 指定モデル: {selected_model})")
    print(f"📝 注入プロンプト:\n----------------------------------------\n{final_prompt}\n----------------------------------------")

    return queue_comfyui_generation(final_prompt, reference_image_name=ref_image_name, unet_model_name=selected_model)