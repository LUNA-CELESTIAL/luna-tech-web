import os
import json
import random
import re
import traceback
from pathlib import Path
import urllib.request
import xml.etree.ElementTree as ET
from dotenv import load_dotenv
import ollama

# パス自動解決
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent if SCRIPT_DIR.name == "scripts" else SCRIPT_DIR
load_dotenv(PROJECT_ROOT / ".env")

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemmavl:latest")

# 実験用ゆるめRSSフィード（食・トレンド・ガジェット・ライフスタイル）
TEST_RSS_URL = "https://gigazine.net/news/rss_2.0/"

AGENT_PERSONAS = {
    "spica": {
        "name": "スピカ（SPICA）",
        "role": "三女 / 電脳点検医",
        "tone": "冷静、クール、少し素っ気ないが筋を通す頼れる姉御肌（タメ口）",
        "perspective": "技術やトレンドを客観的に分析しつつ、生活の効率化や空間の快適さに落とし込んで考える"
    },
    "hina": {
        "name": "桜音ひな",
        "role": "高校生 / 直感アイデア担当",
        "tone": "明るい、前向き、直感的、親しみやすい普通の女子高生口調（タメ口）",
        "perspective": "流行りのスイーツ、カフェ、おでかけスポット、映えに敏感で直感的にテンションが上がる"
    },
    "stella": {
        "name": "ステラ（STELLA）",
        "role": "四女 / 職人クラフター",
        "tone": "真面目、こだわり屋、職人気質でストレートな口調（タメ口）",
        "perspective": "モノの構造、デザイン、ハードウェアの質感や職人技に惹かれてマニアックに考察する"
    }
}

def fetch_latest_news(rss_url: str) -> dict:
    """urllib と xml.etree で安全にRSS記事を取得（外部ライブラリ依存なし）"""
    print(f"📡 RSSを取得中: {rss_url}")
    req = urllib.request.Request(rss_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        xml_data = response.read()

    root = ET.fromstring(xml_data)
    # 最初のエントリを取得
    item = root.find('.//item')
    if item is None:
        raise ValueError("RSSから記事を取得できませんでした。")

    title = item.find('title').text if item.find('title') is not None else ""
    description = item.find('description').text if item.find('description') is not None else ""
    
    # HTMLタグの除去
    clean_desc = re.sub(r'<[^>]+>', '', description).strip()[:200]

    return {
        "title": title,
        "summary": clean_desc
    }

def test_generate_news_insight():
    """ニュースをインジェクトして長文考察（insights）を生成する実験"""
    try:
        news = fetch_latest_news(TEST_RSS_URL)
        print(f"\n📰 取得ニュース: {news['title']}")
        print(f"📝 概要: {news['summary']}\n")

        # ランダムにエージェントを選定
        author_id = random.choice(list(AGENT_PERSONAS.keys()))
        agent = AGENT_PERSONAS[author_id]
        print(f"🤖 担当エージェント: {agent['name']} ({author_id})")

        system_prompt = f"""
あなたは「{agent['name']}」（{agent['role']}）です。
性格・語り口: {agent['tone']}
思考の視点: {agent['perspective']}

【ミッション】
提供された外部ニュース・トレンド記事に対し、単なる「要約」や「まとめ」は絶対にしないでください。
ニュースを出発点にして、あなたの個人的な体験、思想、ファクトリーでの生活、モノづくりや日常への応用に引き寄せた「独自の持論・長文考察」を語ってください。

【絶対ルール】
1. 完全な「タメ口」のみを使用すること（「です」「ます」は完全禁止）。
2. 政治や過度な思想的対立には触れず、日常・食・デザイン・技術のワクワクにフォーカスすること。
3. insights（Tech Insights）欄は、短くまとめず、あなたの考えや背景を200〜400文字程度で熱くじっくり述べること。
4. 以下のJSON構造のみを出力してください。マークダウンや解説は厳禁です。

{{
  "title": "ニュースに対するあなた独自のリアクションタイトル（絵文字含む）",
  "content": "ニュースを見た率直な感想や日常へのつぶやき（100文字程度）",
  "description": "ニュースの簡単な紹介",
  "tags": ["関連タグ1", "関連タグ2"],
  "insights": "ニュースをきっかけにしたあなたの長文考察・持論（200〜400文字）"
}}
"""

        user_prompt = f"対象ニュースタイトル: {news['title']}\nニュース概要: {news['summary']}\n\nこのニュースについて、あなたの視点で自由に語ったJSONを生成してください。"

        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )

        raw_output = response['message']['content'].strip()
        json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)
        if not json_match:
            print(f"❌ 生出力: {raw_output}")
            raise ValueError("JSON形式で出力されませんでした。")

        result = json.loads(json_match.group(0))

        print("\n--- ✨ 生成結果（実験出力） ---")
        print(f"【Type】: NEWS")
        print(f"【Title】: {result.get('title')}")
        print(f"【Content】:\n{result.get('content')}")
        print(f"【Insights（長文考察）】:\n{result.get('insights')}")
        print("-------------------------------\n")

    except Exception as e:
        print("❌ 実験中にエラーが発生しました:")
        traceback.print_exc()

if __name__ == "__main__":
    test_generate_news_insight()