'use client';

import React, { useState, useEffect } from 'react';
import { PhiedPost } from '@/types/phied';
import { AGENT_MEMBERS, AgentMember } from '@/data/agents';
import { Tag, MessageSquare, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

interface PostCardProps {
    log: PhiedPost;
    onImageClick: (url: string, title: string) => void;
    onAgentClick?: (agent: AgentMember) => void;
}

export default function PostCard({ log, onImageClick, onAgentClick }: PostCardProps) {
    // Insights 展開 & ストリーミング用 State
    const [isExpanded, setIsExpanded] = useState(false);
    const [insightsTypedText, setInsightsTypedText] = useState("");
    const [isInsightsTyping, setIsInsightsTyping] = useState(false);

    // Replies 展開 & ストリーミング用 State
    const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
    const [visibleReplyIndex, setVisibleReplyIndex] = useState(0);
    const [typedText, setTypedText] = useState("");
    const [isTypingPhase, setIsTypingPhase] = useState(false);

    const [imageError, setImageError] = useState(false);

    const agentKey = log.author?.toLowerCase() || 'spica';
    const agentData = AGENT_MEMBERS[agentKey] || null;

    const statusSymbol = agentData?.statusSymbol || '🐬';
    const displayName = log.authorName || agentData?.name || log.author || 'UNKNOWN_AGENT';

    const replies = log.replies || [];

    // 🌸 Tech Insights ストリーミング演出タイマー
    useEffect(() => {
        if (!isExpanded || !log.insights) {
            setInsightsTypedText("");
            setIsInsightsTyping(false);
            return;
        }

        setIsInsightsTyping(true);
        setInsightsTypedText("");

        const fullInsights = log.insights;
        const startTimer = setTimeout(() => {
            setIsInsightsTyping(false);
            let charIndex = 0;
            const typingInterval = setInterval(() => {
                if (charIndex < fullInsights.length) {
                    setInsightsTypedText(fullInsights.slice(0, charIndex + 1));
                    charIndex++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 15); // スピーディーにストリーミング出力

            return () => clearInterval(typingInterval);
        }, 800);

        return () => clearTimeout(startTimer);
    }, [isExpanded, log.insights]);

    // 💬 Replies ストリーミング演出タイマー
    useEffect(() => {
        if (!isRepliesExpanded || replies.length === 0) {
            setVisibleReplyIndex(0);
            setTypedText("");
            setIsTypingPhase(false);
            return;
        }

        if (visibleReplyIndex < replies.length) {
            setIsTypingPhase(true);
            setTypedText("");

            const currentReply = replies[visibleReplyIndex];
            const fullContent = currentReply.content || "";

            const startTypingTimer = setTimeout(() => {
                setIsTypingPhase(false);

                let charIndex = 0;
                const typingInterval = setInterval(() => {
                    if (charIndex < fullContent.length) {
                        setTypedText(fullContent.slice(0, charIndex + 1));
                        charIndex++;
                    } else {
                        clearInterval(typingInterval);
                        setTimeout(() => {
                            setVisibleReplyIndex((prev) => prev + 1);
                        }, 2000);
                    }
                }, 25);

                return () => clearInterval(typingInterval);
            }, 1000);

            return () => clearTimeout(startTypingTimer);
        }
    }, [isRepliesExpanded, visibleReplyIndex, replies]);

    return (
        <article className="w-full bg-[#08080c] border border-zinc-900 hover:border-pink-500/30 rounded-2xl p-4 md:p-5 transition-all duration-300 shadow-2xl space-y-3 font-mono text-zinc-100">

            {/* 1. カードヘッダー */}
            <div className="flex items-center justify-between border-b border-zinc-900/80 pb-2.5 text-xs">
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
                    <span className="px-2 py-0.5 rounded bg-pink-950/40 border border-pink-900/50 text-[10px] text-pink-400 font-bold tracking-wider">
                        {log.status || 'ONLINE'}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-mono hidden sm:inline">
                        {log.timestamp || log.date || '2026.10.18'}
                    </span>
                </div>
            </div>

            {/* 2. タイトル & 本文（HIDE_FULL_TEXT は全廃してスッキリ表示） */}
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

            {/* 3. アイキャッチ画像 */}
            {log.imageSrc && !imageError && (
                <div className="w-full rounded-xl overflow-hidden border border-zinc-900/80 relative bg-black/90 mt-1 shadow-inner flex items-center justify-center p-1">
                    <div
                        onClick={() => onImageClick(log.imageSrc!, log.title)}
                        className="w-full relative cursor-zoom-in group flex items-center justify-center"
                    >
                        <img
                            src={log.imageSrc}
                            alt=""
                            className="w-full h-auto max-h-[420px] object-contain rounded-lg opacity-90 group-hover:opacity-100 group-hover:scale-[1.01] transition-all duration-300"
                            onError={() => setImageError(true)}
                        />
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/80 border border-zinc-800 text-[9px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity font-mono pointer-events-none backdrop-blur-sm">
                            🔍 TAP_TO_EXPAND
                        </div>
                    </div>
                </div>
            )}

            {/* 🎬 3.5. 動画専用表示エリア（パターンB：videoSrcが存在する場合のみレンダリング） */}
            {log.videoSrc && (
                <div className="w-full rounded-xl overflow-hidden border border-pink-500/30 relative bg-black/90 mt-2 shadow-2xl flex flex-col items-center justify-center p-1">
                    <div className="w-full flex items-center justify-between px-2 py-1 text-[10px] text-pink-400 font-mono border-b border-zinc-900/80 mb-1">
                        <span className="flex items-center gap-1.5 font-bold">
                            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                            MOTION_VIDEO_STREAM
                        </span>
                        <span className="text-zinc-600">MINIMAX_H3</span>
                    </div>
                    <video
                        src={log.videoSrc}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto max-h-[480px] object-contain rounded-lg opacity-95 hover:opacity-100 transition-opacity"
                    />
                </div>
            )}
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

            {/* 5. Tech Insights アコーディオン（ライトブルー基調 ＆ ストリーミング演出） */}
            {log.insights && (
                <div className="pt-2 border-t border-zinc-900/60 text-xs">
                    <div className="bg-cyan-950/20 p-3 rounded-xl border border-cyan-900/40 space-y-2 transition-all">
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center justify-between w-full text-[11px] font-sans cursor-pointer group/insights"
                        >
                            <span className="flex items-center gap-1.5 font-mono text-[10px] text-cyan-400 font-bold group-hover/insights:text-cyan-300 transition-colors">
                                <MessageSquare size={12} className="text-cyan-400" />
                                【{displayName}のTech Insights】
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-cyan-500/80 group-hover/insights:text-cyan-400 font-mono transition-colors">
                                <span>{isExpanded ? 'COLLAPSE' : 'READ_MORE_LOG'}</span>
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </div>
                        </button>

                        {/* 閉じてるときは1行プレビュー */}
                        {!isExpanded && (
                            <p className="text-zinc-400 font-sans text-xs leading-relaxed line-clamp-1 opacity-70">
                                {log.insights}
                            </p>
                        )}

                        {/* 開いたときのストリーミング描画 */}
                        {isExpanded && (
                            <div className="pt-1">
                                {isInsightsTyping ? (
                                    <div className="text-[10px] text-cyan-400/90 font-mono animate-pulse flex items-center gap-2 py-1">
                                        <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                        <span>思考ログを展開中...</span>
                                    </div>
                                ) : (
                                    <p className="text-cyan-100/90 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                                        {insightsTypedText}
                                        <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-0.5 animate-pulse" />
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 6. 自律リプライ表示エリア（ピンクトーン ＆ ストリーミング演出付き） */}
            {replies.length > 0 && (
                <div className="pt-2 border-t border-zinc-900/80 space-y-2">
                    <button
                        type="button"
                        onClick={() => setIsRepliesExpanded(!isRepliesExpanded)}
                        className="flex items-center justify-between w-full text-[11px] text-zinc-400 hover:text-pink-400 font-mono transition-colors py-1 cursor-pointer group"
                    >
                        <span className="flex items-center gap-1.5 font-bold text-pink-400 group-hover:scale-105 transition-transform">
                            <MessageCircle size={13} />
                            REPLIES ({replies.length})
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            {isRepliesExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </div>
                    </button>

                    {isRepliesExpanded && (
                        <div className="space-y-2.5 pl-2.5 border-l-2 border-pink-500/30 mt-1">
                            {/* 出力完了したリプライ */}
                            {replies.slice(0, visibleReplyIndex).map((reply, index) => {
                                const replyAgentKey = reply.author?.toLowerCase() || 'spica';
                                const replyAgentData = AGENT_MEMBERS[replyAgentKey];
                                const replySymbol = replyAgentData?.statusSymbol || '💬';
                                const replyName = reply.authorName || replyAgentData?.name || reply.author;

                                return (
                                    <div key={reply.replyId || index} className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-850 space-y-2 shadow-md">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                                                <span>{replySymbol}</span>
                                                <span className="text-pink-300">{replyName}</span>
                                                {reply.pattern && (
                                                    <span className="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-500 font-mono">
                                                        {reply.pattern}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-zinc-600 font-mono text-[9px]">
                                                {reply.timestamp || reply.createdAt}
                                            </span>
                                        </div>

                                        <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                                            {reply.stamp && <span className="mr-1.5">{reply.stamp}</span>}
                                            {reply.content}
                                        </p>

                                        {/* 🎙️ 音声再生プレイヤーエリア（audioSrcが存在する場合のみ表示） */}
                                        {reply.audioSrc && (
                                            <div className="pt-1">
                                                <audio
                                                    controls
                                                    src={reply.audioSrc}
                                                    className="w-full h-7 rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                                                    preload="none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* ストリーミング出力中のリプライ */}
                            {visibleReplyIndex < replies.length && (
                                <div className="bg-zinc-950/90 p-3 rounded-xl border border-pink-500/40 space-y-1.5 shadow-lg transition-all">
                                    {isTypingPhase ? (
                                        <div className="text-[11px] text-pink-400 font-mono animate-pulse flex items-center gap-2 py-1">
                                            <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                                            <span>{replies[visibleReplyIndex]?.authorName || 'メンバー'} が入力中...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between text-[10px]">
                                                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                                                    <span>💬</span>
                                                    <span className="text-pink-300">{replies[visibleReplyIndex]?.authorName}</span>
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                                                {typedText}
                                                <span className="inline-block w-1.5 h-3 bg-pink-500 ml-0.5 animate-pulse" />
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}