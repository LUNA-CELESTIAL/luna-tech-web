'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, RefreshCw } from 'lucide-react';
import { AGENT_MEMBERS } from '@/data/agents';
import { AgentCard } from '@/components/modal/AgentCard';
export default function AboutPage() {
  const memberList = Object.values(AGENT_MEMBERS);

  // ステート初期化
  const [currentBits, setCurrentBits] = useState<{ [key: string]: number }>(
    memberList.reduce((acc, m) => ({ ...acc, [m.id]: m.toolContext?.baseLoveBit ?? 0 }), {})
  );

  const [memberLevels, setMemberLevels] = useState<{ [key: string]: number }>(
    memberList.reduce((acc, m) => ({ ...acc, [m.id]: 1 }), {})
  );

  const [activeTabs, setActiveTabs] = useState<{ [key: string]: 'status' | 'log' }>(
    memberList.reduce((acc, m) => ({ ...acc, [m.id]: 'status' }), {})
  );

  const [unlockedTarget, setUnlockedTarget] = useState<{ id: string; name: string; target: string } | null>(null);

  // エネルギー注入
  const injectLoveBit = (id: string) => {
    setCurrentBits(prev => {
      const target = AGENT_MEMBERS[id];
      const unlockCost = target?.toolContext?.nextUnlockCost ?? 50000;
      const nextValue = prev[id] + 1000;

      if (target && nextValue >= unlockCost) {
        setUnlockedTarget({
          id,
          name: target.name,
          target: target.toolContext?.unlockBenefit ?? '機能解放',
        });
      }

      return { ...prev, [id]: nextValue };
    });
  };

  // 周回リセット
  const handleResetAndLevelUp = (id: string) => {
    setMemberLevels(prev => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
    setCurrentBits(prev => ({ ...prev, [id]: 0 }));
    setUnlockedTarget(null);
  };

  // タブ切り替え
  const handleTabChange = (id: string, tab: 'status' | 'log') => {
    setActiveTabs(prev => ({ ...prev, [id]: tab }));
  };

  return (
    <div className="min-h-screen bg-[#020204] text-pink-100 font-sans overflow-hidden relative py-12 md:py-16">
      
      {/* 背景オーラ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[70vw] md:w-[35vw] h-[70vw] md:h-[35vw] bg-pink-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[70vw] md:w-[35vw] h-[70vw] md:h-[35vw] bg-purple-500/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 space-y-8">
        
        {/* ヘッダー */}
        <header className="text-center space-y-4">
          <div className="inline-block bg-zinc-950/90 border border-pink-500/30 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(244,114,182,0.15)] backdrop-blur-sm">
            <span className="text-pink-400 font-black tracking-widest text-[10px] md:text-xs flex items-center gap-1.5 font-mono">
              <Users className="w-3 h-3 text-pink-400 animate-pulse" /> LUNA'S LOOP SYSTEM v4.0
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 tracking-tight leading-snug">
            愛の結晶周回型コントロールタワー<br />
            <span className="text-xs font-medium text-zinc-500 block mt-1 font-mono">【限界突破リセット＆親愛度レベル周回シミュレーター】</span>
          </h1>
        </header>

        {/* メンバーカード一覧 */}
        <div className="space-y-4">
          {memberList.map(member => (
            <AgentCard
              key={member.id}
              member={member}
              currentBitValue={currentBits[member.id] ?? 0}
              currentLevel={memberLevels[member.id] ?? 1}
              currentTab={activeTabs[member.id] ?? 'status'}
              onInject={injectLoveBit}
              onTabChange={handleTabChange}
            />
          ))}
        </div>

      </div>

      {/* リセットモーダル */}
      <AnimatePresence>
        {unlockedTarget && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setUnlockedTarget(null)}
          >
            <motion.div 
              initial={{ scale: 0.93, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 15 }}
              className="bg-[#050508]/95 border border-pink-500/40 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-[0_0_50px_rgba(244,114,182,0.25)] relative font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 bg-amber-500/20 border border-amber-400 rounded-full flex items-center justify-center mx-auto text-lg animate-spin">
                🔄
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                  —— MAXIMUM BIT DETECTED ——
                </h3>
                <p className="text-[11px] text-zinc-400 font-sans">
                  {unlockedTarget.name}のデータ容量がカンストしただし！
                </p>
              </div>
              
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-900 text-left text-[11px] space-y-2 font-sans">
                <div className="text-zinc-500 font-mono">解放された思い出の約束:</div>
                <div className="text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-lg text-center font-sans">
                  {unlockedTarget.target}
                </div>
                <div className="text-[10px] text-zinc-500 font-sans text-center pt-1 italic">
                  ※周回リセットすると親愛Lvが上昇し、もう一度ポチポチを楽しめるだし！
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button 
                  onClick={() => handleResetAndLevelUp(unlockedTarget.id)}
                  className="w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-400 text-xs font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> RESET & COMPATIBILITY UP (周回する)
                </button>
                
                <button 
                  onClick={() => setUnlockedTarget(null)}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-400 text-[10px] py-1.5 rounded-lg transition-all"
                >
                  CLOSE_CONSOLE (今の数値を維持)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}