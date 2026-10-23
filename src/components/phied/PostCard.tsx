'use client';

import React from 'react';
import { PhiedPost } from '@/types/phied';
import { AGENT_MEMBERS, AgentMember } from '@/data/agents';
import { Tag } from 'lucide-react';

import PostHeader from './PostHeader';
import PostMedia from './PostMedia';
import PostInsightsSection from './PostInsightsSection';
import PostRepliesSection from './PostRepliesSection';

interface PostCardProps {
    log: PhiedPost;
    onImageClick: (url: string, title: string) => void;
    onAgentClick?: (agent: AgentMember) => void;
}

export default function PostCard({ log, onImageClick, onAgentClick }: PostCardProps) {
    const agentKey = log.author?.toLowerCase() || 'spica';
    const agentData = AGENT_MEMBERS[agentKey] || null;
    const displayName = log.authorName || agentData?.name || log.author || 'UNKNOWN_AGENT';
    const replies = log.replies || [];

    return (
        <article className="w-full bg-[#08080c] border border-zinc-900 hover:border-pink-500/30 rounded-2xl p-4 md:p-5 transition-all duration-300 shadow-2xl space-y-3 font-mono text-zinc-100">
            {/* 1. ヘッダー */}
            <PostHeader log={log} agentData={agentData} displayName={displayName} onAgentClick={onAgentClick} />

            {/* 2. タイトル & 本文 */}
            <div className="space-y-1.5">
                <h2 className="text-sm md:text-base font-bold text-zinc-100 leading-snug tracking-tight">
                    {log.title}
                </h2>
                {log.content && (
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {log.content}
                    </p>
                )}
            </div>

            {/* 3 & 3.5. メディアエリア（画像 & 動画） */}
            <PostMedia log={log} onImageClick={onImageClick} />

            {/* 4. ハッシュタグ */}
            {log.tags && log.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {log.tags.map((tag: string, idx: number) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-850 text-[10px] text-zinc-500 font-mono"
                        >
                            <Tag size={10} className="text-zinc-600" />
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* 5. Tech Insights エリア */}
            {log.insights && (
                <PostInsightsSection insights={log.insights} displayName={displayName} />
            )}

            {/* 6. リプライ表示エリア */}
            {replies.length > 0 && (
                <PostRepliesSection replies={replies} />
            )}
        </article>
    );
}