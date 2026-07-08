'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🔮 ギャラリーをハッカーコンソール風にするLucideアイコンを召喚！（ArrowLeftは綺麗にお掃除しただし！）
import { Image as ImageIcon, Sparkles, Terminal, Copy, Check } from 'lucide-react';
import galleryImages from '../../src/data/gallery.json';

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [copied, setCopied] = useState(false);

  // 📝 プロンプトを一発コピーする便利ファンクションだし！
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // 🛡️ layout.tsxのスクロールに100%同調させるため、最外周をシンプルに高さいっぱいの漆黒＆overflow-hiddenに！
    <div className="min-h-screen bg-[#020204] text-zinc-100 p-4 md:p-8 font-sans selection:bg-pink-500/30 relative overflow-hidden">
      
      {/* 🌌 【作戦01】裏側で怪しく蠢く、ギャラリー専用のマゼンタ・コアオーラ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{
            x: ['20%', '-10%', '10%', '20%'],
            y: ['-10%', '20%', '-20%', '-10%'],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/4 w-[55vw] h-[55vw] bg-fuchsia-950/15 rounded-full blur-[140px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(#1f1f23_1px,transparent_1px)] [background-size:32px_32px] opacity-20"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* ヘッダーエリア（右側の個別 Back リンクを綺麗に排除しただし！） */}
        <div className="border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="text-2xl drop-shadow-[0_0_15px_rgba(217,70,239,0.5)] z-10">🖼️</span>
              <ImageIcon className="absolute w-8 h-8 text-fuchsia-500/20 animate-pulse pointer-events-none" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight font-mono text-zinc-100 flex items-center gap-1.5">
                LUNA_LOVE_BIT / <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400 drop-shadow-[0_0_10px_rgba(240,46,170,0.3)]">GALLERY</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium font-sans">
                ComfyUIの深層回路で観測された、AIエージェントたちの美麗ビジュアルログ
              </p>
            </div>
          </div>
        </div>

        {/* 画像グリッドレイアウト：【作戦02】常時ほんのり発光＆ホバーで超浮き出しエフェクトだし！ */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {galleryImages.map((img) => (
            <motion.div 
              key={img.id}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => setSelectedImage(img)}
              className="group relative bg-zinc-950/60 border border-zinc-900/80 hover:border-fuchsia-500/60 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-2xl backdrop-blur-sm"
              style={{
                boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.01)`
              }}
            >
              {/* 画像コンテナ */}
              <div className={`${img.aspect} w-full bg-black overflow-hidden relative`}>
                <img 
                  src={img.src} 
                  alt={img.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* 常時うっすら、下部にグラデーション影を敷いて文字の視認性を確保だし */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>

              {/* ホバー時にシュパッとせり上がってくるネオン情報レイヤー */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-[#020204]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 p-4 flex flex-col justify-end text-[11px] font-mono backdrop-blur-[2px]">
                <span className="text-zinc-200 font-bold truncate tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{img.title}</span>
                <span className="text-fuchsia-400 font-bold mt-0.5 flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-fuchsia-500" /> by {img.agent}
                </span>
              </div>
              
              {/* インデックスバッジ */}
              <span className="absolute top-3 right-3 text-[9px] font-mono bg-black/80 border border-zinc-900/80 text-zinc-500 group-hover:text-fuchsia-400 group-hover:border-fuchsia-950 px-2 py-0.5 rounded-lg shadow-md transition-colors">
                #{img.id}
              </span>
            </motion.div>
          ))}
        </div>

        {/* =========================================================================
            🔮 【作戦03】モーダルウィンドウのSFホログラムカプセル化（AnimatePresence対応）
           ========================================================================= */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-8"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="bg-[#050508]/95 border border-fuchsia-950/50 hover:border-fuchsia-500/30 rounded-2xl max-w-4xl w-full p-5 md:p-6 space-y-4 shadow-[0_0_50px_rgba(217,70,239,0.15)] flex flex-col md:flex-row gap-6 max-h-[85vh] overflow-y-auto relative backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 左側：シネマティックアートフレーム */}
                <div className="w-full md:w-1/2 flex items-center justify-center bg-black rounded-xl border border-zinc-900 overflow-hidden shadow-inner relative group">
                  <img src={selectedImage.src} alt={selectedImage.title} className="w-full h-auto max-h-[55vh] object-contain transition-transform duration-500" />
                </div>

                {/* 右側：インフォメーション端末パネル */}
                <div className="w-full md:w-1/2 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    {/* ダイアログ上部 */}
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                      <h2 className="text-sm font-black text-zinc-100 font-mono tracking-wide flex items-center gap-1.5">
                        <span className="text-fuchsia-500">#{selectedImage.id}</span> {selectedImage.title}
                      </h2>
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="text-xs font-bold bg-zinc-950 border border-zinc-900 hover:border-pink-500/40 text-zinc-400 hover:text-pink-400 w-6 h-6 rounded-full flex items-center justify-center font-mono transition-colors shadow-md"
                      >
                        ✕
                      </button>
                    </div>

                    {/* スペックデータ */}
                    <div className="text-[11px] space-y-3.5 font-mono">
                      <div className="flex items-center gap-2 bg-zinc-950/60 p-2 rounded-xl border border-zinc-900/60">
                        <span className="text-fuchsia-400 font-bold flex items-center gap-1 shrink-0">
                          🤖 Operator:
                        </span>
                        <span className="text-zinc-300 font-bold">{selectedImage.agent}</span>
                      </div>
                      
                      {/* プロンプトログ：クリックで爆速コピー可能だし！ */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1 text-[10px]">
                          <span className="text-purple-400 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" /> ComfyUI Core Prompt
                          </span>
                          {/* コピー成功時に文字とアイコンがシュッと変わるおもてなし演出 */}
                          <button 
                            onClick={() => handleCopy(selectedImage.prompt)}
                            className="text-zinc-500 hover:text-fuchsia-400 transition-colors flex items-center gap-1 font-bold"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'COPIED!' : 'CLICK_TO_COPY'}</span>
                          </button>
                        </div>
                        <div 
                          onClick={() => handleCopy(selectedImage.prompt)}
                          className="bg-black/80 p-3 rounded-xl border border-zinc-900 text-zinc-400 text-[10px] leading-relaxed max-h-40 overflow-y-auto select-all cursor-pointer hover:border-fuchsia-950 hover:text-zinc-200 transition-all shadow-inner font-sans text-justify"
                          title="Click to Copy Prompt"
                        >
                          {selectedImage.prompt}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* フッターサイン */}
                  <div className="text-[9px] text-zinc-600 font-mono text-right tracking-widest pt-2 border-t border-zinc-900/60">
                    SYSTEM_LOG // LUNA_LOVE_BIT_GEN_VIZ
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}