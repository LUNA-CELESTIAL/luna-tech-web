'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { AGENT_MEMBERS } from '@/data/agents';
import { AgentCard } from '@/components/modal/AgentCard';

type CardTab = 'memories' | 'talk';

export default function AboutPage() {
  const memberList = Object.values(AGENT_MEMBERS);

  // 出迎えの一言（声をかけるたびに、その子の返事に変わる）
  const [currentLines, setCurrentLines] = useState<{ [key: string]: string }>(
    memberList.reduce<{ [key: string]: string }>((acc, m) => ({ ...acc, [m.id]: m.welcomeMessages[0] ?? '' }), {})
  );

  // 声をかけた回数（カードに積もっていく星の数。リセットなし）
  const [starCounts, setStarCounts] = useState<{ [key: string]: number }>(
    memberList.reduce<{ [key: string]: number }>((acc, m) => ({ ...acc, [m.id]: 0 }), {})
  );

  // 今日の会話ログ（新しい順、最大20件）
  const [talkLogs, setTalkLogs] = useState<{ [key: string]: string[] }>(
    memberList.reduce<{ [key: string]: string[] }>((acc, m) => ({ ...acc, [m.id]: [] }), {})
  );

  const [activeTabs, setActiveTabs] = useState<{ [key: string]: CardTab }>(
    memberList.reduce<{ [key: string]: CardTab }>((acc, m) => ({ ...acc, [m.id]: 'memories' }), {})
  );

  // 声をかける：その子が一言返してくれる（今の言葉とは違うものを選ぶ）
  const talkToMember = (id: string) => {
    const member = AGENT_MEMBERS[id];
    if (!member) return;
    const lines = [...member.welcomeMessages, member.lastPulse];
    const current = currentLines[id];
    const candidates = lines.filter(line => line !== current);
    const next = candidates[Math.floor(Math.random() * candidates.length)] ?? lines[0];
    setCurrentLines(prev => ({ ...prev, [id]: next }));
    setStarCounts(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    setTalkLogs(prev => ({ ...prev, [id]: [next, ...(prev[id] ?? [])].slice(0, 20) }));
  };

  // タブ切り替え
  const handleTabChange = (id: string, tab: CardTab) => {
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
              <Users className="w-3 h-3 text-pink-400 animate-pulse" /> LAB MEMBERS // 会いに行く
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 tracking-tight leading-snug">
            ラボのメンバーに、会いに行く<br />
            <span className="text-xs font-medium text-zinc-500 block mt-1 font-mono">【声をかけると、言葉が返ってくる場所】</span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 font-sans leading-relaxed">
            8人のメンバーがここにいます。「声をかける」を押すと、その子が一言返してくれます。返ってきた言葉は会話ログに残って、星も少しずつ増えていきます。
          </p>
        </header>

        {/* メンバーカード一覧 */}
        <div className="space-y-4">
          {memberList.map(member => (
            <AgentCard
              key={member.id}
              member={member}
              currentLine={currentLines[member.id] ?? ''}
              starCount={starCounts[member.id] ?? 0}
              talkLog={talkLogs[member.id] ?? []}
              currentTab={activeTabs[member.id] ?? 'memories'}
              onTalk={talkToMember}
              onTabChange={handleTabChange}
            />
          ))}
        </div>

      </div>

    </div>
  );
}
