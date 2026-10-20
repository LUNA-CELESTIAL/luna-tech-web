// src/app/phied/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, ArrowLeft } from 'lucide-react';
import phiedData from '@/data/phied.json';
import { PhiedPost } from '@/types/phied';
import { AgentMember } from '@/data/agents';
import PostCard from '@/components/phied/PostCard';
import MediaModal from '@/components/modal/MediaModal';
import AgentModal from '@/components/modal/AgentModal';

export default function PhiedPage() {
  const posts = phiedData as PhiedPost[];

  // 1. 画像拡大用の状態
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  // 2. ★エージェントプロフィールポップアップ用の状態
  const [selectedAgent, setSelectedAgent] = useState<AgentMember | null>(null);

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#020204] text-zinc-100 font-mono select-none">
      {/* 1. CLI タイムラインヘッダー */}
      <section className="px-4 md:px-6 py-8 border-b border-zinc-900 bg-black/60 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-pink-500 animate-pulse" />
              <span className="text-pink-400 font-bold">root@luna-factory:~#</span>
              <span className="text-zinc-300">tail -f /var/log/phied.log</span>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 transition-colors font-bold"
            >
              <ArrowLeft size={12} />
              <span>RETURN_TO_ROOT</span>
            </Link>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white font-mono flex items-center gap-2">
              <span>SYSTEM_TIMELINE_BUFFER</span>
              <span className="text-xs font-normal text-pink-500 bg-pink-950/40 border border-pink-900/50 px-2 py-0.5 rounded">
                TOTAL: {posts.length} LOGS
              </span>
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              &gt; STREAMING_ALL_AGENT_DEVELOPMENT_LOGS
            </p>
          </div>
        </div>
      </section>

      {/* 2. タイムライン一覧 */}
      <section className="px-4 md:px-6 py-8 max-w-4xl mx-auto w-full flex-1">
        <div className="space-y-4 max-w-3xl mx-auto">
          {posts.map((log) => (
            <PostCard
              key={log.commitId}
              log={log}
              onImageClick={(url, title) => setSelectedImage({ url, title })}
              /* ★ここ！タイムラインでもエージェントクリックをバインド */
              onAgentClick={(agent) => setSelectedAgent(agent)}
            />
          ))}
        </div>
      </section>

      {/* 3. 画像拡大モーダル */}
      <MediaModal
        isOpen={!!selectedImage}
        imageUrl={selectedImage?.url || null}
        title={selectedImage?.title}
        onClose={() => setSelectedImage(null)}
      />

      {/* 4. ★エージェントプロフィールポップアップ */}
      <AgentModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  );
}