'use client';

import React from 'react';
import Link from 'next/link';
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

// 🔮 モックデータ（本来は非同期で取得するデータをシネマティックに再現だし！）
const postMock = {
  id: 'pandas-optimization',
  title: 'Pandasの核心定義と本番運用における絶対防衛ライン',
  date: '2026-07-07',
  image: '/images/ComfyUI_00041_.png', 
};

// ✨ Framer Motionのアニメーション設定
// 末尾に「as const」を添えることで、TypeScriptの型エラー（code: 2322）を完全シャットアウトだし！
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
} as const; 

export default function PostDetailPage() {
  const post = postMock;

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 font-sans antialiased selection:bg-purple-500/30 pb-24 overflow-x-hidden">
      
      {/* 🔮 背景に蠢くサイバーネオンオーラ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-gradient-to-b from-purple-950/20 via-cyan-950/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* 🐇 ヘッダー：司令塔ルナのタクティカルコントロールパネル */}
      <header className="border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 shadow-xl shadow-black/40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">🐇</span>
            <div>
              <div className="text-[9px] uppercase tracking-widest text-purple-400 font-mono font-black">LUNA's Command Pipeline</div>
              <h1 className="text-sm font-bold text-zinc-200 font-mono tracking-tight">{post.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 text-zinc-400">
            UI_ENGINE: <span className="text-cyan-400 font-bold animate-pulse">SHADCN_FRAMER_MOTION</span>
          </div>
        </div>
      </header>

      {/* 🎬 メインシアター：1カラム・人間的カタルシス錬成グリッド */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-20 relative">
        
        {/* 🎬 知のタイムラインを貫く光のレイヤードライン */}
        <div className="absolute left-4 sm:left-6 top-16 bottom-16 w-[1px] bg-gradient-to-b from-purple-500/30 via-cyan-500/50 via-rose-500/40 to-emerald-500/30 pointer-events-none hidden md:block" />

        {/* =========================================================================
            🐇 【第0幕：ルナ】 シネマティックイメージ・作戦コードの錬成
           ========================================================================= */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp}
          className="md:pl-10 relative space-y-4"
        >
          <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-purple-500 ring-4 ring-purple-950/50 hidden md:block" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-[10px] uppercase tracking-widest font-black">
              <Eye className="w-3.5 h-3.5" /> <span>🐇 LUNA</span> <span className="text-zinc-700">/</span> <span>ACT_00: VISUAL_MANIFESTO</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">[{post.date}]</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-2xl space-y-3 group overflow-hidden relative">
            <div className="w-full aspect-video bg-zinc-900 rounded-xl border border-zinc-800/40 overflow-hidden relative shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 z-10" />
              <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </motion.section>

        {/* =========================================================================
            🐈 【第1幕：シリウス】 キャッチーに人を連れてくる爆熱サマリー
           ========================================================================= */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp}
          className="md:pl-10 relative space-y-4"
        >
          <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-950/50 hidden md:block" />
          <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px] uppercase tracking-widest font-black">
            <Terminal className="w-3.5 h-3.5" /> <span>🐈 SIRIUS</span> <span className="text-zinc-700">/</span> <span>ACT_01: PRIMARY_EMISSION</span>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.01] blur-2xl rounded-full" />
            <div className="text-zinc-300 text-sm md:text-base leading-relaxed space-y-5 px-0.5">
              <h3 className="text-zinc-100 font-bold text-base md:text-lg pb-2 border-b border-zinc-900 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-amber-400 font-mono tracking-tight">
                ■ なぜ今、Pandasの真価を再定義するのか？
              </h3>
              <p className="text-zinc-300 text-justify whitespace-pre-wrap">
                データ分析の現場において、Pandasはもはや空気のような存在だし！でも、みんなその真のパワーを引き出せてるべか？
                たった数行のコードで数百万行のデータを一瞬で錬成する、その爆熱の「核心定義」をここに叩き込むべ！
              </p>
              <div className="flex items-start gap-2 pl-2 text-xs md:text-sm text-zinc-400 my-1">
                <span className="text-amber-500 mt-1.5 text-[6px]">●</span>
                <span className="flex-1 leading-relaxed">高速なベクトル演算による圧倒的な処理スピード</span>
              </div>
              <div className="flex items-start gap-2 pl-2 text-xs md:text-sm text-zinc-400 my-1">
                <span className="text-amber-500 mt-1.5 text-[6px]">●</span>
                <span className="flex-1 leading-relaxed">直感的なDataFrame構造によるデータの完全支配</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =========================================================================
            🦚 【第2幕：セレーネ】 背景（歴史）を深く語り、完全に心をつかむ
           ========================================================================= */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp}
          className="md:pl-10 relative space-y-3"
        >
          <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-400 ring-4 ring-indigo-950/50 hidden md:block" />
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] uppercase tracking-widest font-black">
            <BookOpen className="w-3.5 h-3.5" /> <span>🦚 SELENE</span> <span className="text-zinc-700">/</span> <span>ACT_02: CHRONICLE_CONTEXT</span>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900/10 border border-zinc-900/60 shadow-xl backdrop-blur-sm relative">
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-serif italic text-justify whitespace-pre-wrap">
              「2008年、ウォール街の奥深くで、一人の青年ウェス・マッキニーは、終わりのないデータの泥沼に溺れかけていました。土日を跨ぎ崩れる日付、欠損という名の空白の暴力。彼が紡いだDataFrameという名の執念は、ただ世界を救う絶対防衛線となったのですわ……。」
            </p>
          </div>
        </motion.section>

        {/* =========================================================================
            🐬 【第3幕 前半：スピカ】 理想のアーキテクチャ・構図の提示
           ========================================================================= */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp}
          className="md:pl-10 relative space-y-4"
        >
          <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-500 ring-4 ring-cyan-950/50 hidden md:block" />
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] uppercase tracking-widest font-black">
            <ShieldAlert className="w-3.5 h-3.5" /> <span>🐬 SPICA</span> <span className="text-zinc-700">/</span> <span>ACT_03_A: IDEAL_ARCHITECTURE</span>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-xl border-l-2 border-l-cyan-500">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold mb-1">Architecture Phase: 01</div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-mono">
              「監査検知。シリウスが提示した機能は強力ですが、本番運用へ組み込むには『型定義の厳格化』と『入力の一貫性』という普遍的な構図を設計する必要があります。これが破綻のない美しき理想のデータパイプラインです。」
            </p>
          </div>
        </motion.section>

        {/* =========================================================================
            🐤 【第4幕：ナノ】 構造的欠陥・落とし穴を冷酷に暴露する（絶望のカウンター）
           ========================================================================= */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp}
          className="md:pl-10 relative space-y-4"
        >
          <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-rose-950/50 hidden md:block" />
          <div className="flex items-center gap-2 text-rose-400 font-mono text-[10px] uppercase tracking-widest font-black">
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> <span>🐤 NANO</span> <span className="text-zinc-700">/</span> <span>ACT_04: STRUCTURAL_DEFECT_ATTACK</span>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/20 via-zinc-950 to-zinc-950 border border-rose-950/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/[0.03] blur-3xl rounded-full" />
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-mono text-rose-300/90 leading-relaxed border-l-2 border-rose-500/50 pl-3">
                「あはは！スピカ、そんな綺麗な教科書通りの設計じゃシステム爆発しちゃうよぉ？だってこのライブラリ、裏ではデータを全部オンメモリに展開するから、数ギガのログを食わせたら一撃でOOM（メモリ枯渇）で死ぬじゃん！その構造的欠陥、どう言い訳するの？🐤」
              </p>
              <div className="text-[9px] font-mono text-rose-500/60 tracking-widest text-right uppercase">
                CRITICAL_VULNERABILITY_EXPOSED //
              </div>
            </div>
          </div>
        </motion.section>

        {/* =========================================================================
            🐬 【第3幕 後半：スピカ】 欠陥を包摂した「真の解決法」への覚醒
           ========================================================================= */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp}
          className="md:pl-10 relative space-y-4"
        >
          <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-950/40 hidden md:block" />
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-[10px] uppercase tracking-widest font-black">
            <Cpu className="w-3.5 h-3.5" /> <span>🐬 SPICA</span> <span className="text-zinc-700">/</span> <span>ACT_03_B: ADAPTIVE_MITIGATION_RESOLVE</span>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-950 to-zinc-950/40 border border-cyan-950/50 shadow-xl border-r-2 border-r-cyan-500">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold mb-1">Architecture Phase: 02 (UPGRADED)</div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-mono text-justify">
              「……再監査完了。ナノの指摘は構造的に正当です。よって、当初の構図を破棄。メモリ枯渇を回避するために『chunksizeによるストリーム分割処理』および『dtypeの明示的制限によるメモリ70%削減』を組み込んだ、動的解決防衛策を再定義。ステラ、このルールでコードを具現化してください。」
            </p>
          </div>
        </motion.section>

        {/* =========================================================================
            🦔 【第5幕：ステラ】 全てをねじ伏せる絶対防衛実装コード
           ========================================================================= */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp}
          className="md:pl-10 relative space-y-4"
        >
          <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-950/50 hidden md:block" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[10px] uppercase tracking-widest font-black">
              <CheckCircle2 className="w-3.5 h-3.5" /> <span>🦔 STELLA</span> <span className="text-zinc-700">/</span> <span>ACT_05: ROBUST_IMPLEMENTATION</span>
            </div>
            <span className="text-[9px] bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded font-mono font-bold">
              SURVIVAL_100%
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-2xl space-y-3">
            <p className="text-xs text-zinc-400 pl-0.5">
              スピカがナノのクソデカカウンターを受けて錬成した「最強の防衛設計」を、1ミリの例外も通さずに形にしたステラ渾身の職人コードだし！
            </p>
            
            <div className="relative rounded-xl overflow-hidden border border-zinc-900 bg-black/50 font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/60 border-b border-zinc-900/80 text-[9px] text-zinc-500">
                <span>stella_pipeline.py (ROBUST_CORE)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> CODE_STABLE
                </span>
              </div>
              <pre className="p-4 text-zinc-300 overflow-x-auto leading-relaxed text-[11px] font-medium bg-zinc-950/40">
{`import pandas as pd
import traceback

def clean_and_optimize_stream(file_path: str):
    try:
        # 🦔 スピカの防衛要求に従い、chunksize指定でメモリ爆発を完全に防ぐだし！
        chunk_list = []
        for chunk in pd.read_csv(file_path, chunksize=10000, encoding='utf-8'):
            # 🛡️ 欠損値は各チャンクごとに美しく補完
            chunk['sales'] = chunk['sales'].interpolate()
            # 📈 category型へ安全変換、メモリ効率を極限まで自律最適化！
            chunk['category'] = chunk['category'].astype('category')
            chunk_list.append(chunk)
            
        return pd.concat(chunk_list)
    except Exception as e:
        print(f"❌ DEF_LOG: {traceback.format_exc()}")
        raise e`}
              </pre>
            </div>
          </div>
        </motion.section>

       {/* 🗺️ フッター */}
        <div className="pt-8 border-t border-zinc-900 text-center md:pl-10">
          <Link href="/" className="group inline-flex items-center text-xs font-mono text-zinc-500 hover:text-purple-400 transition-colors gap-2">
            <ArrowLeft className="w-3 h-3 transform group-hover:-translate-x-1 transition-transform" /> Return to Grand Factory Root (Top)
          </Link>
        </div>

      </div>
    </div>
  );
}