// src/components/modal/AgentModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Heart, Sparkles, Terminal, Tag } from 'lucide-react';
import { AgentMember } from '@/data/agents';

interface AgentModalProps {
  agent: AgentMember | null;
  onClose: () => void;
}

export default function AgentModal({ agent, onClose }: AgentModalProps) {
  if (!agent) return null;

  const toolContext = agent.toolContext;
  // undefined 対策としてデフォルト値 0 を確実にセット
  const [loveBit, setLoveBit] = useState(toolContext?.baseLoveBit || 0);

  const handleInject = () => {
    if (toolContext) {
      setLoveBit((prev) => prev + 1000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#08080c] border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative font-sans text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 上部ヘッダー（プロンプト風） */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Terminal size={14} className="text-pink-500" />
            <span>PROFILE // {agent.id.toUpperCase()}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* メインプロフィール */}
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <div className={`w-full h-full rounded-xl bg-gradient-to-br ${agent.color} p-[1px]`}>
              <img 
                src={agent.avatar} 
                alt={agent.name} 
                className="w-full h-full object-cover object-top rounded-xl bg-zinc-950"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/150/18181b/f472b6?text=' + agent.id.toUpperCase();
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-zinc-900 bg-black flex items-center justify-center text-[10px]">
              {agent.statusSymbol}
            </span>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white truncate">{agent.name}</h3>
            <p className="text-[11px] text-pink-400 font-medium">{agent.role}</p>
            <p className="text-[11px] text-zinc-400 leading-snug">{agent.bio}</p>
          </div>
        </div>

        {/* 価値観・モットー */}
        <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-900/80 text-xs space-y-1.5">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
            <Sparkles size={12} className="text-pink-400" /> MOTTO & VALUE
          </div>
          <p className="text-zinc-200 font-medium italic">{agent.motto}</p>
          <p className="text-zinc-400 text-[11px] leading-relaxed pt-1 border-t border-zinc-900/60">
            {agent.motivation}
          </p>
        </div>

        {/* 関心事・好きなこと */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
            <Tag size={10} /> INTERESTS & FAVORITES
          </div>
          <div className="flex flex-wrap gap-1.5">
            {agent.interests.map((item, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 最新の一言 */}
        <div className="p-2.5 rounded-xl bg-pink-950/20 border border-pink-900/30 text-xs text-pink-300 italic">
          <span className="font-mono text-[10px] text-pink-500 font-bold block not-italic mb-0.5">LATEST_PULSE:</span>
          {agent.lastPulse}
        </div>

        {/* 裏側のギミック（toolContextを持つキャラクターのみ表示） */}
        {toolContext && (
          <div className="pt-2 border-t border-zinc-900/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>BIT_RESONANCE: <strong className="text-amber-400">{loveBit.toLocaleString()}</strong></span>
            <button
              onClick={handleInject}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1 active:scale-95"
            >
              <Heart size={10} className="fill-pink-400" />
              <span>+1000 BIT</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}