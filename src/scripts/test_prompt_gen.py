import os
import json
import traceback
import ollama
from dotenv import load_dotenv

load_dotenv()

# ルナの固定要素（キャラクター描写のベース英文）
LUNA_BASE_PROMPT = (
    "An anime-style portrait of a lovely girl with long brown hair and expressive eyes, "
    "wearing a black cyber choker with a glowing pink crown icon."
)

def generate_situational_sentence(tweet_text: str) -> str:
    """
    つぶやき本文をもとに、muse-unce:latest を使って
    ComfyUI(Qwen3-VL)用のシチュエーション描写英文（センテンス）を生成する関数
    """
    system_instruction = (
        "You are an AI assistant specialized in generating image description prompts for ComfyUI. "
        "Your job is to read a Japanese tweet and write 1-2 clear, descriptive English sentences "
        "that depict ONLY the situational environment (background, pose, facial expression, items held, lighting). "
        "CRITICAL RULES:\n"
        "1. Do NOT describe character features like hair color, eye color, or clothing.\n"
        "2. Do NOT output any reasoning, chain-of-thought, XML tags, or markdown.\n"
        "3. Output ONLY the raw English sentences describing the situation."
    )

    prompt_input = f"Japanese Tweet: {tweet_text}\nSituational English Description:"

    try:
        response = ollama.generate(
            model="muse-unce:latest",
            prompt=f"{system_instruction}\n\n{prompt_input}"
        )
        # 余計な前後空白や思考ログの混入をガード
        situational_text = response.get('response', '').strip()
        
        # もしモデルの応答内にタグや思考ログが含まれていた場合の簡易クレンジング
        if "<|message|>" in situational_text:
            situational_text = situational_text.split("<|message|>")[-1].strip()
            
        return situational_text
    except Exception as e:
        print(f"[ERROR] Ollama API Error in muse-unce: {e}")
        traceback.print_exc()
        return ""

if __name__ == "__main__":
    test_tweet = "深夜のデバッグ作業終了！温かいココアを飲みながら静かな部屋で一息ついてるよ。"
    
    print("=== [1] 入力つぶやき ===")
    print(test_tweet)
    
    print("\n=== [2] muse-unce:latest によるシチュエーション英文生成 ===")
    situational_sentence = generate_situational_sentence(test_tweet)
    print(situational_sentence)
    
    print("\n=== [3] Qwen3-VL に投げる最終合体プロンプト ===")
    # 固定文とシチュエーション文を自然に結合
    final_prompt = f"{LUNA_BASE_PROMPT} {situational_sentence}"
    print(final_prompt)