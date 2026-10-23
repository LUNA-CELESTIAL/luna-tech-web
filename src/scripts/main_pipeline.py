import os
import json
import time
import shutil
import urllib.request
import urllib.parse
import traceback
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# 1. パスの安全な自動解決 (.env の厳密検出)
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent if SCRIPT_DIR.name == "scripts" else SCRIPT_DIR.parent

# PROJECT_ROOT 直下、または src/ 直下の .env を自律検索してロード
env_path = PROJECT_ROOT / ".env"
if not env_path.exists():
    env_path = PROJECT_ROOT / "src" / ".env"

load_dotenv(dotenv_path=env_path, override=True)

# 設定値（環境変数優先・安全なフォールバック付き）
COMFYUI_HOST = os.getenv("COMFYUI_HOST", "127.0.0.1:8188")
COMFYUI_OUTPUT_DIR = Path(os.getenv("COMFYUI_OUTPUT_DIR", str(PROJECT_ROOT.parent / "draw_agents" / "outputs")))
WEB_PUBLIC_IMAGE_DIR = Path(os.getenv("WEB_PUBLIC_IMAGE_DIR", str(PROJECT_ROOT / "public" / "images" / "phied")))
PHIED_JSON_PATH = PROJECT_ROOT / "src" / "data" / "phied.json"

# 🎬 モード制御フラグ (ENABLE_VIDEO_GEN 単一スイッチで制御)
# True  : パターンA（画像生成スキップ ＋ input/固定画像から5秒動画生成）
# False : パターンC（画像生成のみ ＋ 動画生成OFF）
ENABLE_VIDEO_GEN = os.getenv("ENABLE_VIDEO_GEN", "false").lower() == "true"
COOLING_INTERVAL_SEC = int(os.getenv("COOLING_INTERVAL_SEC", "120")) # 120秒GPUプレ冷却

print(f"📁 [.env ロード完了] 読み込み先: {env_path}")
print(f"⚙️ [パイプラインモード] {'【パターンA】動画モード (画像スキップ＋固定画像動画化)' if ENABLE_VIDEO_GEN else '【パターンC】画像モード (新画像生成＋動画OFF)'}")

# 内部モジュールの読み込み
from generate_phied import generate_post_data
from comfyui_client import generate_image_for_author
from generate_reply import process_auto_reply
from generate_minimax_video import generate_h3_video_for_post, generate_dynamic_video_prompt

def ensure_directories_and_files():
    """必要なディレクトリおよびファイルの存在を自律的に保証する安全網"""
    try:
        COMFYUI_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        WEB_PUBLIC_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
        PHIED_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)

        if not PHIED_JSON_PATH.exists():
            print(f"[WARN] {PHIED_JSON_PATH} が存在しないため、空リストで新規作成します。")
            with open(PHIED_JSON_PATH, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[ERROR] ディレクトリ/ファイル初期化中にエラーが発生しました: {e}")
        traceback.print_exc()
        raise e

def wait_for_comfyui_image(prompt_id: str, timeout_sec: int = 120) -> Path | None:
    """ComfyUI API (/history/{prompt_id}) をポーリングして画像生成完了を監視"""
    start_time = time.time()
    print(f"⏳ ComfyUI の画像生成完了を監視中 (Prompt ID: {prompt_id})...")

    while time.time() - start_time < timeout_sec:
        try:
            req = urllib.request.Request(f"http://{COMFYUI_HOST}/history/{prompt_id}")
            with urllib.request.urlopen(req) as response:
                history_data = json.loads(response.read().decode('utf-8'))

            if prompt_id in history_data:
                outputs = history_data[prompt_id].get("outputs", {})
                for node_id, node_output in outputs.items():
                    if "images" in node_output and len(node_output["images"]) > 0:
                        filename = node_output["images"][0]["filename"]
                        generated_image_path = COMFYUI_OUTPUT_DIR / filename
                        
                        if generated_image_path.exists():
                            print(f"🎉 画像生成完了を検知: {generated_image_path}")
                            return generated_image_path
        except Exception:
            pass

        time.sleep(3)

    print(f"[ERROR] 画像生成の監視がタイムアウトしました ({timeout_sec}秒)")
    return None

def run_pipeline(force_video: bool = None):
    """単一フラグでパターンAとパターンCを美しく制御する統合パイプライン"""
    print("🚀 === 自律投稿・マルチメディア生成・リプライ一気通貫パイプライン開始 ===")

    ensure_directories_and_files()

    # 引数指定があれば優先、無ければ .env の ENABLE_VIDEO_GEN を採用
    is_video_mode = force_video if force_video is not None else ENABLE_VIDEO_GEN

    try:
        # Step 1: 記事テキストの自動生成
        print("\n--- [Step 1/6] 記事テキスト生成 ---")
        post_data, author_id, agent_name = generate_post_data()
        print(f"📝 著者: {agent_name} ({author_id}) | タイプ: {post_data.get('type')} | タイトル: {post_data['title']}")

        now = datetime.now()
        commit_id = f"auto-{author_id}-{now.strftime('%Y%m%d%H%M%S')}"

        new_entry = {
            "commitId": commit_id,
            "type": post_data.get("type", "DAILY"),
            "source": post_data.get("source", ""),
            "date": now.strftime("%Y.%m.%d"),
            "status": "ONLINE",
            "author": author_id,
            "authorName": agent_name,
            "timestamp": now.strftime("%Y.%m.%d %H:%M"),
            "title": post_data["title"],
            "content": post_data["content"],
            "description": post_data["description"],
            "tags": post_data["tags"],
            "insights": post_data["insights"]
        }

        # Step 2 & 3 & 4: モード（is_video_mode）による明確な分岐
        if is_video_mode:
            # 🎬 【パターンA】動画モード（新画像生成をスキップし、ComfyUI input/ の固定画像から動画生成）
            print("\n--- [Step 2&3/6] ⏩ 画像生成スキップ: ComfyUI input/ の固定参照画像を使用します ---")

            print(f"\n--- [Step 4/6] 🎬 [{author_id.upper()}] 5秒アンビエント動画生成シーケンス開始 ---")
            
            # 1. Ollamaによる「無言・音楽＆モーション」プロンプトの自律生成
            print("🧠 [4a] Ollamaによる空間演出・アンビエントプロンプト構築中...")
            dynamic_prompt = generate_dynamic_video_prompt(author_id, post_data["title"], post_data["content"])

            # 2. 120秒 GPU プレ冷却
            print(f"❄️ [4b] {COOLING_INTERVAL_SEC}秒間GPUプレ冷却ガード発動（レンダリング直前の温度調整）...")
            try:
                for remaining in range(COOLING_INTERVAL_SEC, 0, -10):
                    print(f"⏳ 動画レンダリング開始まであと: {remaining} 秒...")
                    time.sleep(10)
            except KeyboardInterrupt:
                print("\n⚠️ [ABORT] 冷却シーケンスが手動割り込みされました。動画生成をスキップします。")
                is_video_mode = False

            if is_video_mode:
                print(f"🔥 [4c] 状態クリア！ComfyUI input/{author_id}.png を参照して MiniMax H3 レンダリング開始...")
                video_src = generate_h3_video_for_post(new_entry, dynamic_prompt=dynamic_prompt)
                
                if video_src:
                    new_entry["videoSrc"] = video_src
                    print(f"✨ 動画生成＆配置成功: {video_src}")
                else:
                    print("⚠️ [WARN] 動画生成に失敗したため、動画なしで投稿処理を継続します。")

        else:
            # 🎨 【パターンC】画像モード（新しく挿絵画像を生成し、動画はスキップ）
            print("\n--- [Step 2/6] キャラクター別プロンプト抽出 ＆ ComfyUI 画像Job 投入 ---")
            prompt_id = generate_image_for_author(author_id, post_data["content"])
            if not prompt_id:
                raise RuntimeError("ComfyUI への画像Job 投入に失敗しました。")

            print("\n--- [Step 3/6] 画像生成完了の待機 ＆ 公開ディレクトリへの配置 ---")
            generated_image = wait_for_comfyui_image(prompt_id)
            if not generated_image:
                raise RuntimeError("画像の生成確認が取れませんでした。")

            image_filename = f"phied_{author_id}_{now.strftime('%Y%m%d%H%M%S')}.png"
            target_image_path = WEB_PUBLIC_IMAGE_DIR / image_filename

            shutil.copy(generated_image, target_image_path)
            print(f"🚚 画像を配置完了: {target_image_path}")

            new_entry["imageSrc"] = f"/images/phied/{image_filename}"

            print("\n--- [Step 4/6] ⏩ 動画生成スキップ（ENABLE_VIDEO_GEN=false） ---")

        # Step 5: 親投稿を phied.json に先頭追加して保存
        print("\n--- [Step 5/6] 親投稿の phied.json への保存 ---")
        with open(PHIED_JSON_PATH, "r", encoding="utf-8") as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                print(f"[WARN] {PHIED_JSON_PATH} の破損を検知したためリセットします。")
                logs = []

        if "replyPatternHint" in post_data:
            new_entry["replyPatternHint"] = post_data["replyPatternHint"]

        logs.insert(0, new_entry)

        with open(PHIED_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(logs, f, ensure_ascii=False, indent=2)

        print(f"✨ 親投稿保存完了! (タイトル: {new_entry['title']})")

        # Step 6: 自律会話ラリー・リプライの生成 ＆ 上書き保存
        print("\n--- [Step 6/6] 自律会話ラリー・リプライの生成 ＆ 上書き保存 ---")
        process_auto_reply()

        print("\n🎉 === 全パイプライン正常完了！本番投稿が更新されました ===")

    except Exception as e:
        print("\n❌ パイプライン実行中にエラーが発生しました:")
        traceback.print_exc()
        raise e

if __name__ == "__main__":
    run_pipeline()