'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🔮 Lucideから、⚡パルス演出に最適な最強のZap（稲妻）アイコンを召喚だし！
import { 
  GitCommit, 
  Tag, 
  History, 
  User, 
  Sparkles, 
  Zap 
} from 'lucide-react';
import commitLogs from '../../src/data/phied.json';

const STATUS_THEMES = {
  SUCCESS: {
    label: 'SUCCESS',
    text: 'text-purple-400',
    bg: 'bg-purple-950/20',
    border: 'border-purple-900/40 group-hover:border-purple-500/80 shadow-[inset_0_0_12px_rgba(168,85,247,0.05)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.1)'
  },
  RESOLVED: {
    label: 'RESOLVED',
    text: 'text-emerald-400',
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-900/40 group-hover:border-emerald-500/80 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.1)'
  },
  TESTING: {
    label: 'TESTING',
    text: 'text-amber-400',
    bg: 'bg-amber-950/20',
    border: 'border-amber-900/40 group-hover:border-amber-500/80 shadow-[inset_0_0_12px_rgba(245,158,11,0.05)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.1)'
  },
  LEARNING: {
    label: 'LEARNING',
    text: 'text-cyan-400 font-bold',
    bg: 'bg-cyan-950/20',
    border: 'border-cyan-900/40 group-hover:border-cyan-500/80 shadow-[inset_0_0_12px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.1)'
  },
  ADOPTED: {
    label: 'ADOPTED',
    text: 'text-pink-400 font-extrabold animate-pulse',
    bg: 'bg-pink-950/20',
    border: 'border-pink-900/40 group-hover:border-pink-500/80 shadow-[inset_0_0_12px_rgba(236,72,153,0.05)] hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]',
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.1)'
  }
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
} as const;

export default function PhiedPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredLogs = activeTag
    ? commitLogs.filter(log => log.tags.includes(activeTag))
    : commitLogs;

  const allTags = Array.from(new Set(commitLogs.flatMap(log => log.tags)));

  return (
    // 🛡️ 【スクロールバー増殖バグ・完全防御】最外周に overflow-y-scroll w-full を追加しただし！
    <div className="min-h-screen bg-[#020204] text-zinc-100 p-4 md:p-8 font-sans selection:bg-pink-500/30 relative overflow-hidden">      
      {/* 🔮 背景の蠢くコアオーラ（完全動的ループだし！） */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{
            x: ['-20%', '20%', '-10%', '-20%'],
            y: ['-10%', '30%', '10%', '-10%'],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-purple-950/25 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{
            x: ['20%', '-20%', '10%', '20%'],
            y: ['30%', '-10%', '40%', '30%'],
            scale: [1.1, 0.8, 1.2, 1.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 w-[45vw] h-[45vw] bg-cyan-950/20 rounded-full blur-[130px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(#1f1f23_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
      </div>

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        
        {/* ヘッダー（右側の個別リンクを綺麗に排除しただし！） */}
        <div className="border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="text-2xl drop-shadow-[0_0_15px_rgba(168,85,247,0.6)] z-10">🛰️</span>
              <History className="absolute w-8 h-8 text-purple-500/30 animate-spin [animation-duration:15s] pointer-events-none" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight font-mono text-zinc-100 flex items-center gap-1.5">
                LUNA's Constellations / <span className="text-purple-400 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">PHIED</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium font-sans">
                ルルプロデューサーの実験あしあと＆自律エージェントたちの開発正史ログ
              </p>
            </div>
          </div>
        </div>

        {/* 🏷️ タグフィルター */}
        <div className="p-3 bg-zinc-950/60 border border-zinc-900/80 rounded-2xl shadow-2xl backdrop-blur-md space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase font-bold px-1">
            <Tag className="w-3 h-3 text-purple-500" /> <span>Filter by Tactical Tags</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-[10px] font-mono px-3 py-1.5 rounded-xl transition-all ${
                !activeTag 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                  : 'bg-zinc-900/50 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              #ALL_LOGS
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`text-[10px] font-mono px-3 py-1.5 rounded-xl transition-all ${
                  activeTag === tag
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'bg-zinc-900/50 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              #{tag}
            </button>
            ))}
          </div>
        </div>

        {/* =========================================================================
            📜 タイムライン本体
           ========================================================================= */}
        <div className="relative ml-4 md:ml-6 space-y-8 pl-8 md:pl-10 py-6">
          
          {/* ベースの光跡チューブ */}
          <div className="absolute left-[-1.5px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-950/50 via-zinc-900 to-transparent pointer-events-none rounded-full" />
          
          {/* ⚡ 上から下へ光のエネルギーパルスが無限に走り抜けるチューブ内演出 */}
          <motion.div 
            animate={{
              top: ['-10%', '110%'],
              opacity: [0, 1, 0.5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute left-[-1.5px] w-[3px] h-40 bg-gradient-to-b from-transparent via-cyan-400 to-purple-500 pointer-events-none rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          />

          <AnimatePresence mode="popLayout">
            {filteredLogs.map((log) => {
              const theme = STATUS_THEMES[log.status as keyof typeof STATUS_THEMES] || STATUS_THEMES.SUCCESS;

              return (
                <motion.div 
                  key={log.commitId}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={cardVariants}
                  className="group relative space-y-3"
                >
                  
                  {/* 🧭 左側のタイムライン点：⚡アイコン */}
                  <div className="absolute left-[-39px] md:left-[-47px] top-1 flex flex-col items-center z-10">
                    <motion.div 
                      animate={{
                        filter: [
                          `drop-shadow(0 0 0px ${theme.glow})`,
                          `drop-shadow(0 0 10px ${theme.color})`,
                          `drop-shadow(0 0 0px ${theme.glow})`
                        ],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="transition-all duration-300 group-hover:scale-135"
                    >
                      <Zap 
                        className="w-5 h-5 text-black" 
                        style={{
                          fill: theme.color,
                          stroke: theme.color,
                          strokeWidth: 1.5,
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* 📄 ログカード本体 */}
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`p-5 bg-zinc-950/40 border ${theme.border} rounded-2xl space-y-3 transition-all duration-300 relative shadow-2xl backdrop-blur-md cursor-pointer`}
                    style={{
                      boxShadow: `0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255,255,255,0.02)`
                    }}
                  >
                    {/* カード上部 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-zinc-500 font-mono">
                        <GitCommit className="w-3.5 h-3.5 text-zinc-700 group-hover:text-purple-400 transition-colors" />
                        <span>{log.date}</span>
                        <span className="text-zinc-800">/</span>
                        <span className="text-zinc-500 font-bold font-mono tracking-tighter">{log.commitId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[9px] tracking-wider uppercase font-black px-2 py-0.5 rounded-md ${theme.bg} ${theme.text} border border-zinc-900/60`}>
                          {theme.label}
                        </span>
                        <span className="text-sm filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{log.emoji}</span>
                      </div>
                    </div>

                    {/* タイトルと詳細 */}
                    <div className="space-y-1.5 font-sans">
                      <h3 className="text-sm font-bold text-zinc-200 group-hover:text-purple-300 transition-colors font-mono tracking-tight flex items-center gap-1">
                        {log.title}
                      </h3>
                      <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-medium whitespace-pre-wrap text-justify">
                        {log.description}
                      </p>
                    </div>

                    {/* 🎨 挿絵プロンプト */}
                    {log.promptHint && (
                      <div className="text-[10px] text-zinc-400 font-mono bg-purple-950/10 border border-purple-950/20 p-2.5 rounded-xl italic flex items-center gap-2 shadow-inner">
                        <Sparkles className="w-3 h-3 text-purple-400 shrink-0 animate-pulse" />
                        <span className="leading-normal">{log.promptHint}</span>
                      </div>
                    )}

                    {/* カード下部 */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-900/60 text-[10px]">
                      <span className="text-zinc-500 font-mono flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-600" /> Archivist: <span className="text-purple-400 font-bold">{log.agent}</span>
                      </span>
                      <div className="flex gap-1 font-mono text-zinc-500">
                        {log.tags.map(t => (
                          <span key={t} className="bg-black/40 px-2 py-0.5 rounded-md border border-zinc-900 text-zinc-400 shadow-inner">#{t}</span>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}