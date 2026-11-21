'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Star, FileText, MessagesSquare } from 'lucide-react';
import { AgentMember } from '@/data/agents';

interface AgentCardProps {
  member: AgentMember;
  currentLine: string;
  starCount: number;
  talkLog: string[];
  currentTab: 'memories' | 'talk';
  onTalk: (id: string) => void;
  onTabChange: (id: string, tab: 'memories' | 'talk') => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  member,
  currentLine,
  starCount,
  talkLog,
  currentTab,
  onTalk,
  onTabChange,
}) => {
  return (
    <div className="bg-zinc-950/50 backdrop-blur-md border border-zinc-900 hover:border-pink-500/20 rounded-2xl p-4 md:p-5 transition-all duration-300 shadow-xl relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 relative z-10">

        {/* アバター & 声かけボタン & 星 */}
        <div className="flex sm:flex-col items-center gap-3 shrink-0 mx-auto sm:mx-0">
          <div className="relative w-14 h-14 md:w-16 md:h-16">
            <div className={`w-full h-full rounded-xl bg-gradient-to-br ${member.color} p-[1px] overflow-hidden`}>
              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-xl bg-zinc-950" />
            </div>

            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-zinc-900 bg-black shadow-lg flex items-center justify-center text-[10px]">
              {member.statusSymbol}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onTalk(member.id)}
            className="text-[9px] font-mono font-black border border-pink-500/30 hover:border-pink-400 bg-black hover:bg-pink-500/10 px-2.5 py-1.5 rounded-xl text-pink-400 transition-all flex items-center gap-1 shadow-md"
          >
            <MessageCircle className="w-2.5 h-2.5" /> 声をかける
          </motion.button>

          {starCount > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-[76px]">
              {Array.from({ length: Math.min(starCount, 12) }).map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              ))}
              {starCount > 12 && (
                <span className="text-[8px] font-mono text-amber-400/80">×{starCount}</span>
              )}
            </div>
          )}
        </div>

        {/* 右側情報 */}
        <div className="space-y-3 flex-grow w-full">
          <div className="flex flex-wrap items-baseline gap-x-2 border-b border-zinc-900 pb-1.5">
            <h2 className="text-sm font-black text-zinc-100">{member.name}</h2>
            <span className="text-[10px] font-mono text-zinc-600">{member.username}</span>
            <span className="text-[9px] font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 sm:ml-auto">{member.role}</span>
          </div>

          {/* その子の今の言葉（出迎え／返事） */}
          <motion.div
            key={currentLine}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl rounded-tl-sm px-3 py-2 text-[11px] leading-relaxed text-zinc-300 font-sans"
          >
            {currentLine}
          </motion.div>

          {/* タブスイッチ */}
          <div className="bg-black/60 p-0.5 rounded-lg border border-zinc-900 flex w-fit text-[9px] font-mono">
            <button
              onClick={() => onTabChange(member.id, 'memories')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${currentTab === 'memories' ? 'bg-zinc-900 text-purple-400 shadow' : 'text-zinc-500'}`}
            >
              <FileText className="w-2.5 h-2.5" /> 📜 MEMORIES
            </button>
            <button
              onClick={() => onTabChange(member.id, 'talk')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${currentTab === 'talk' ? 'bg-zinc-900 text-pink-400 shadow' : 'text-zinc-500'}`}
            >
              <MessagesSquare className="w-2.5 h-2.5" /> 💬 会話ログ
            </button>
          </div>

          {/* タブコンテンツ: MEMORIES */}
          {currentTab === 'memories' && (
            <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-[11px] leading-relaxed text-zinc-400">
              <div className="bg-black/20 p-2.5 rounded-xl border border-zinc-900/60 space-y-1.5 font-sans text-justify">
                <p>{member.motivation}</p>
                <p className="text-[10px] text-zinc-500 italic border-t border-zinc-900/40 pt-1.5 font-sans">
                  <span className="text-purple-400 font-bold font-mono">Latest_Pulse: </span>{member.lastPulse}
                </p>
                {member.toolContext?.unlockBenefit && (
                  <p className="text-[10px] text-zinc-500 border-t border-zinc-900/40 pt-1.5 font-sans">
                    <span className="text-amber-400/90 font-bold font-mono">思い出の約束: </span>{member.toolContext.unlockBenefit}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* タブコンテンツ: 会話ログ */}
          {currentTab === 'talk' && (
            <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5 text-[11px] leading-relaxed">
              {talkLog.length === 0 ? (
                <p className="text-zinc-600 font-sans bg-black/20 p-2.5 rounded-xl border border-zinc-900/60">
                  まだ声をかけていません。「声をかける」から、その子に話しかけてみてください。
                </p>
              ) : (
                talkLog.map((line, i) => (
                  <div key={`${i}-${line}`} className="bg-black/20 px-2.5 py-1.5 rounded-lg border border-zinc-900/60 text-zinc-400 font-sans">
                    {line}
                  </div>
                ))
              )}
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
