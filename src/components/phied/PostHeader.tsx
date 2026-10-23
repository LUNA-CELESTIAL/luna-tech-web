'use client';

import React from 'react';
import { PhiedPost } from '@/types/phied';
import { AgentMember } from '@/data/agents';

interface PostHeaderProps {
    log: PhiedPost;
    agentData: AgentMember | null;
    displayName: string;
    onAgentClick?: (agent: AgentMember) => void;
}

export default function PostHeader({ log, agentData, displayName, onAgentClick }: PostHeaderProps) {
    const statusSymbol = agentData?.statusSymbol || '🐬';

    return (
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
    );
}