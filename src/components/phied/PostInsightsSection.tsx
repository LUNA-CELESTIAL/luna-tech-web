'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface PostInsightsSectionProps {
    insights: string;
    displayName: string;
    isExpanded?: boolean;
    onToggle?: () => void;
}

export default function PostInsightsSection({ 
    insights, 
    displayName,
    isExpanded: externalIsExpanded,
    onToggle
}: PostInsightsSectionProps) {
    const [internalIsExpanded, setInternalIsExpanded] = useState(false);
    
    // 外部から制御されている場合は externalIsExpanded を優先
    const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
    
    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        } else {
            setInternalIsExpanded(!internalIsExpanded);
        }
    };

    const [insightsTypedText, setInsightsTypedText] = useState("");
    const [isInsightsTyping, setIsInsightsTyping] = useState(false);

    useEffect(() => {
        if (!isExpanded || !insights) {
            setInsightsTypedText("");
            setIsInsightsTyping(false);
            return;
        }

        setIsInsightsTyping(true);
        setInsightsTypedText("");

        const startTimer = setTimeout(() => {
            setIsInsightsTyping(false);
            let charIndex = 0;
            const typingInterval = setInterval(() => {
                if (charIndex < insights.length) {
                    setInsightsTypedText(insights.slice(0, charIndex + 1));
                    charIndex++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 20);

            return () => clearInterval(typingInterval);
        }, 300);

        return () => clearTimeout(startTimer);
    }, [isExpanded, insights]);

    return (
        <div className="pt-2 border-t border-zinc-900/60 text-xs">
            {/* 👇 枠全体に onClick と cursor-pointer を付与して黒い部分どこを押しても開閉するように変更 */}
            <div 
                onClick={handleToggle}
                className={`p-3 rounded-xl border space-y-2 transition-all cursor-pointer select-none group/insights ${
                    isExpanded 
                        ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
                        : 'bg-cyan-950/20 border-cyan-900/40 hover:border-cyan-500/40 hover:bg-cyan-950/30'
                }`}
            >
                <div className="flex items-center justify-between w-full text-[11px] font-sans">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] text-cyan-400 font-bold group-hover/insights:text-cyan-300 transition-colors">
                        <MessageSquare size={12} className="text-cyan-400" />
                        【{displayName}のTech Insights】
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-cyan-500/80 group-hover/insights:text-cyan-400 font-mono transition-colors">
                        <span>{isExpanded ? 'COLLAPSE' : 'READ_MORE_LOG'}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </div>
                </div>

                {!isExpanded && (
                    <p className="text-zinc-400 font-sans text-xs leading-relaxed line-clamp-1 opacity-70">
                        {insights}
                    </p>
                )}

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
    );
}