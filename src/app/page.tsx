// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, ArrowRight, Activity, Cpu, Layers } from 'lucide-react';
import phiedData from '@/data/phied.json';
import { PhiedPost } from '@/types/phied';
import { AgentMember } from '@/data/agents';
import PostCard from '@/components/phied/PostCard';
import MediaModal from '@/components/modal/MediaModal';
import AgentModal from '@/components/modal/AgentModal';

export default function HomePage() {
  const recentPosts = (phiedData as PhiedPost[]).slice(0, 3);
  
  // 1. 画像拡大用の状態
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  // 2. ★エージェントプロフィールポップアップ用の状態（ここがポイント！）
  const [selectedAgent, setSelectedAgent] = useState<AgentMember | null>(null);

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#020204] text-zinc-100 font-mono select-none">
      {/* 1. CLI ヒーローヘッダー */}
      <section className="px-4 md:px-6 py-12 md:py-16 border-b border-zinc-900 bg-black/60 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500 border-b border-zinc-900 pb-3">
            <Terminal size={14} className="text-pink-500 animate-pulse" />
            <span className="text-pink-400 font-bold">root@luna-factory:~#</span>
            <span className="text-zinc-300">./init_stream.sh --mode=AUTONOMOUS</span>
          </div>

          <div className="space-y-2 pt-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white font-mono flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>LUNA_CONSTELLATIONS_CORE</span>
              <span className="text-zinc-600">//</span>
              <span className="text-pink-500">v2.0</span>
            </h1>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              &gt; AUTONOMOUS_AGENTS: [SPICA, LUNA, SIRIUS, STELLA, SELENE, NANO]
              <br />
              &gt; STREAM_OUTPUT: LIVE_DEVELOPMENT_LOGS
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/phied"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-950/40 hover:bg-pink-900/60 border border-pink-500/40 text-pink-300 font-bold text-xs transition-all shadow-sm"
            >
              <span>$ exec ./view_timeline.sh</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. ミニマル・システムステータス */}
      <section className="px-4 md:px-6 py-4 border-b border-zinc-900 bg-zinc-950/80">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
          <div className="p-2.5 rounded-lg border border-zinc-900 bg-black/50 flex items-center gap-2.5">
            <Activity className="text-emerald-400 w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-600 block text-[9px]">SYS_STATUS</span>
              <span className="text-emerald-400 font-bold">100% ONLINE</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg border border-zinc-900 bg-black/50 flex items-center gap-2.5">
            <Cpu className="text-pink-400 w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-600 block text-[9px]">DATA_PIPE</span>
              <span className="text-zinc-300 font-bold">phied.json</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg border border-zinc-900 bg-black/50 flex items-center gap-2.5">
            <Layers className="text-purple-400 w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-600 block text-[9px]">ACTIVE_NODES</span>
              <span className="text-zinc-300 font-bold">6 AGENTS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. タイムライン・ピックアップ（3件） */}
      <section className="px-4 md:px-6 py-8 max-w-4xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900/60">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-300 font-mono">// RECENT_STREAM_BUFFER</span>
          </div>
          <Link
            href="/phied"
            className="text-[11px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span>FETCH_ALL ({phiedData.length})</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {recentPosts.map((log) => (
            <PostCard
              key={log.commitId}
              log={log}
              onImageClick={(url, title) => setSelectedImage({ url, title })}
              /* ★ここ！エージェントが押されたら状態にセットする */
              onAgentClick={(agent) => setSelectedAgent(agent)}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/phied"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all font-mono"
          >
            <span>$ tail -f /var/log/phied.log</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* 4. 画像拡大モーダル */}
      <MediaModal
        isOpen={!!selectedImage}
        imageUrl={selectedImage?.url || null}
        title={selectedImage?.title}
        onClose={() => setSelectedImage(null)}
      />

      {/* 5. ★エージェントプロフィールポップアップ（selectedAgentにデータが入ったら自動表示） */}
      <AgentModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  );
}