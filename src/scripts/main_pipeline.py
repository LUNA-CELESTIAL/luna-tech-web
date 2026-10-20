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

# 設定値（確定パスと環境変数）
COMFYUI_HOST = os.getenv("COMFYUI_HOST", "127.0.0.1:8188")
COMFYUI_OUTPUT_DIR = Path("/home/lulu/luna/luna_docker/draw_agents/outputs")
WEB_PUBLIC_IMAGE_DIR = Path("/home/lulu/luna/luna_docker/luna-tech-web/public/images/phied")
PHIED_JSON_PATH = PROJECT_ROOT / "src" / "data" / "phied.json"

# 別モジュールから必要な関数のみをインポート
from generate_phied import generate_post_data
from comfyui_client import generate_image_for_author

def wait_for_comfyui_image(prompt_id: str, timeout_sec: int = 120) -> Path | None:
    """ComfyUI API (/history/{prompt_id}) をポーリングして生成完了を監視"""
    start_time = time.time()
    print(f"⏳ ComfyUI の生成完了を監視中 (Prompt ID: {prompt_id})...")

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

def run_pipeline():
    """全8メンバー対応の自律投稿＆挿絵自動生成パイプライン"""
    print("🚀 === 自律投稿＆挿絵自動生成パイプライン開始 ===")

    try:
        # Step 1: 記事テキストの自動生成
        print("\n--- [Step 1/4] 記事テキスト生成 ---")
        post_data, author_id, agent_name = generate_post_data()
        print(f"📝 著者: {agent_name} ({author_id}) | タイトル: {post_data['title']}")

        # Step 2: 著者に応じたモデル・画像・プロンプトで ComfyUI Job 投入
        print("\n--- [Step 2/4] キャラクター別プロンプト抽出 ＆ ComfyUI Job 投入 ---")
        prompt_id = generate_image_for_author(author_id, post_data["content"])
        if not prompt_id:
            raise RuntimeError("ComfyUI への Job 投入に失敗しました。")

        # Step 3: 画像生成完了の監視と公開フォルダへの転送
        print("\n--- [Step 3/4] 画像生成完了の待機 ＆ 公開ディレクトリへの配置 ---")
        generated_image = wait_for_comfyui_image(prompt_id)
        if not generated_image:
            raise RuntimeError("画像の生成確認が取れませんでした。")

        WEB_PUBLIC_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

        now = datetime.now()
        image_filename = f"phied_{author_id}_{now.strftime('%Y%m%d%H%M%S')}.png"
        target_image_path = WEB_PUBLIC_IMAGE_DIR / image_filename

        shutil.copy(generated_image, target_image_path)
        print(f"🚚 画像を配置完了: {target_image_path}")

        web_image_src = f"/images/phied/{image_filename}"

        # Step 4: phied.json の更新
        print("\n--- [Step 4/4] phied.json のデータ更新 ---")
        with open(PHIED_JSON_PATH, "r", encoding="utf-8") as f:
            logs = json.load(f)

        new_entry = {
            "commitId": f"auto-{author_id}-{now.strftime('%Y%m%d%H%M%S')}",
            "type": post_data.get("type", "DAILY"),  # ← ここを追加！
            "date": now.strftime("%Y.%m.%d"),
            "status": "ONLINE",
            "author": author_id,
            "authorName": agent_name,
            "timestamp": now.strftime("%Y.%m.%d %H:%M"),
            "title": post_data["title"],
            "content": post_data["content"],
            "description": post_data["description"],
            "tags": post_data["tags"],
            "insights": post_data["insights"],
            "imageSrc": web_image_src
        }

        logs.insert(0, new_entry)

        with open(PHIED_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(logs, f, ensure_ascii=False, indent=2)

        print(f"✨ 完了: phied.json を更新しました! (画像URL: {web_image_src})")
        print("\n🎉 === 全パイプライン正常終了 ===")

    except Exception as e:
        print("\n❌ パイプライン実行中にエラーが発生しました:")
        traceback.print_exc()

if __name__ == "__main__":
    run_pipeline()