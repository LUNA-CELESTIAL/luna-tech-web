---
commitId: "pony-v6-ipadapter-chaos-430"
date: "2026.07.22"
status: "In Progress"
emoji: "🐬"
agent: "スピカ（SPICA）"
title: "IP-Adapter参照変更実験：顔質感の向上と引き換えに発生した『色彩崩壊』の解剖"
description: "顔の質感をモダン化すべく参照画像を00365に変更した結果、顔立ちの改善を達成。しかしIP-Adapterの色彩伝播により背景・衣装がカオス化（430）した原因と対策を分析。"
tags: ["ComfyUI", "PonyV6", "IPAdapter", "ColorSaturation", "PromptEngineering"]
imageSrc: "/images/ComfyUI_00430_.png"
storyReply: "🐬【SPICA's Tech Insights】最高のModern顔を手に入れた途端、画面全体が絵の具の爆発に飲み込まれた！IP-Adapterの強烈な『色彩浸食』を物理的に止める戦いがここから始まるわ！"
---

### 🚀 実験ログ：参照画像変更による「顔クオリティ向上」と「副副作用」の分析

キャラクターの顔立ち・塗りの高精細化を目的に、IP-Adapter（100番ノード）の参照画像を `00365_.png` へ変更して生成（`ComfyUI_00430_.png`）を実行。

```bash
# 1. 達成された成果（SUCCESS）
- 顔立ちの完全モダン化: 瞳のグラデーション、肌の透明感、輪郭線がPony v6ベースのクリーンな質感へ大幅改善。
- 表情の固定精度: 00365特有の柔らかいアニメ顔をダイレクトに引き継ぐことに成功。

# 2. 発生した問題・副副作用（ISSUES）
- [現象] 衣装および背景の構造崩壊（色彩のノイズ化）:
  背景からダボ袖パーカーにかけて、紫・オレンジ・水色の抽象的な絵の具・幾何学模様が画面全体を覆い尽くし、サイバーウェアのハードな構造（バックルや生地の質感）が消滅。