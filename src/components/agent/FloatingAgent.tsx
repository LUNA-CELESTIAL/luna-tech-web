'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { AGENT_MEMBERS, AgentMember, AgentType } from '@/data/agents';

// 6人姉妹全員のIDリスト
const SISTER_IDS = ['luna', 'spica', 'sirius', 'stella', 'selene', 'nano'];

// 出迎え当番：基本は長女ルナ。6日に1度だけ、他の姉妹が当番になる（日替わりで固定）
function pickGreeterId(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  if (dayOfYear % 6 === 5) {
    const others = SISTER_IDS.filter(id => id !== 'luna');
    return others[Math.floor(dayOfYear / 6) % others.length];
  }
  return 'luna';
}

export default function FloatingAgent() {
  const [activeAgent, setActiveAgent] = useState<AgentMember | null>(null);
  const [welcomeText, setWelcomeText] = useState<string>('');
  const [showMessage, setShowMessage] = useState<boolean>(false);

  useEffect(() => {
    try {
      const targetId = pickGreeterId();

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
    } catch (error) {
      console.error('[FloatingAgent Initialization Failed]', error);

      // 安全なフォールバック（万が一のデータ破損時）
      const fallbackLuna = AGENT_MEMBERS['luna'];
      if (fallbackLuna) {
        setActiveAgent(fallbackLuna);
        setWelcomeText(fallbackLuna.welcomeMessages?.[0] || 'ようこそ！ゆっくりしていってね。');
        setShowMessage(true);
      }
    }

    // 12秒後にそっと顔だけに戻る（閉じた後は自動で再び開かない）
    const timer = setTimeout(() => setShowMessage(false), 12000);
    return () => clearTimeout(timer);
  }, []);

  if (!activeAgent) return null;

  const shortName = activeAgent.name.split('（')[0];

  return (
    <aside
      className="fixed bottom-4 right-4 z-30 flex flex-col items-end pointer-events-none sm:bottom-6 sm:right-6"
      aria-label="固定エージェントウィジェット"
    >
      {/* 💬 吹き出しメッセージ（出迎えカード） */}
      {showMessage && (
        <div className="mb-2.5 w-[240px] max-w-[72vw] bg-zinc-950/90 border border-zinc-800 text-zinc-200 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto relative font-sans transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setShowMessage(false)}
            className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="出迎えメッセージを閉じる"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 mb-1 pr-4">
            <span className="text-[11px]">{activeAgent.statusSymbol}</span>
            <span className="font-bold text-xs text-pink-400">
              {activeAgent.name}
            </span>
            <span className="text-[9px] font-mono text-zinc-500">お出迎え中</span>
          </div>
          <p className="leading-snug text-zinc-200 text-xs select-text">
            {welcomeText}
          </p>
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-zinc-950 border-r border-b border-zinc-800 rotate-45" />
        </div>
      )}

      {/* 🖼️ アバターボタン＋名札 */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => setShowMessage((prev) => !prev)}
          className="pointer-events-auto relative group focus:outline-none transition-transform active:scale-95 cursor-pointer"
          aria-label={`${activeAgent.name}の吹き出し切り替え`}
          title={`${activeAgent.name} (${activeAgent.role})`}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-pink-500/40 bg-zinc-950 overflow-hidden shadow-[0_0_15px_rgba(244,114,182,0.15)] group-hover:border-pink-400 group-hover:scale-105 transition-all relative">
            <Image
              src={activeAgent.avatar}
              alt={activeAgent.name}
              fill
              sizes="(max-width: 640px) 56px, 64px"
              className="object-cover object-top"
              priority={false}
            />
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full shadow-sm" />
        </button>
        <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-950/80 border border-zinc-800/80 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
          {shortName}
        </span>
      </div>
    </aside>
  );
}
