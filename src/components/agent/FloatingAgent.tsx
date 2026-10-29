'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AGENT_MEMBERS, AgentMember } from '@/data/agents';

// 6人姉妹のIDリスト（※セミリアル層のhina, kohakuを除外）
const SISTER_IDS = ['luna', 'spica', 'sirius', 'stella', 'selene', 'nano'];

export default function FloatingAgent() {
  const [activeAgent, setActiveAgent] = useState<AgentMember | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    try {
      // 70%の確率でルナ、30%の確率で他の姉妹からランダム選出
      const isLuna = Math.random() < 0.7;
      let targetId = 'luna';

      if (!isLuna) {
        const otherSisters = SISTER_IDS.filter((id) => id !== 'luna');
        const randomIdx = Math.floor(Math.random() * otherSisters.length);
        targetId = otherSisters[randomIdx];
      }

      const selected = AGENT_MEMBERS[targetId];
      if (selected) {
        setActiveAgent(selected);
        setShowMessage(true);
      } else {
        console.warn(`[FloatingAgent] Agent dynamic load missing for ID: ${targetId}`);
        setActiveAgent(AGENT_MEMBERS['luna']);
      }
    } catch (error) {
      console.error('[FloatingAgent] Failed to initialize agent widget:', error);
      setActiveAgent(AGENT_MEMBERS['luna']);
    }

    // 吹き出しは4秒後に自動消灯して視界をクリアにする
    const timer = setTimeout(() => setShowMessage(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!activeAgent) return null;

  return (
    <aside
      className="fixed bottom-4 right-4 z-30 flex flex-col items-end pointer-events-none sm:bottom-6 sm:right-6"
      aria-label="固定エージェントウィジェット"
    >
      {/* 💬 セリフ吹き出し */}
      {showMessage && (
        <div className="mb-2.5 max-w-[220px] bg-zinc-950/90 border border-zinc-800 text-zinc-200 text-xs p-3 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto relative font-sans transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px]">{activeAgent.statusSymbol}</span>
            <span className="font-bold text-[11px] text-pink-400">
              {activeAgent.name}
            </span>
          </div>
          <p className="leading-snug text-zinc-300 text-[11px] select-text">
            {activeAgent.lastPulse}
          </p>
          {/* 下部矢印 */}
          <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-zinc-950 border-r border-b border-zinc-800 rotate-45" />
        </div>
      )}

      {/* 🖼️ アバターボタン */}
      <button
        onClick={() => setShowMessage((prev) => !prev)}
        className="pointer-events-auto relative group focus:outline-none transition-transform active:scale-95 cursor-pointer"
        aria-label={`${activeAgent.name}のステータス切り替え`}
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
        {/* オンライン状態インジケーター */}
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full shadow-sm" />
      </button>
    </aside>
  );
}