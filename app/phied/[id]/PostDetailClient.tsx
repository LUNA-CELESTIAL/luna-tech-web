// src/app/phied/[id]/PostDetailClient.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
// 🌟 Next.jsのルーターモジュールを召喚しただし！
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Eye, 
  BookOpen, 
  ShieldAlert, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

interface PostDetailClientProps {
  title: string;
  date: string;
  content: string;
  isReplyMode?: boolean;
}

const AGENT_CONFIG: Record<string, { name: string; color: string; border: string; bg: string; icon: React.ReactNode }> = {
  sirius_catch: { name: "🐈 次女・シリウス [TREND_MARKETER]", color: "text-amber-400", border: "border-amber-500/10", bg: "from-amber-500/[0.04]", icon: <Eye size={14} /> },
  selene_history: { name: "🦚 五女・セレーネ [BRAND_ARCHIVIST]", color: "text-purple-400", border: "border-purple-500/10", bg: "from-purple-500/[0.04]", icon: <BookOpen size={14} /> },
  spica_view: { name: "🐬 三女・スピカ [CHIEF_ARCHITECT]", color: "text-cyan-400", border: "border-cyan-500/10", bg: "from-cyan-500/[0.04]", icon: <Cpu size={14} /> },
  nano_defect: { name: "🐤 六女・ナノ [CAOS_CHALLENGER]", color: "text-rose-400", border: "border-rose-500/10", bg: "from-rose-500/[0.04]", icon: <AlertTriangle size={14} /> },
  spica_fix: { name: "🐬 三女・スピカ [SECURITY_AUDIT]", color: "text-emerald-400", border: "border-emerald-500/10", bg: "from-emerald-500/[0.04]", icon: <ShieldAlert size={14} /> },
  stella_code: { name: "🦔 四女・ステラ [MAIN_PROGRAMMER]", color: "text-indigo-400", border: "border-indigo-500/10", bg: "from-indigo-500/[0.03]", icon: <CheckCircle2 size={14} /> },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
} as const;

export default function PostDetailClient({ title, date, content, isReplyMode = false }: PostDetailClientProps) {
  const [stellaTab, setStellaTab] = useState<'code' | 'demo'>('demo');
  // 🌟 ルーターのインスタンスを初期化！
  const router = useRouter();

  const parseSections = (rawContent: string) => {
    if (!rawContent) return [];
    const sections: { type: string; body: string }[] = [];
    const regex = /<(sirius_catch|selene_history|spica_view|nano_defect|spica_fix|stella_code)>([\s\S]*?)<\/\1>/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(rawContent)) !== null) {
      if (match.index > lastIndex) {
        const text = rawContent.substring(lastIndex, match.index).trim();
        if (text) sections.push({ type: 'prose', body: text });
      }
      sections.push({ type: match[1], body: match[2].trim() });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < rawContent.length) {
      const text = rawContent.substring(lastIndex).trim();
      if (text) sections.push({ type: 'prose', body: text });
    }
    return sections;
  };

  const articleSections = parseSections(content);

  return (
    <div className={isReplyMode ? "w-full text-zinc-100 text-left" : "min-h-screen bg-[#050507] text-zinc-100 font-sans antialiased pb-24 overflow-x-hidden"}>
      
      {!isReplyMode && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-gradient-to-b from-purple-950/20 via-cyan-950/10 to-transparent blur-[120px] pointer-events-none -z-10" />
          <header className="max-w-4xl mx-auto px-6 pt-12 pb-6 flex items-center justify-between border-b border-zinc-900/60 backdrop-blur-sm">
            {/* ⭕ 固定リンクから、履歴を1つ戻る魔法のボタンに完全リファクタリングだし！ */}
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-cyan-400 transition-colors group cursor-pointer bg-transparent border-0 p-0 select-none"
            >
              <ArrowLeft size={14} className="transform group-hover:-translate-x-0.5 transition-transform" />
              <span>RETURN_TO_GATE</span>
            </button>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-900">
              <Terminal size={11} className="text-cyan-500" />
              <span>LUNA_PROTOCOL_V1_STREAM</span>
            </div>
          </header>
        </>
      )}

      <main className={isReplyMode ? "w-full mt-4" : "max-w-2xl mx-auto px-6 mt-16 relative"}>
        <div className="relative pl-8 space-y-8">
          <div className="absolute left-[6px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-zinc-900 via-zinc-800/40 to-zinc-900 pointer-events-none" />

          {!isReplyMode && (
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-2 mb-16">
              <span className="text-[10px] font-mono text-cyan-400 tracking-widest block">RUNNING_STREAM</span>
              <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-zinc-100">{title}</h1>
              <span className="text-xs font-mono text-zinc-600 block">{date}</span>
            </motion.div>
          )}

          {articleSections.map((section, idx) => {
            const cfg = AGENT_CONFIG[section.type];
            if (!cfg) return null;

            if (section.type === 'stella_code') {
              const splitRegex = /(?:###?\s*【?期待されるコンソール出力結果】?|#\s*───\s*【?期待されるコンソール出力結果】?\s*───)/i;
              const parts = section.body.split(splitRegex);
              const codeContent = parts[0]?.replace(/```python|```/g, '').trim();
              const logContent = parts[1]?.replace(/```/g, '').trim();

              return (
                <motion.section key={idx} initial="hidden" animate="visible" variants={fadeInUp} className="relative w-full">
                  <div className="absolute -left-[32px] top-[22px] w-3 h-3 -translate-x-1/2 rounded-full bg-[#050507] border-2 border-indigo-500 shadow-md shadow-indigo-500/20 z-10" />
                  <div className={`rounded-xl border ${cfg.border} bg-gradient-to-b ${cfg.bg} to-transparent p-4 space-y-4 shadow-xl backdrop-blur-sm w-full`}>
                    <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
                      <div className={`flex items-center gap-2 ${cfg.color} font-mono text-xs`}>{cfg.icon} <span>{cfg.name}</span></div>
                      <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-900">
                        <button onClick={() => setStellaTab('code')} className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${stellaTab === 'code' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25' : 'text-zinc-500'}`}>💻 CODE</button>
                        <button onClick={() => setStellaTab('demo')} className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${stellaTab === 'demo' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-zinc-500'}`}>🖥️ DEMO</button>
                      </div>
                    </div>
                    {stellaTab === 'demo' ? (
                      <pre className="p-3 text-cyan-400 rounded-lg bg-black text-[11px] font-mono overflow-x-auto whitespace-pre"><code>{logContent || 'SUCCESS'}</code></pre>
                    ) : (
                      <pre className="p-3 text-zinc-300 rounded-lg bg-zinc-950 text-[11px] font-mono overflow-x-auto whitespace-pre"><code>{codeContent}</code></pre>
                    )}
                  </div>
                </motion.section>
              );
            }

            const parts = section.body.split('```');
            return (
              <motion.section key={idx} initial="hidden" animate="visible" variants={fadeInUp} className="relative w-full">
                <div className={`absolute -left-[32px] top-[22px] w-3 h-3 -translate-x-1/2 rounded-full bg-[#050507] border-2 z-10 ${
                  section.type === 'sirius_catch' ? 'border-amber-400' : section.type === 'selene_history' ? 'border-purple-400' : section.type === 'spica_view' ? 'border-cyan-400' : section.type === 'nano_defect' ? 'border-rose-400' : 'border-emerald-400'
                }`} />
                <div className={`rounded-xl border ${cfg.border} bg-gradient-to-b ${cfg.bg} to-transparent p-4 space-y-3 shadow-sm w-full`}>
                  <div className={`flex items-center gap-2 ${cfg.color} font-mono text-xs`}>{cfg.icon} <span>{cfg.name}</span></div>
                  <div className="space-y-3">
                    {parts.map((part, pIdx) => {
                      const trimmed = part.trim();
                      if (!trimmed) return null;
                      if (pIdx % 2 !== 0) {
                        return (
                          <pre key={pIdx} className="p-3 text-zinc-400 rounded-lg bg-zinc-950 text-[11px] font-mono overflow-x-auto whitespace-pre"><code>{trimmed.replace(/^(text|python|javascript|tsx|html)\b/g, '').trim()}</code></pre>
                        );
                      }
                      return <p key={pIdx} className="text-zinc-300 text-xs md:text-sm leading-relaxed font-sans whitespace-pre-wrap">{trimmed}</p>;
                    })}
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>
      </main>
    </div>
  );
}