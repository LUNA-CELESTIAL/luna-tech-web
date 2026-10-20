import os
import json
import urllib.request
import xml.etree.ElementTree as ET
import re
import random
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent if SCRIPT_DIR.name == "scripts" else SCRIPT_DIR
FEEDS_JSON_PATH = PROJECT_ROOT / "src" / "data" / "rss_feeds.json"

DEFAULT_RSS_URL = "https://gigazine.net/news/rss_2.0/"

def load_rss_feeds() -> list:
    """rss_feeds.json からフィード一覧を取得"""
    if not FEEDS_JSON_PATH.exists():
        print(f"[WARN] {FEEDS_JSON_PATH} が存在しないため、デフォルトを使用します。")
        return [{"name": "GIGAZINE", "url": DEFAULT_RSS_URL}]
    try:
        with open(FEEDS_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARN] rss_feeds.json 読み込み失敗: {e}")
        return [{"name": "GIGAZINE", "url": DEFAULT_RSS_URL}]

def fetch_latest_news(recent_sources: list = None) -> dict | None:
    """
    登録済みRSS/Atomフィードから選出（直近で使った feed は優先除外して均等化）
    recent_sources: 直近の投稿で使われた source 名のリスト（例: ['GIGAZINE', 'ROOMIE']）
    """
    feeds = load_rss_feeds()
    if not feeds:
        return None

    if recent_sources is None:
        recent_sources = []

    # 直近で使われていないフィードを優先候補にする
    candidate_feeds = [f for f in feeds if f.get("name") not in recent_sources]

    # もし全フィードが最近使われて候補がゼロになった場合は、全フィードから選ぶ（安全策）
    if not candidate_feeds:
        print("ℹ️ 直近の巡回履歴が全サイトを一巡したため、選定候補をリセットします。")
        candidate_feeds = feeds

    # 候補の中からランダムにシャッフルして試行順を決定
    shuffled_candidates = random.sample(candidate_feeds, len(candidate_feeds))

    for selected_feed in shuffled_candidates:
        rss_url = selected_feed.get("url", DEFAULT_RSS_URL)
        feed_name = selected_feed.get("name", "Unknown")

        try:
            print(f"📡 RSS巡回先試行: [{feed_name}] ({rss_url})")
            req = urllib.request.Request(rss_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=10) as response:
                xml_data = response.read()

            root = ET.fromstring(xml_data)

            # RSS 2.0 (<item>) と Atom (<entry>) の両方を探索
            items = root.findall('.//item')
            if not items:
                items = [elem for elem in root.iter() if elem.tag.endswith('entry')]

            if not items:
                print(f"[WARN] [{feed_name}] から記事が見つかりませんでした。次の候補を試します。")
                continue

            # 上位20件から1件選出
            selected_item = random.choice(items[:20])

            title_elem = selected_item.find('title')
            if title_elem is None:
                title_elem = next((e for e in selected_item if e.tag.endswith('title')), None)
            title = title_elem.text if title_elem is not None and title_elem.text else ""

            desc_elem = selected_item.find('description')
            if desc_elem is None:
                desc_elem = next((e for e in selected_item if e.tag.endswith('summary') or e.tag.endswith('content')), None)
            
            description = desc_elem.text if desc_elem is not None and desc_elem.text else ""
            clean_desc = re.sub(r'<[^>]+>', '', description).strip()[:200]

            print(f"✅ RSS取得成功: [{feed_name}] - {title}")
            return {
                "source": feed_name,
                "title": title,
                "summary": clean_desc
            }

        except Exception as e:
            print(f"[WARN] [{feed_name}] 取得失敗 ({e})。次の候補を試します...")
            continue

    print("[ERROR] 全てのRSSフィードからの取得に失敗しました。")
    return None