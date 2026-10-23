import os
import json
import time
import urllib.request
import urllib.parse
import traceback
from pathlib import Path
import shutil  # 👈 これを追加！
from dotenv import load_dotenv

# 1. パスの安全な自動解決 (.env の厳密検出)
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent if SCRIPT_DIR.name == "scripts" else SCRIPT_DIR.parent

env_path = PROJECT_ROOT / ".env"
if not env_path.exists():
    env_path = PROJECT_ROOT / "src" / ".env"

load_dotenv(dotenv_path=env_path, override=True)

# 設定値（環境変数からの読み込みとフォールバック）
COMFYUI_HOST = os.getenv("COMFYUI_HOST", "127.0.0.1:8188")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")

env_input_dir = os.getenv("COMFYUI_INPUT_DIR")
if env_input_dir:
    COMFYUI_INPUT_DIR = Path(env_input_dir).resolve()
else:
    COMFYUI_INPUT_DIR = Path("/home/lulu/comfy/ComfyUI/input").resolve()
COMFYUI_OUTPUT_DIR = Path(os.getenv("COMFYUI_OUTPUT_DIR", str(PROJECT_ROOT.parent / "draw_agents" / "outputs")))
WEB_PUBLIC_VIDEO_DIR = Path(os.getenv("WEB_PUBLIC_VIDEO_DIR", str(PROJECT_ROOT / "public" / "videos" / "phied")))
WORKFLOW_JSON_PATH = PROJECT_ROOT / "src" / "scripts" / "MiniMax.json"

def unload_ollama_vram(model_name: str = OLLAMA_MODEL):
    """
    🧹 [VRAM最適化] OllamaモデルをVRAMから即座に破棄（アンロード）する。
    keep_alive: 0 を投げることで、GPUメモリを完全開放しサーマルスロットリングを防止する。
    """
    print(f"🧹 [VRAM RELEASE] Ollamaモデル ({model_name}) のVRAM解放をリクエスト中...")
    try:
        url = f"http://{OLLAMA_HOST}/api/generate"
        payload = json.dumps({
            "model": model_name,
            "keep_alive": 0
        }).encode("utf-8")
        
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=10) as res:
            pass
        print(f"✨ [VRAM RELEASE] VRAM解放成功！GPUメモリがクリアされました。")
    except Exception as e:
        print(f"⚠️ [WARN] Ollama VRAM解放失敗 (継続処理可能): {e}")

def generate_dynamic_video_prompt(author_id: str, title: str, content: str) -> str:
    """Ollamaを使用して無言・アンビエント演出用の動画生成プロンプトを構築"""
    print(f"🧠 [{author_id.upper()}] Ollama ({OLLAMA_MODEL}) によるアンビエントプロンプト生成開始...")

    system_prompt = (
        "You are an expert prompt engineer for MiniMax H3 Image-to-Video model.\n"
        "Generate a short video motion prompt based on the article content.\n"
        "STRICT RULES:\n"
        "1. DO NOT describe any character physical features (NO hair color, NO ponytail, NO clothing, NO age).\n"
        "2. DO NOT include timestamp brackets (like [0.00s-1.50s]) or Audio instructions.\n"
        "3. Focus ONLY on: camera movement (slow pan/zoom), subtle body motion, lighting, and mood.\n"
        "4. Output strictly in this format as a single-line English string:\n"
        "   'High quality ambient video based on input image. [Camera Movement]. [Subtle Motion & Mood]. Smooth transitions, 8k resolution.'"
    )

    user_prompt = f"Author Agent: {author_id}\nArticle Title: {title}\nArticle Content Summary: {content[:200]}"

    try:
        url = f"http://{OLLAMA_HOST}/api/generate"
        payload = json.dumps({
            "model": OLLAMA_MODEL,
            "system": system_prompt,
            "prompt": user_prompt,
            "stream": False,
            "options": {"temperature": 0.7}
        }).encode("utf-8")

        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=30) as res:
            data = json.loads(res.read().decode("utf-8"))
            prompt_text = data.get("response", "").strip().replace("\n", " ")
            print(f"💡 [LLM Generated Prompt]: {prompt_text}")
            
            # 🚨 必須: 推論完了直後に即座にVRAMからモデルをアンロード！
            unload_ollama_vram(OLLAMA_MODEL)
            return prompt_text

    except Exception as e:
        print(f"⚠️ [WARN] Ollamaプロンプト生成失敗。デフォルトアンビエントプロンプトを使用します: {e}")
        unload_ollama_vram(OLLAMA_MODEL)
        return "cinematic atmosphere, subtle ambient motion, soft lighting, calm mood, slow camera pan, high quality, 4k resolution"

def generate_h3_video_for_post(post_entry: dict, dynamic_prompt: str = None) -> str | None:
    """MiniMax H3 ワークフローを制御し、5秒動画をレンダリング配置する"""
    author_id = post_entry.get("author", "luna").lower()
    commit_id = post_entry.get("commitId", f"post-{int(time.time())}")

    # 1. 入力参照画像の特定（絶対パスで厳密チェック）
    source_image_filename = f"{author_id}.png"
    input_image_path = COMFYUI_INPUT_DIR / source_image_filename

    if not input_image_path.exists():
        print(f"❌ [ERROR] 参照画像が見つかりません: {input_image_path}")
        print(f"🔍 検索ディレクトリ: {COMFYUI_INPUT_DIR}")
        return None

    print(f"🖼️ [INPUT IMAGE CONFIRMED] 参照画像を確定: {input_image_path}")

    # 2. MiniMax.json ワークフローの読み込み
    if not WORKFLOW_JSON_PATH.exists():
        print(f"❌ [ERROR] ワークフロー定義ファイルが存在しません: {WORKFLOW_JSON_PATH}")
        return None

    with open(WORKFLOW_JSON_PATH, "r", encoding="utf-8") as f:
        workflow = json.load(f)

    # 3. ワークフローノードの引数注入（画像名とプロンプトの完全上書き）
    # 画像入力ノード（114番ノード）に参照画像名を確実にセット
    if "114" in workflow and "inputs" in workflow["114"]:
        workflow["114"]["inputs"]["image"] = source_image_filename
        print(f"✨ [IMAGE INJECT] 114番ノードへ {source_image_filename} を注入完了！")
    else:
        print(f"⚠️ [WARN] 114番ノードが見つかりません。デフォルト画像で走る危険があります！")

    # プロンプトノード（105_104番ノード）に動的プロンプトを注入
    prompt_injected = False
    if "105_104" in workflow and "inputs" in workflow["105_104"]:
        workflow["105_104"]["inputs"]["prompt"] = dynamic_prompt
        prompt_injected = True
        print(f"✨ [PROMPT INJECT] 105_104 番ノードへ演出プロンプトを正常注入完了！")

    if not prompt_injected:
        print("⚠️ [WARN] プロンプト注入用ノードの特定に失敗しました。")

    # 4. ComfyUI API (/prompt) へジョブ送信
    print(f"🚀 ComfyUI (/prompt) へ MiniMax H3 動画レンダリングJob送信中...")
    try:
        p_data = json.dumps({"prompt": workflow}).encode("utf-8")
        req = urllib.request.Request(f"http://{COMFYUI_HOST}/prompt", data=p_data, headers={"Content-Type": "application/json"})
        
        with urllib.request.urlopen(req) as response:
            res_json = json.loads(response.read().decode("utf-8"))
            prompt_id = res_json.get("prompt_id")
            print(f"✅ 動画生成Job登録完了 (Prompt ID: {prompt_id})")

    except Exception as e:
        print(f"❌ [ERROR] ComfyUI ジョブ送信エラー: {e}")
        traceback.print_exc()
        return None

    # 5. 生成完了の監視 (/history/{prompt_id})
    start_time = time.time()
    timeout_sec = 400  # ⏳ ルルからの共有通り 400秒に設定
    generated_video_path = None

    # 出力先候補ディレクトリの完全網羅（環境変数・実測パス・ComfyUI標準）
    candidate_dirs = [
        COMFYUI_OUTPUT_DIR,
        COMFYUI_OUTPUT_DIR / "video",
        PROJECT_ROOT / "draw_agents" / "outputs" / "video",
        Path("/home/lulu/comfy/ComfyUI/output/video").resolve(),
        Path("/home/lulu/comfy/ComfyUI/output").resolve()
    ]

    while time.time() - start_time < timeout_sec:
        try:
            req = urllib.request.Request(f"http://{COMFYUI_HOST}/history/{prompt_id}")
            with urllib.request.urlopen(req) as response:
                history = json.loads(response.read().decode("utf-8"))

            if prompt_id in history:
                status = history[prompt_id].get("status", {})
                if status.get("status_str") == "error":
                    print(f"❌ [ERROR] ComfyUI内部でレンダリングエラー発生: {history[prompt_id]}")
                    return None

                outputs = history[prompt_id].get("outputs", {})
                for node_id, node_output in outputs.items():
                    # gifs / videos / images キーを安全に抽出
                    video_list = node_output.get("gifs", []) or node_output.get("videos", []) or node_output.get("images", [])
                    if video_list:
                        out_info = video_list[0]
                        out_filename = out_info.get("filename")
                        subfolder = out_info.get("subfolder", "")

                        # 各検索候補ディレクトリからファイルの実在を確認
                        for target_dir in candidate_dirs:
                            check_path = target_dir / subfolder / out_filename if subfolder else target_dir / out_filename
                            if check_path.exists():
                                generated_video_path = check_path
                                break

                        if generated_video_path:
                            print(f"🎉 動画生成完了を検知: {generated_video_path}")
                            break

                if generated_video_path:
                    break
        except Exception as e:
            # デバッグ用にログを薄く出力（ループを潰さない）
            pass

        time.sleep(5)

    if not generated_video_path or not generated_video_path.exists():
        print(f"❌ [ERROR] 動画生成がタイムアウトまたはファイル出力失敗 ({timeout_sec}秒)")
        return None
    # 6. public/videos/phied/ への配置
    WEB_PUBLIC_VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    target_video_filename = f"phied_{author_id}_{commit_id}.mp4"
    target_video_path = WEB_PUBLIC_VIDEO_DIR / target_video_filename

    shutil.copy(generated_video_path, target_video_path)
    print(f"🚚 動画配置完了: {target_video_path}")

    return f"/videos/phied/{target_video_filename}"
    # 6. public/videos/phied/ への配置
    WEB_PUBLIC_VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    target_video_filename = f"phied_{author_id}_{commit_id}.mp4"
    target_video_path = WEB_PUBLIC_VIDEO_DIR / target_video_filename

    shutil.copy(generated_video_path, target_video_path)
    print(f"🚚 動画配置完了: {target_video_path}")

    return f"/videos/phied/{target_video_filename}"