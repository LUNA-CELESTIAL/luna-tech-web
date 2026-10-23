'use client';

import React, { useState, useEffect } from 'react';
import { PhiedReply } from '@/types/phied';
import { AGENT_MEMBERS } from '@/data/agents';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface PostRepliesSectionProps {
    replies: PhiedReply[];
    isRepliesExpanded?: boolean;
    onToggle?: () => void;
}

export default function PostRepliesSection({ 
    replies,
    isRepliesExpanded: externalIsExpanded,
    onToggle
}: PostRepliesSectionProps) {
    const [internalIsExpanded, setInternalIsExpanded] = useState(false);
    
    const isRepliesExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
    
    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        } else {
            setInternalIsExpanded(!internalIsExpanded);
        }
    };

    const [visibleReplyIndex, setVisibleReplyIndex] = useState(0);
    const [typedText, setTypedText] = useState("");
    const [isTypingPhase, setIsTypingPhase] = useState(false);

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
                        }, 1200);
                    }
                }, 30);

                return () => clearInterval(typingInterval);
            }, 600);

            return () => clearTimeout(startTypingTimer);
        }
    }, [isRepliesExpanded, visibleReplyIndex, replies]);

    return (
        <div className="pt-2 border-t border-zinc-900/80 space-y-2">
            <button
                type="button"
                onClick={handleToggle}
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
                    {replies.slice(0, visibleReplyIndex).map((reply, index) => {
                        const replyAgentKey = reply.author?.toLowerCase() || 'spica';
                        const replyAgentData = AGENT_MEMBERS[replyAgentKey];
                        const replySymbol = replyAgentData?.statusSymbol || '💬';
                        const replyName = reply.authorName || replyAgentData?.name || reply.author;

                        return (
                            <div key={reply.replyId || index} className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-850 space-y-2 shadow-md animate-fadeIn">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                                        <span>{replySymbol}</span>
                                        <span className="text-pink-300">{replyName}</span>
                                    </span>
                                    <span className="text-zinc-600 font-mono text-[9px]">
                                        {reply.timestamp || reply.createdAt}
                                    </span>
                                </div>

                                <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                                    {reply.stamp && <span className="mr-1.5">{reply.stamp}</span>}
                                    {reply.content}
                                </p>

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
    );
}