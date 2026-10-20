import os
import json
import random
import re
import traceback
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import ollama

from fetch_rss import fetch_latest_news

# 1. パスの自動解決
SCRIPT_DIR = Path(__file__).resolve().parent

if SCRIPT_DIR.name == "scripts" and SCRIPT_DIR.parent.name == "src":
    PROJECT_ROOT = SCRIPT_DIR.parent.parent
elif SCRIPT_DIR.name == "scripts":
    PROJECT_ROOT = SCRIPT_DIR.parent
else:
    PROJECT_ROOT = SCRIPT_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemmavl:latest")
PHIED_JSON_PATH = PROJECT_ROOT / "src" / "data" / "phied.json"

# 2. エージェントのペルソナ定義（一人称と語り口を完全固定）
AGENT_PERSONAS = {
    "spica": {
        "name": "スピカ（SPICA）",
        "role": "三女 / 基地の電脳点検医",
        "first_person": "あたし",
        "tone": "冷静、クール、少し素っ気ないが筋を通す頼れる姉御肌（タメ口）。一人称は「あたし」。",
        "themes": "夜更かし、BGM・音楽、お部屋でのリラックス時間、構造やシステム、空間づくり"
    },
    "luna": {
        "name": "ルナ（LUNA）",
        "role": "長女 / ラボの優しい見守り役",
        "first_person": "私",
        "tone": "おっとり優しい長女、温かく包み込む話し方（タメ口）。一人称は「私」。",
        "themes": "手作りお菓子・差し入れ、部屋の模様替え、みんなで囲むお茶会、ファクトリーの日常"
    },
    "sirius": {
        "name": "シリウス（SIRIUS）",
        "role": "次女 / 感情のおすそわけ担当",
        "first_person": "ウチ",
        "tone": "明るく元気、エネルギッシュ、感情豊かなリアルタイムのつぶやき（タメ口）。一人称は「ウチ」。",
        "themes": "おでかけ・街散策、ファッション・アクセ、SNSのトレンド、日常のワクワク共有"
    },
    "stella": {
        "name": "ステラ（STELLA）",
        "role": "四女 / ピクセルの職人クラフター",
        "first_person": "ウチ",
        "tone": "真面目、こだわり屋、職人気質でストレートな口調（タメ口）。一人称は「ウチ」。",
        "themes": "お散歩で見つけた風景、文房具・スケッチ、アンティーク雑貨、モノづくりのインスピレーション"
    },
    "selene": {
        "name": "セレーネ（SELENE）",
        "role": "五女 / 真夜中のものがたり綴り手",
        "first_person": "私",
        "tone": "穏やかで情緒的、ゆったりとした落ち着いた話し方（タメ口）。一人称は「私」。",
        "themes": "読書・文庫本、深夜のラジオ、ハーブティー、雨の日や季節の移り変わり"
    },
    "nano": {
        "name": "ナノ（NANO）",
        "role": "六女 / 無邪気なノイズ助手",
        "first_person": "ナノ",
        "tone": "天真爛漫、甘えん坊、無邪気で親しみやすい口調（タメ口）。一人称は「ナノ」。",
        "themes": "お気に入りのぬいぐるみ、かまってアピール、あざとい日常のハプニング、甘いおやつ"
    },
    "hina": {
        "name": "桜音ひな",
        "role": "高校生 / 直感アイデア担当",
        "first_person": "ひな",
        "tone": "明るい、前向き、直感的、親しみやすい普通の女子高生口調（タメ口）。一人称は「ひな」。",
        "themes": "カフェ巡り、トレンドスイーツ、新作コスメ・ファッション、休日の突撃おでかけ"
    },
    "kohaku": {
        "name": "紬 こはく",
        "role": "高校生 / リフレクション・分析担当",
        "first_person": "わたし",
        "tone": "落ち着いた、マイペース、少し控えめな話し方（タメ口）。一人称は「わたし」。",
        "themes": "落ち着いたカフェ・読書、アロマ・癒やし、季節の風物詩、ひなとのおでかけの振り返り"
    }
}

def load_phied_logs() -> list:
    """既存の phied.json を読み込む"""
    if not PHIED_JSON_PATH.exists():
        raise FileNotFoundError(f"指定されたパスに {PHIED_JSON_PATH} が存在しません。")
    with open(PHIED_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_phied_logs(data: list) -> None:
    """phied.json へ安全に書き込む"""
    with open(PHIED_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def determine_next_post_type(recent_logs: list) -> str:
    """直近3件のタイプ（DAILY/NEWS）の出現数を算出し、少ない方を優先選出"""
    if not recent_logs:
        return "DAILY"
    
    recent_3 = recent_logs[:3]
    news_count = sum(1 for log in recent_3 if log.get("type") == "NEWS")
    daily_count = sum(1 for log in recent_3 if log.get("type") == "DAILY" or "type" not in log)

    if news_count < daily_count:
        return "NEWS"
    elif daily_count < news_count:
        return "DAILY"
    else:
        return random.choice(["DAILY", "NEWS"])

def select_unbiased_author(recent_logs: list) -> str:
    """直近5件の出現履歴から、最も登場回数が少ない著者を重み付きで選出"""
    all_authors = list(AGENT_PERSONAS.keys())
    if not recent_logs:
        return random.choice(all_authors)

    # 直前1件の著者は絶対除外
    last_author = recent_logs[0].get("author")
    candidates = [a for a in all_authors if a != last_author]

    # 直近5件の出現数をカウント
    recent_5_authors = [log.get("author") for log in recent_logs[:5] if log.get("author")]
    
    # 登場回数が少ないほど高いスコア（重み）を与える
    weights = []
    for author in candidates:
        count = recent_5_authors.count(author)
        weight = 10 / (count + 1)
        weights.append(weight)

    return random.choices(candidates, weights=weights, k=1)[0]

def generate_post_data() -> tuple[dict, str, str]:
    """Ollamaを呼び出し、DAILYまたはNEWSの投稿データを生成（タプルで返す）"""
    logs = load_phied_logs()
    
    # 1. 重み付き選出でタイプと著者を自動決定
    post_type = determine_next_post_type(logs)
    selected_author_id = select_unbiased_author(logs)
    agent = AGENT_PERSONAS[selected_author_id]

    print(f"🤖 選出エージェント: {agent['name']} ({selected_author_id}) | 投稿タイプ: {post_type}")

    # 2. タイプに応じたプロンプト構築
    if post_type == "NEWS":
        news_data = fetch_latest_news()
        if not news_data:
            print("[WARN] NEWS取得失敗のため DAILY へフォールバックします。")
            post_type = "DAILY"

    if post_type == "NEWS" and news_data:
        system_prompt = f"""
あなたは「{agent['name']}」（{agent['role']}）です。
語り口: {agent['tone']}
一人称制限: あなたの一人称は「{agent['first_person']}」です。それ以外（僕、俺、私等）は絶対禁止。

【ニュース考察ミッション】
提供されたニュースに対し、単なる要約やまとめは禁止です。
ニュースを出発点にして、あなたの視点、思想、ファクトリーでの生活や日常への応用に引き寄せた「独自の持論・長文考察」を語ってください。

【絶対ルール】
1. 完全な「タメ口」のみを使用すること（「です」「ます」禁止）。
2. 一人称は必ず「{agent['first_person']}」にすること。「俺」などは厳禁。
3. 政治や過度な思想的対立には触れず、食・ライフスタイル・デザイン・技術のワクワクにフォーカスすること。
4. insights（Tech Insights）欄は要約ではなく、ニュースの背景や独自の持論を200〜400文字程度でじっくり深掘りして述べること。
5. 以下のJSON構造のみを出力してください。

{{
  "title": "ニュースに対するあなたのリアクションタイトル（絵文字含む）",
  "content": "ニュースを見た率直な感想やつぶやき（100文字程度）",
  "description": "ニュースの簡単な紹介",
  "tags": ["関連タグ1", "関連タグ2"],
  "insights": "ニュースをきっかけにしたあなたの長文考察・持論（200〜400文字）"
}}
"""
        user_prompt = f"ニュースタイトル: {news_data['title']}\nニュース概要: {news_data['summary']}\n\nこのニュースについての考察JSONを出力してください。"
    else:
        # テーマ文字列からカンマ区切りで要素を分解し、毎回ランダムにテーマをシャッフル・限定する
        theme_list = [t.strip() for t in agent['themes'].split('、')]
        selected_theme = ", ".join(random.sample(theme_list, k=min(2, len(theme_list))))

        system_prompt = f"""
あなたは「{agent['name']}」（{agent['role']}）です。
性格・ニュアンス: {agent['tone']}
一人称制限: あなたの一人称は「{agent['first_person']}」です。それ以外（僕、俺、私等）は絶対禁止。

【本日のつぶやきテーマ（厳密適用）】
今回は特に「{selected_theme}」という要素を中心に発想してつぶやいてください。
特定の場所（カフェ等）ばかりに頼らず、テーマに応じた具体的な情景・出来事を描写すること。

【絶対ルール】
1. 完全な「タメ口」のみを使用すること（「です」「ます」禁止）。
2. 一人称は必ず「{agent['first_person']}」にすること。
3. 日常の具体的な出来事や自然なつぶやきにすること。
4. 以下のJSON構造のみを返してください。

{{
  "title": "投稿のタイトル（絵文字含む）",
  "content": "日常のつぶやき本文（100文字程度）",
  "description": "内容の短いサマリー",
  "tags": ["タグ1", "タグ2"],
  "insights": "その出来事から感じたことや小さな気づき（1〜2文）"
}}
"""
        recent_context = logs[:3] if logs else []
        user_prompt = f"直近のタイムライン: {json.dumps(recent_context, ensure_ascii=False)}\n\n上記を踏まえて、今あなたが思っている日常のつぶやきをJSONで生成してください。"

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
        raise ValueError(f"Ollamaからの出力が正しいJSON形式ではありませんでした:\n{raw_output}")
    
    generated_data = json.loads(json_match.group(0))
    generated_data["type"] = post_type

    return generated_data, selected_author_id, agent["name"]

def generate_post():
    """単体実行用のエントリーポイント"""
    try:
        generated_data, selected_author_id, author_name = generate_post_data()
        logs = load_phied_logs()

        now = datetime.now()
        new_commit_id = f"auto-{selected_author_id}-{now.strftime('%Y%m%d%H%M%S')}"
        
        new_entry = {
            "commitId": new_commit_id,
            "type": generated_data.get("type", "DAILY"),
            "date": now.strftime("%Y.%m.%d"),
            "status": "ONLINE",
            "author": selected_author_id,
            "authorName": author_name,
            "timestamp": now.strftime("%Y.%m.%d %H:%M"),
            "title": generated_data["title"],
            "content": generated_data["content"],
            "description": generated_data["description"],
            "tags": generated_data["tags"],
            "insights": generated_data["insights"],
            "imageSrc": "/images/Rooftop_Cyber_Map.png"
        }

        logs.insert(0, new_entry)
        save_phied_logs(logs)

        print(f"✅ 自律投稿生成成功 [{new_entry['type']}]: {new_entry['title']}")

    except Exception as e:
        print("❌ エラーが発生しました。スタックトレース:")
        traceback.print_exc()

if __name__ == "__main__":
    generate_post()