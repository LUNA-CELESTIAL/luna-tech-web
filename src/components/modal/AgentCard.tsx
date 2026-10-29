'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, Zap, Layers, FileText, Trophy } from 'lucide-react';
import { AgentMember } from '@/data/agents';

interface AgentCardProps {
  member: AgentMember;
  currentBitValue: number;
  currentLevel: number;
  currentTab: 'status' | 'log';
  onInject: (id: string) => void;
  onTabChange: (id: string, tab: 'status' | 'log') => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  member,
  currentBitValue,
  currentLevel,
  currentTab,
  onInject,
  onTabChange,
}) => {
  const unlockCost = member.toolContext?.nextUnlockCost ?? 50000;
  const progress = Math.min(100, Math.floor((currentBitValue / unlockCost) * 100));
  const isReady = currentBitValue >= unlockCost;

  return (
    <div className="bg-zinc-950/50 backdrop-blur-md border border-zinc-900 hover:border-pink-500/20 rounded-2xl p-4 md:p-5 transition-all duration-300 shadow-xl relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 relative z-10">
        
        {/* アバター & 周回数 */}
        <div className="flex sm:flex-col items-center gap-3 shrink-0 mx-auto sm:mx-0">
          <div className="relative w-14 h-14 md:w-16 md:h-16">
            <div className={`w-full h-full rounded-xl bg-gradient-to-br ${member.color} p-[1px] overflow-hidden`}>
              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-xl bg-zinc-950" />
            </div>
            
            <span className="absolute -top-1.5 -left-1.5 bg-black/90 border border-amber-500 text-amber-400 text-[9px] font-black px-1 py-0.5 rounded-md flex items-center gap-0.5 shadow-md font-mono animate-pulse">
              <Trophy className="w-2 h-2 fill-amber-500" /> Lv.{currentLevel}
            </span>
            
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-zinc-900 bg-black shadow-lg flex items-center justify-center text-[10px]">
              {member.statusSymbol}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onInject(member.id)}
            className="text-[9px] font-mono font-black border border-pink-500/30 hover:border-pink-400 bg-black hover:bg-pink-500/10 px-2.5 py-1.5 rounded-xl text-pink-400 transition-all flex items-center gap-1 shadow-md"
          >
            <Zap className="w-2.5 h-2.5 fill-pink-500 text-pink-400" /> INJECT
          </motion.button>
        </div>

        {/* 右側情報 */}
        <div className="space-y-3 flex-grow w-full">
          <div className="flex flex-wrap items-baseline gap-x-2 border-b border-zinc-900 pb-1.5">
            <h2 className="text-sm font-black text-zinc-100">{member.name}</h2>
            <span className="text-[10px] font-mono text-zinc-600">{member.username}</span>
            <span className="text-[9px] font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 sm:ml-auto">{member.role}</span>
          </div>

          {/* タブスイッチ */}
          <div className="bg-black/60 p-0.5 rounded-lg border border-zinc-900 flex w-fit text-[9px] font-mono">
            <button 
              onClick={() => onTabChange(member.id, 'status')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${currentTab === 'status' ? 'bg-zinc-900 text-pink-400 shadow' : 'text-zinc-500'}`}
            >
              <Layers className="w-2.5 h-2.5" /> 📊 MATRIX
            </button>
            <button 
              onClick={() => onTabChange(member.id, 'log')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${currentTab === 'log' ? 'bg-zinc-900 text-purple-400 shadow' : 'text-zinc-500'}`}
            >
              <FileText className="w-2.5 h-2.5" /> 📜 MEMORIES
            </button>
          </div>

          {/* タブコンテンツ: STATUS */}
          {currentTab === 'status' && (
            <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <div className="bg-black/40 p-2.5 rounded-xl border border-zinc-900 font-mono text-[10px] space-y-2">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5" /> CODE: <span className="text-zinc-300 font-bold">{member.toolContext?.algorithmName ?? 'UNKNOWN'}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {currentLevel > 1 && (
                      <span className="text-[8px] text-amber-400 font-bold font-mono">周回ブースト中!</span>
                    )}
                    <motion.span key={currentBitValue} animate={{ scale: [1, 1.05, 1] }} className="text-amber-400 font-black flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 fill-amber-400" /> {currentBitValue.toLocaleString()} / {unlockCost.toLocaleString()} BIT
                    </motion.span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-1 bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                    <motion.div 
                      className={`h-full ${isReady ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-pink-500 to-fuchsia-500'}`}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: 'spring', stiffness: 90 }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold">
                    <span className={isReady ? 'text-emerald-400 flex items-center gap-1' : 'text-zinc-500 flex items-center gap-1'}>
                      <ShieldCheck className="w-2.5 h-2.5" /> {member.toolContext?.unlockBenefit ?? '機能解放'}
                    </span>
                    <span className="text-zinc-500">{progress}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* タブコンテンツ: LOG */}
          {currentTab === 'log' && (
            <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-[11px] leading-relaxed text-zinc-400">
              <div className="bg-black/20 p-2.5 rounded-xl border border-zinc-900/60 space-y-1.5 font-sans text-justify">
                <p>{member.motivation}</p>
                <p className="text-[10px] text-zinc-500 italic border-t border-zinc-900/40 pt-1.5 font-sans">
                  <span className="text-purple-400 font-bold font-mono">Latest_Pulse: </span>{member.lastPulse}
                </p>
              </div>
            </motion.div>
          )}

          <div className="text-[9px] font-mono text-zinc-600 flex items-center justify-between gap-2 pt-1 border-t border-zinc-900/30">
            <div className="truncate text-zinc-500">【{member.bio}】</div>
            <div className="shrink-0">🔮 Fav: <span className="text-zinc-500">{member.interests.join(', ')}</span></div>
          </div>

        </div>
      </div>
    </div>
  );
};