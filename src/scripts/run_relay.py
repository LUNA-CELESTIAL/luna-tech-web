import time
import sys
import traceback
from pathlib import Path

# main_pipeline から実行関数をインポート
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.append(str(SCRIPT_DIR))

from main_pipeline import run_pipeline

def start_relay(count: int = 3, interval_seconds: int = 60):
    """
    指定された人数（count）分、interval_seconds 秒のウェイトを挟んで連続生成リレーを実行
    """
    print(f"🔄 === 自律リレー投稿バッチ開始 (投稿数: {count} 件 | 間隔: {interval_seconds} 秒) ===")

    for i in range(1, count + 1):
        print(f"\n🏃 【リレー {i}/{count} 件目 実行開始】")
        try:
            run_pipeline()
            print(f"✅ 【リレー {i}/{count} 件目 完了】")
        except Exception as e:
            print(f"❌ 【リレー {i}/{count} 件目でエラー発生】: {e}")
            traceback.print_exc()

        if i < count:
            print(f"⏳ 次のリレーまで {interval_seconds} 秒間クールダウン中...")
            time.sleep(interval_seconds)

    print("\n🎉 === 全リレー投稿バッチ完了 ===")

if __name__ == "__main__":
    # デフォルトで 3人リレー / 60秒 (1分) インターバル
    start_relay(count=3, interval_seconds=60)