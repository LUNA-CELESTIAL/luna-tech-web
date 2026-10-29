'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AGENT_MEMBERS, AgentMember, AgentType } from '@/data/agents';

// 6人姉妹全員のIDリスト（完全均等選出用）
const SISTER_IDS = ['luna', 'spica', 'sirius', 'stella', 'selene', 'nano'];

export default function FloatingAgent() {
  const [activeAgent, setActiveAgent] = useState<AgentMember | null>(null);
  const [welcomeText, setWelcomeText] = useState<string>('');
  const [showMessage, setShowMessage] = useState<boolean>(false);

  useEffect(() => {
    try {
      // 6人姉妹から完全均等（各 1/6 ＝ 約 16.6%）で選出
      const randomIdx = Math.floor(Math.random() * SISTER_IDS.length);
      const targetId = SISTER_IDS[randomIdx];

      const selected = AGENT_MEMBERS[targetId];
      if (!selected) {
        throw new Error(`[FloatingAgent Error] Target ID "${targetId}" was not found in AGENT_MEMBERS.`);
      }

      // データ構造からメッセージを抽出（未定義・空配列時の堅牢なフォールバック付き）
      const messages = selected.welcomeMessages && selected.welcomeMessages.length > 0
        ? selected.welcomeMessages
        : ['ようこそ！'];

      const randomMsg = messages[Math.floor(Math.random() * messages.length)];

      setActiveAgent(selected);
      setWelcomeText(randomMsg);
      setShowMessage(true);

      // トレースログ：選出結果をデバッグ出力
      console.log(`[FloatingAgent Trace] Selected: ${selected.name} (${targetId}) / Uniform Probability: 16.6%`);
    } catch (error) {
      // エラーログを詳細に出力して原因特定を容易にする
      console.error('[FloatingAgent Initialization Failed]', error);

      // 安全なフォールバック（万が一のデータ破損時）
      const fallbackLuna = AGENT_MEMBERS['luna'];
      if (fallbackLuna) {
        setActiveAgent(fallbackLuna);
        setWelcomeText(fallbackLuna.welcomeMessages?.[0] || 'ようこそ！ゆっくりしていってね。');
        setShowMessage(true);
      }
    }

    // 4秒後に自動消灯して視界を遮らない
    const timer = setTimeout(() => setShowMessage(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!activeAgent) return null;

  return (
    <aside
      className="fixed bottom-4 right-4 z-30 flex flex-col items-end pointer-events-none sm:bottom-6 sm:right-6"
      aria-label="固定エージェントウィジェット"
    >
      {/* 💬 吹き出しメッセージ */}
      {showMessage && (
        <div className="mb-2.5 max-w-[220px] bg-zinc-950/90 border border-zinc-800 text-zinc-200 text-xs p-3 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto relative font-sans transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px]">{activeAgent.statusSymbol}</span>
            <span className="font-bold text-[11px] text-pink-400">
              {activeAgent.name}
            </span>
          </div>
          <p className="leading-snug text-zinc-300 text-[11px] select-text">
            {welcomeText}
          </p>
          <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-zinc-950 border-r border-b border-zinc-800 rotate-45" />
        </div>
      )}

      {/* 🖼️ アバターボタン */}
      <button
        onClick={() => setShowMessage((prev) => !prev)}
        className="pointer-events-auto relative group focus:outline-none transition-transform active:scale-95 cursor-pointer"
        aria-label={`${activeAgent.name}の吹き出し切り替え`}
        title={`${activeAgent.name} (${activeAgent.role})`}
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-pink-500/40 bg-zinc-950 overflow-hidden shadow-[0_0_15px_rgba(244,114,182,0.15)] group-hover:border-pink-400 group-hover:scale-105 transition-all relative">
          <Image
            src={activeAgent.avatar}
            alt={activeAgent.name}
            fill
            sizes="(max-width: 640px) 48px, 56px"
            className="object-cover object-top"
            priority={false}
          />
        </div>
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full shadow-sm" />
      </button>
    </aside>
  );
}