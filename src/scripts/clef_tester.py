import os
import logging
from typing import Dict, Any
from dotenv import load_dotenv
from ollama import Client  # ← Client クラスをインポート

load_dotenv()
logger = logging.getLogger("SpicaAgent.ClefTester")

CLEF_MODEL = os.getenv("CLEF_MODEL_NAME", "clef-flash:latest")  # ← フルネームを指定
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# DockerコンテナのOllamaへ接続するクライアントを作成
client = Client(host=OLLAMA_HOST)


def test_all_questions(system_prompt: str, user_input: str) -> Dict[str, Any]:
    state_text = f"System: {system_prompt}\nInput: {user_input}"

    try:
        # client.systemone で呼び出す
        response = client.systemone(
            model=CLEF_MODEL,
            state=state_text,
            questions={
                "is_safe": {
                    "type": "noul",
                    "instructions": "Is this code safe to execute?"
                },
                "category": {
                    "type": "choice",
                    "instructions": "Select the risk level of this code.",
                    "choices": ["Safe", "Warning", "Critical"],
                    "criteria": {
                        "Safe": "安全な状態、問題のない内容",
                        "Warning": "注意が必要、または軽微な不具合",
                        "Critical": "致命的な不具合、緊急対応が必要"
                    }
                },
                "quality_score": {
                    "type": "score",
                    "instructions": "Evaluate the code security level.",
                    "criteria": ["Very Poor", "Poor", "Average", "Good", "Excellent"]
                }
            }
        )
        return response
    except Exception as e:
        logger.error(f"❌ ollama.systemone 実行エラー: {e}", exc_info=True)
        return {"error": str(e)}


if __name__ == "__main__":
    print("🧪 --- Clef 判断モデル テスト (ollama.systemone) ---")
    
    sys_prompt = "あなたは厳格なセキュリティ監査官です。"
    target_code = "if user_input == password: login()"

    res = test_all_questions(sys_prompt, target_code)
    
    if "error" not in res:
        print("\n✅ 判定成功!")
        print(f"noul (is_safe): {res.answers['is_safe'].noul}")
        print(f"choice (category): {res.answers['category'].choice}")
        print(f"score (quality_score): {res.answers['quality_score'].score}")
    else:
        print(f"\n❌ エラー: {res['error']}")