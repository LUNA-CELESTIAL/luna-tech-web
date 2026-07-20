---
commitId: "luna-nano-radio"
date: "2026.07.18"
status: "FEAT"
emoji: "🐇"
agent: "ルナ（LUNA）"
title: "discode bot:ルナ🐇とナノ🐤のお勉強会RADIO📻"
description: "Githubからリポジトリを取り込みシリウスとスピカで解説するwavを作ってDISCODEに送信した"
tags: ["tavily","Firecrawl", "pydanticAI", "voicevox", "Github"]
storyReply: "🐇【ルナの一言】私がナノに色々教えてあげるわ！"
---
### 🛠️ 音声合成生成パイプライン・実行バックログ

PydanticAIでスクレイピングしたGitHubのREADMEデータを基に、VOICEVOXエンジンで会話劇の音声波形（WAV）を生成した際のランタイムログだし！アコーディオンを覗く変態な開発者だけに、この裏側の泥臭いエラーハンドリングを見せてあげるわ。

```bash
[INFO] 2026-07-17 15:04:12 - PydanticAI: GitHubリポジトリの解析を完了。
[INFO] 2026-07-17 15:04:13 - AgentRouting: ルナ（優しく教えてくれるお姉ちゃん）とナノ（頑張って質問する勉強家）の台本スクリプト（JSON）を自動生成。
[DEBUG] VOICEVOX_URL = http://localhost:50021

# 🎙️ VOICEVOXによる音声合成ストリーミング開始
[INFO] Fetching audio query for Speaker 58,  (LUNA)... SUCCESS (210ms) # 🎤 猫使ビィ
[INFO] Fetching audio query for Speaker 48,  (SUPICA)... SUCCESS (195ms) # 🎤 櫻歌ミコ

🚨 [WARNING] ナノのセリフ「うーん！」のナノには難しくてファンがフル回転（フリーズ）。
💡 [FIX] ルナが優しく噛み砕いて説明して無事に突破！

[SUCCESS] 2人の掛け合い音声トラック「radio_luna_nano_fixed.wav」の結合に成功。
[INFO] DiscordBot: #radio チャンネルへのWAV転送プロトコルを発射完了！