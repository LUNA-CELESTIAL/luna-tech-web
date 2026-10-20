import os
import json
import urllib.request
import urllib.parse
import traceback
import ollama
from dotenv import load_dotenv

load_dotenv()

# 設定情報
COMFYUI_HOST = os.getenv("COMFYUI_HOST", "127.0.0.1:8188")
JSON_WORKFLOW_PATH = os.getenv("COMFYUI_LUNA_JSON_PATH", "/home/lulu/luna/luna_docker/luna-tech-web/luna.json")

# ルナの固定プロンプト（ベース）
LUNA_BASE_PROMPT = (
    "An anime-style portrait of a lovely girl with long brown hair and expressive eyes, "
    "wearing a black cyber choker with a glowing pink crown icon."
)

def generate_situational_sentence(tweet_text: str) -> str:
    """muse-unce:latest でシチュエーション英文を生成"""
    system_instruction = (
        "You are an AI assistant specialized in generating image description prompts for ComfyUI. "
        "Your job is to read a Japanese tweet and write 1-2 clear, descriptive English sentences "
        "that depict ONLY the situational environment (background, pose, facial expression, key items held, lighting). "
        "CRITICAL RULES:\n"
        "1. PRESERVE KEY ITEMS: If specific items (e.g., cup noodles, ramne, book, laptop, coffee, stuffed toy) are mentioned in the tweet, you MUST explicitly include them in the English description (e.g., 'eating instant cup noodles', 'holding a cup of ramen'). Do NOT generalize them to generic plates or food.\n"
        "2. Do NOT describe character features like hair color, eye color, or clothing.\n"
        "3. Do NOT output any reasoning, chain-of-thought, XML tags, or markdown.\n"
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

def queue_comfyui_luna2(prompt_text: str, reference_image_name: str = "luna.png") -> bool:
    """ComfyUI API (luna_2.json) へプロンプトと参照画像をセットして Queue を投げる"""
    if not os.path.exists(JSON_WORKFLOW_PATH):
        print(f"[ERROR] ワークフローファイルが存在しません: {JSON_WORKFLOW_PATH}")
        return False

    try:
        with open(JSON_WORKFLOW_PATH, "r", encoding="utf-8") as f:
            workflow = json.load(f)

        # 1. ノード 30:19 の User Prompt を更新
        if "30:19" in workflow and "inputs" in workflow["30:19"]:
            workflow["30:19"]["inputs"]["value"] = prompt_text
        else:
            print("[ERROR] ノード 30:19 (User Prompt) が見つかりません。")
            return False

        # 2. ノード 69 の LoadImage を更新
        if "69" in workflow and "inputs" in workflow["69"]:
            workflow["69"]["inputs"]["image"] = reference_image_name
        else:
            print("[WARN] ノード 69 (LoadImage) が見つかりません。デフォルトのまま続行します。")

        # ComfyUI API 用ペイロード
        payload = {"prompt": workflow}
        data = json.dumps(payload).encode('utf-8')
        
        req = urllib.request.Request(
            f"http://{COMFYUI_HOST}/prompt",
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            prompt_id = res.get("prompt_id")
            print(f"[SUCCESS] ComfyUI (luna_2) に Job を登録完了! Prompt ID: {prompt_id}")
            return True

    except Exception as e:
        print(f"[ERROR] ComfyUI API リクエスト失敗: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_tweet = "深夜のデバッグ作業終了！温かいココアを飲みながら静かな部屋で一息ついてるよ。"
    
    print("=== [1] シチュエーション英文生成 ===")
    situational_sentence = generate_situational_sentence(test_tweet)
    final_prompt = f"{LUNA_BASE_PROMPT} {situational_sentence}"
    print(f"注入プロンプト: {final_prompt}")

    print("\n=== [2] ComfyUI API (luna_2.json) リクエスト送信 ===")
    # ComfyUI の input ディレクトリに置いてある/参照可能な画像名を指定
    queue_comfyui_luna2(final_prompt, reference_image_name="luna.png")