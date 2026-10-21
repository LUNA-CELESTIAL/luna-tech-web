import sys
from pathlib import Path

# パスの自動解決
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.append(str(SCRIPT_DIR))

from comfyui_client import (
    build_realistic_style_prompt_from_json,
    build_anime_style_prompt_from_json,
    MEMBER_BASE_PROMPTS
)

def run_prompt_experiment(author_id: str, sample_tweet: str):
    print(f"\n🧪 === プロンプト単体生成実験 (対象メンバー: {author_id}) ===")
    print(f"💬 [入力ツイート]: {sample_tweet}\n")

    base_prompt = MEMBER_BASE_PROMPTS.get(author_id, MEMBER_BASE_PROMPTS["luna"])

    if author_id in ["hina", "kohaku"]:
        print("⏳ Ollama (muse-unce) で REALISTIC 用 JSON シチュエーション抽出中...")
        final_prompt = build_realistic_style_prompt_from_json(base_prompt, sample_tweet)
        style_type = "REALISTIC (ひな・こはく用 / JSONネイティブ)"
    else:
        print("⏳ Ollama (muse-unce) で ANIME 用 JSON シチュエーション抽出中...")
        final_prompt = build_anime_style_prompt_from_json(base_prompt, sample_tweet)
        style_type = f"ANIME ({author_id}用 / JSONネイティブ)"

    print(f"\n✨ 【完成した注入プロンプト ({style_type})】")
    print("=" * 60)
    print(final_prompt)
    print("=" * 60)

if __name__ == "__main__":
    # 連続で実験したいテストデータのリスト
    test_cases = [
        {
            "author": "hina",
            "tweet": "ツールを削ぎ落としていくのがすごい！ひなも、道具との付き合い方、考え直したいな〜って思った！本当にシンプルだけど、なんかすごく洗練されてる！"
        },
        {
            "author": "sirius",
            "tweet": "上野のカフェで新しいガジェットを試してるよ！ネオンの光がすごく綺麗でテンション上がる！⚡️"
        }
    ]

    for case in test_cases:
        run_prompt_experiment(case["author"], case["tweet"])
