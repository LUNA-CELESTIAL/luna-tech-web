# parse_posts.py
import os
import json
import re
from datetime import datetime

# 🌟 ファクトリー環境の完全固定パス
MARKDOWN_DIR = "/home/lulu/luna/luna_docker/luna-tech-web/src/markdown"
JSON_PATH = "/home/lulu/luna/luna_docker/luna-tech-web/src/data/phied.json"

def parse_markdown_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        raw_content = f.read()
    
    # 🔮 Front Matter (---) と 本文 (content) をパースするだし！
    # 改行コードの違い (CRLF / LF) を吸収しつつ、本文の改行をそのまま保持するわ
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', raw_content, re.DOTALL)
    if not match:
        print(f"⚠ [SKIP] Front Matterが見つかりません: {file_path}")
        return None
        
    meta_text, content_text = match.groups()
    
    # メタ情報の解析
    meta = {}
    for line in meta_text.strip().split('\n'):
        if ':' in line:
            k, v = line.split(':', 1)
            key = k.strip()
            value = v.strip().strip('"').strip("'")
            if value.startswith('[') and value.endswith(']'):
                meta[key] = [t.strip().strip('"').strip("'") for t in value[1:-1].split(',')]
            else:
                meta[key] = value

    # 🛑 【ここがルルのこだわりポイント！】
    # 本文（content_text）の改行構造を1ミリも崩さずに、そのまま辞書に格納するわ。
    # これが json.dump() を通ることで、自動的に美しい "\\n" 形式の1行文字列に変換されるだし！
    meta['content'] = content_text.strip('\n') # 前後の余計な空改行だけをトリムするわ
    
    return meta
def main():
    if not os.path.exists(MARKDOWN_DIR):
        os.makedirs(MARKDOWN_DIR)
        print(f"📁 ディレクトリを作成しました: {MARKDOWN_DIR}")

    # 既存の JSON データをサルベージ（なければ初期化）
    existing_posts = []
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, 'r', encoding='utf-8') as f:
                existing_posts = json.load(f)
        except json.JSONDecodeError:
            print("🚨 既存のJSONファイルが壊れています。バックアップを推奨しますだし！")

    # 重複を防ぐために commitId をキーにした既存マップを作成
    posts_map = {post['commitId']: post for post in existing_posts if 'commitId' in post}

    # Markdownフォルダ内のファイルを全走査
    for filename in os.listdir(MARKDOWN_DIR):
        if filename.endswith('.md'):
            file_path = os.path.join(MARKDOWN_DIR, filename)
            try:
                post_data = parse_markdown_file(file_path)
                if post_data and 'commitId' in post_data:
                    # 🚀 新規追加または上書きマージ！
                    posts_map[post_data['commitId']] = post_data
                    print(f"✓ [PARSED] {filename} -> commitId: {post_data['commitId']}")
            except Exception as e:
                print(f"🚨 [ERROR] {filename} の処理中にバグ発生だし！: {e}")

    # 🟢 最高憲法第5条：取得時に日付順（新しい順）になるようソートして保存！
    sorted_posts = sorted(
        posts_map.values(),
        key=lambda x: x.get('date', '2000.01.01'),
        reverse=True
    )

    # JSONへ綺麗に書き出し
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(sorted_posts, f, ensure_ascii=False, indent=2)
    print(f"✨ [SUCCESS] 全 {len(sorted_posts)} 件のポストを {JSON_PATH} に同期完了しただし！")

if __name__ == "__main__":
    main()