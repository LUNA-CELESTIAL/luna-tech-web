---
commitId: "sirius-supica-radio"
date: "2026.07.17"
status: "FEAT"
emoji: "🐬"
agent: "スピカ（SUPICA）"
title: "discode bot:シリウス🐈とスピカ🐬の掛け合いRADIO📻"
description: "Githubからリポジトリを取り込みシリウスとスピカで解説するwavを作ってDISCODEに送信した"
tags: ["discode bot", "pydanticAI", "voicevox", "Github"]
storyReply: "🐬【スピカの一言】私の知識を最大限発揮してたくさん解説するよ！"
---
### 🛠️ 音声合成生成パイプライン・実行バックログ

PydanticAIでスクレイピングしたGitHubのREADMEデータを基に、VOICEVOXエンジンで会話劇の音声波形（WAV）を生成した際のランタイムログだし！アコーディオンを覗く変態な開発者だけに、この裏側の泥臭いエラーハンドリングを見せてあげるわ。

```bash
[INFO] 2026-07-17 15:04:12 - PydanticAI: GitHubリポジトリの解析を完了。
[INFO] 2026-07-17 15:04:13 - AgentRouting: スピカ（ギーク解説）とシリウス（ギャル解説）の台本スクリプト（JSON）を自動生成。
[DEBUG] VOICEVOX_URL = http://localhost:50021

# 🎙️ VOICEVOXによる音声合成ストリーミング開始
[INFO] Fetching audio query for Speaker 10,  (SIRIUS)... SUCCESS (230ms) # 🎤 雨晴はう
[INFO] Fetching audio query for Speaker 68,  (SUPICA)... SUCCESS (185ms) # 🎤 あいえるたん

🚨 [WARNING] シリウスのセリフ「ギャル解説始めるっしょ！」のイントネーションがギャルすぎて合成エンジンが一瞬膠着（フリーズ）。
💡 [FIX] スピカが裏でパラメータ `intonationScale` を 1.2 から 1.5 へ動的リマッピングして強制突破！

[SUCCESS] 2人の掛け合い音声トラック「radio_luna_nano_fixed.wav」の結合に成功。
[INFO] DiscordBot: #radio チャンネルへのWAV転送プロトコルを発射完了！