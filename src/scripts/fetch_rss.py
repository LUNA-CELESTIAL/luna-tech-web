import os
import json
import urllib.request
import xml.etree.ElementTree as ET
import re
import random
import traceback
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent if SCRIPT_DIR.name == "scripts" else SCRIPT_DIR
FEEDS_JSON_PATH = PROJECT_ROOT / "src" / "data" / "rss_feeds.json"

DEFAULT_RSS_URL = "https://gigazine.net/news/rss_2.0/"

def load_rss_feeds() -> list:
    """rss_feeds.json からフィード一覧を取得（失敗時はデフォルトへフォールバック）"""
    if not FEEDS_JSON_PATH.exists():
        return [{"name": "GIGAZINE", "url": DEFAULT_RSS_URL}]
    try:
        with open(FEEDS_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARN] rss_feeds.json 読み込み失敗: {e}")
        return [{"name": "GIGAZINE", "url": DEFAULT_RSS_URL}]

def fetch_latest_news() -> dict | None:
    """登録済みRSSフィードからランダムに1元を選定し、上位記事から1件をランダム選出"""
    feeds = load_rss_feeds()
    selected_feed = random.choice(feeds)
    rss_url = selected_feed.get("url", DEFAULT_RSS_URL)
    feed_name = selected_feed.get("name", "Unknown")

    try:
        print(f"📡 RSS巡回先選出: [{feed_name}] ({rss_url})")
        req = urllib.request.Request(rss_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()

        root = ET.fromstring(xml_data)
        items = root.findall('.//item')
        if not items:
            print(f"[WARN] [{feed_name}] のRSS内に <item> が見つかりませんでした。")
            return None

        # 上位20件の中からランダムに1件選択
        selected_item = random.choice(items[:20])

        title = selected_item.find('title').text if selected_item.find('title') is not None else ""
        description = selected_item.find('description').text if selected_item.find('description') is not None else ""
        
        clean_desc = re.sub(r'<[^>]+>', '', description).strip()[:200]

        return {
            "source": feed_name,
            "title": title,
            "summary": clean_desc
        }
    except Exception as e:
        print(f"[ERROR] RSS取得失敗 [{feed_name}] ({rss_url}): {e}")
        traceback.print_exc()
        return None