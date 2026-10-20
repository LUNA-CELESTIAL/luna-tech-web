// src/components/phied/PostCard.tsx
'use client';

import React, { useState } from 'react';
import { PhiedPost } from '@/types/phied';
import { AGENT_MEMBERS, AgentMember } from '@/data/agents';
import { ExternalLink, Tag, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface PostCardProps {
    log: PhiedPost;
    onImageClick: (url: string, title: string) => void;
    onAgentClick?: (agent: AgentMember) => void;
}

export default function PostCard({ log, onImageClick, onAgentClick }: PostCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    // 画像の読み込み失敗状態を管理するState
    const [imageError, setImageError] = useState(false);

    // エージェントデータの安全な取得（小文字化でキー検索 & フォールバック）
    const agentKey = log.author?.toLowerCase() || 'spica';
    const agentData = AGENT_MEMBERS[agentKey] || null;

    // アイコンと表示名のフォールバック処理
    const statusSymbol = agentData?.statusSymbol || '🐬';
    const displayName = log.authorName || agentData?.name || log.author || 'UNKNOWN_AGENT';

    return (
        <article className="w-full bg-[#08080c] border border-zinc-900 hover:border-pink-500/30 rounded-2xl p-4 md:p-5 transition-all duration-300 shadow-xl space-y-3 font-mono text-zinc-100">

            {/* 1. カードヘッダー（エージェントポップアップトリガー） */}
            <div className="flex items-center justify-between border-b border-zinc-900/80 pb-2 text-xs">
                <button
                    type="button"
                    onClick={() => agentData && onAgentClick?.(agentData)}
                    className="flex items-center gap-2 font-bold text-zinc-200 hover:text-pink-400 transition-colors group/agent cursor-pointer active:scale-95 text-left"
                    title={`${displayName} のプロフィールを見る`}
                >
                    <span className="text-sm group-hover/agent:scale-125 transition-transform duration-200">
                        {statusSymbol}
                    </span>
                    <span className="truncate max-w-[180px] sm:max-w-none">{displayName}</span>
                    <span className="text-[10px] text-zinc-500 font-normal">
                        ({(log.author || 'SPICA').toUpperCase()})
                    </span>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-pink-950/40 border border-pink-900/50 text-[10px] text-pink-400 font-bold">
                        {log.status || 'In Progress'}
                    </span>
                    <span className="text-[10px] text-zinc-600 hidden sm:inline">
                        {log.timestamp || log.date || '2026.10.18'}
                    </span>
                </div>
            </div>

            {/* 2. タイトル & 本文 */}
            <div className="space-y-1.5">
                <h2 className="text-sm md:text-base font-bold text-zinc-100 leading-snug tracking-tight">
                    {log.title}
                </h2>
                {log.content && (
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed line-clamp-2">
                        {log.content}
                    </p>
                )}
            </div>

            {/* 3. アイキャッチ画像（ロード失敗時は枠ごと完全に非表示） */}
            {log.imageSrc && !imageError && (
                <div
                    onClick={() => onImageClick(log.imageSrc!, log.title)}
                    className="w-full rounded-xl overflow-hidden border border-zinc-900/60 relative bg-black/80 mt-1 shadow-inner flex items-center justify-center cursor-zoom-in group p-1"
                >
                    <img
                        src={log.imageSrc}
                        alt={log.title}
                        className="w-full h-auto max-h-[450px] object-contain rounded-lg opacity-90 group-hover:opacity-100 group-hover:scale-[1.01] transition-all duration-300"
                        onError={() => setImageError(true)}
                    />
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/80 border border-zinc-800 text-[9px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity font-mono pointer-events-none backdrop-blur-sm">
                        🔍 TAP_TO_EXPAND
                    </div>
                </div>
            )}

            {/* 4. ハッシュタグ */}
            {log.tags && log.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
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

            {/* 5. インサイト・技術ログ展開アコーディオン */}
            {log.insights && (
                <div className="pt-2 border-t border-zinc-900/60 text-xs">
                    <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-sans">
                            <span className="flex items-center gap-1.5 font-mono text-[10px] text-pink-400 font-bold">
                                <MessageSquare size={12} />
                                【{displayName}のTech Insights】
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
                            >
                                {isExpanded ? (
                                    <><span>COLLAPSE</span><ChevronUp size={12} /></>
                                ) : (
                                    <><span>READ_MORE_LOG</span><ChevronDown size={12} /></>
                                )}
                            </button>
                        </div>

                        <p className={`text-zinc-300 font-sans text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-1'}`}>
                            {log.insights}
                        </p>
                    </div>
                </div>
            )}
        </article>
    );
}