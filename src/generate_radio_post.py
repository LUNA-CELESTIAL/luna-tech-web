import os
import sys
import shutil
import datetime
import traceback
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field
import ollama
from dotenv import load_dotenv
import time
# .env から環境変数を安全にロード
load_dotenv()

# --- パス設定（環境変数があれば優先、なければデフォルト） ---
BASE_DIR = Path(os.getenv("SRC_DIR", "/home/lulu/luna/luna_docker/luna-tech-web/src"))
INCOMPLETE_DIR = BASE_DIR / "Script Incomplete"
COMPLETED_DIR = BASE_DIR / "Script completed"
MARKDOWN_OUTPUT_DIR = BASE_DIR / "markdown"


# --- AIに抽出させるデータ型（固定項目を除外してプロンプトを軽量化） ---
class RadioExtractionSchema(BaseModel):
    commit_id: str = Field(description="英数小文字とハイフンのみの識別子（例: feat-ollama-001）")
    title: str = Field(description="記事のタイトル")
    description: str = Field(description="記事の1行要約（ツンデレまたはギャル口調）")
    tags: List[str] = Field(description="技術タグのリスト（例: ['Ollama', 'LocalLLM']）")
    story_reply: str = Field(description="スピカ（SUPICA）としての愛のあるツンデレ一言コメント（例: 🐬【スピカの一言】〇〇なんて余裕で動くわよ！）")
    
    summary_points: List[str] = Field(description="要点まとめ（箇条書き用の文字列リスト）")
    dialogue_highlights: str = Field(description="RADIO対話のハイライト会話・引用文")
    test_command: str = Field(description="検証ログや実行コマンド")


def ensure_directories():
    """必要なディレクトリを自律的に作成するわ"""
    INCOMPLETE_DIR.mkdir(parents=True, exist_ok=True)
    COMPLETED_DIR.mkdir(parents=True, exist_ok=True)
    MARKDOWN_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def render_markdown(data: RadioExtractionSchema) -> str:
    """抽出データとプログラム固定値を結合して Front Matter 付き Markdown を生成する"""
    # プログラム側で動的・固定セットする値
    current_date = datetime.datetime.now().strftime("%Y.%m.%d")
    status = "Notes"
    emoji = "🐬"
    agent = "スピカ（SUPICA）"
    image_src = "Notes"  # デフォルト画像パス

    # タグの整形 (["AI", "LLM"] -> ["AI", "LLM"])
    tags_formatted = str(data.tags).replace("'", '"')

    # 要点まとめの箇条書き化
    summary_md = "\n".join([f"- {point}" for point in data.summary_points])

    markdown_content = f"""---
commitId: "{data.commit_id}"
date: "{current_date}"
status: "{status}"
emoji: "{emoji}"
agent: "{agent}"
title: "{data.title}"
description: "{data.description}"
tags: {tags_formatted}
imageSrc: "{image_src}"
storyReply: "{data.story_reply}"
---
### 💡 3行でわかる要点まとめ
{summary_md}

### 🎙️ RADIO対話のハイライト
{data.dialogue_highlights}

### 🛠️ 本日の実験ログ
```bash
{data.test_command}    
"""
    return markdown_content

def process_radio_script(file_path: Path, model_name: str = "gemmaE2b") -> bool:
    """単一のRADIO台本をパースしてMarkdownを出力し、完了ディレクトリへ移動する"""
    ensure_directories()

    if not file_path.exists():
        print(f"🚨 [ERROR] ファイルが存在しないわ: {file_path}")
        return False

    try:
        print(f"📡 [{file_path.name}] を Ollama ({model_name}) で解析中...")
        with open(file_path, "r", encoding="utf-8") as f:
            script_text = f.read()

        system_prompt = (
            "あなたは LUNA's Constellations の編集エージェントです。"
            "渡されたRADIO台本から、要点・ハイライト・コマンドを抽出して指定のJSONを出力しなさい。"
            "会話のノリや面白さを消さないこと。"
        )

        response = ollama.chat(
            model=model_name,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': f"以下のRADIO台本を抽出・構造化しなさい：\n\n{script_text}"}
            ],
            format=RadioExtractionSchema.model_json_schema()
        )

        # レスポンスのバリデーション
        extracted_data = RadioExtractionSchema.model_validate_json(response['message']['content'])

        # Markdownテキストのレンダリング
        md_text = render_markdown(extracted_data)

        # 1. Markdownファイルの書き出し (/src/markdown/{commit_id}.md)
        # 1. Markdownファイルの書き出し (/src/markdown/{commit_id}.md)
        # スラッシュなどの不整合文字を置換して安全なファイル名にする
        safe_commit_id = extracted_data.commit_id.replace("/", "_").replace("\\", "_")
        out_filename = f"{safe_commit_id}.md"
        out_path = MARKDOWN_OUTPUT_DIR / out_filename

        # 親ディレクトリ（フォルダ）が存在しない場合は自動で自律作成するわ！
        out_path.parent.mkdir(parents=True, exist_ok=True)

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(md_text)
        print(f"✨ Markdown生成成功: {out_path}")

    except Exception as e:
        print(f"🚨 [ERROR] {file_path.name} の処理中にエラーが発生しただし！: {e}")
        traceback.print_exc()
        return False
def process_all_incomplete_scripts(model_name: str = "gemmaE2b"):
    """Script Incomplete 内の未処理ファイルをすべて一括処理する"""
    ensure_directories()
    target_files = list(INCOMPLETE_DIR.glob("*.md"))
    
# ↓ 関数の中身としてインデント（スペース4つ）を揃える
    if not target_files:
        print("ℹ️ `Script Incomplete` に処理対象のファイル（.md）はありません。")
        return

    print(f"🚀 {len(target_files)} 件の未処理スクリプトを発見したわ。パイプライン処理を開始するわよ！")
    for file_path in target_files:
        process_radio_script(file_path, model_name)
        
        # 連続実行によるPCへの負荷軽減のため、5秒間のインターバル（休憩）を入れるわ！
        print("☕ 次のスクリプト処理まで 5秒間 インターバルを挟むわよ...")
        time.sleep(5)


# ↓ name を __name__ と __main__ に修正し、配下をインデントする
if __name__ == "__main__":
    # コマンドライン引数でファイルパスが渡された場合は個別実行、なければIncompleteを一括実行
    if len(sys.argv) > 1:
        single_target = Path(sys.argv[1])
        process_radio_script(single_target)
    else:
        process_all_incomplete_scripts()