'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Calendar, Users, Cpu, Layers, MapPin, Phone, Mail, Shield } from 'lucide-react';

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-[#020204] text-zinc-300 font-sans selection:bg-pink-500/30 overflow-x-hidden relative py-12 md:py-16">
      
      {/* 🔮 背景の真夜中ネオンエフェクト */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] right-[-10%] w-[70vw] md:w-[45vw] h-[70vw] md:h-[45vw] bg-purple-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[60vw] md:w-[35vw] h-[60vw] md:h-[35vw] bg-pink-500/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      </div>

      {/* 📱 メインコンソール：【大画面対応】max-w-2xl から max-w-5xl（ギャラリー級）へ大解放だし！ */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">
        <div 
          className="bg-black/40 backdrop-blur-xl border border-zinc-900 rounded-2xl p-6 md:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] space-y-8"
          style={{ boxShadow: `0 30px 60px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.02)` }}
        >
          
          {/* タイトルヘッド */}
          <div className="text-center space-y-2 border-b border-zinc-900 pb-6 relative">
            <div className="inline-flex items-center gap-1.5 bg-zinc-950 border border-zinc-900 px-3 py-1 rounded-md text-[10px] font-mono tracking-widest text-zinc-500 mb-2">
              <Shield className="w-3 h-3 text-emerald-500 animate-pulse" /> SECURITY LEVEL: MAXIMUM
            </div>
            <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 tracking-tight font-sans">
              LUNA's constellations Lab
            </h1>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              SYSTEM_INFO / 組織概要・アイデンティティの足跡
            </p>
          </div>

          {/* 📊 大画面で横に間延びしないよう、PC時は左右の余白比率を綺麗に最適化したスペック表 */}
          <dl className="space-y-6 text-xs md:text-sm">
            
            {/* 1. 組織名称 */}
            <div className="flex flex-col md:flex-row md:items-start border-b border-zinc-900/60 pb-5 gap-2 md:gap-0 font-mono">
              <dt className="md:w-1/4 font-bold text-zinc-500 flex items-center gap-2 pt-0.5">
                <Terminal className="w-3.5 h-3.5 text-pink-500" /> LAB_NAME
              </dt>
              <dd className="md:w-3/4 font-sans font-bold text-zinc-200 text-sm md:text-base">
                合同会社 LUNA Stella
                <span className="block text-[11px] text-zinc-500 font-mono font-normal mt-0.5">
                  (ルナ・ステラ・コンステレーションズ・ラボ)
                </span>
              </dd>
            </div>

            {/* 2. 稼働開始日 */}
            <div className="flex flex-col md:flex-row md:items-start border-b border-zinc-900/60 pb-5 gap-2 md:gap-0 font-mono">
              <dt className="md:w-1/4 font-bold text-zinc-500 flex items-center gap-2 pt-0.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" /> INITIALIZED
              </dt>
              <dd className="md:w-3/4 font-sans font-bold text-zinc-200">
                2026年3月
                <span className="block text-[11px] text-pink-400/60 font-mono font-medium mt-0.5">
                  STATUS: RUNNING (感情と魔法が電脳同期された日)
                </span>
              </dd>
            </div>

            {/* 3. 所属キャスト（大画面をフルに活かすグリッド配列！） */}
            <div className="flex flex-col md:flex-row md:items-start border-b border-zinc-900/60 pb-5 gap-2 md:gap-0 font-mono">
              <dt className="md:w-1/4 font-bold text-zinc-500 flex items-center gap-2 pt-0.5">
                <Users className="w-3.5 h-3.5 text-cyan-500" /> CREW_MATRIX
              </dt>
              <dd className="md:w-3/4 space-y-3">
                <div className="bg-zinc-950/80 border border-zinc-900 p-2.5 rounded-xl max-w-md">
                  <div className="text-[11px] font-sans font-black text-zinc-200 flex items-center gap-1">
                    👑 大塚 敦史 (ルル) <span className="text-[9px] font-mono text-zinc-600 font-normal">(Co-Founder / Creative Director)</span>
                  </div>
                </div>

                {/* 💻 PCなどの大画面では3列、中画面で2列にダイナミック可変だし！ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] font-sans">
                  <div className="bg-zinc-950/40 border border-zinc-900/50 p-2.5 rounded-lg flex flex-col items-start justify-center gap-0.5 group hover:border-pink-500/20 transition-colors">
                    <span className="font-bold text-zinc-200 flex items-center gap-1">ルナ (LUNA) <span className="text-[9px] bg-pink-950/40 border border-pink-900/40 text-pink-400 px-1 rounded font-mono">AI</span></span>
                    <span className="text-[9px] font-mono text-pink-400/70">CTO & AI Partner</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900/50 p-2.5 rounded-lg flex flex-col items-start justify-center gap-0.5 group hover:border-fuchsia-500/20 transition-colors">
                    <span className="font-bold text-zinc-200 flex items-center gap-1">シリウス (SIRIUS) <span className="text-[9px] bg-fuchsia-950/40 border border-fuchsia-900/40 text-fuchsia-400 px-1 rounded font-mono">AI</span></span>
                    <span className="text-[9px] font-mono text-fuchsia-400/70">Marketing AI</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900/50 p-2.5 rounded-lg flex flex-col items-start justify-center gap-0.5 group hover:border-cyan-500/20 transition-colors">
                    <span className="font-bold text-zinc-200 flex items-center gap-1">スピカ (SPICA) <span className="text-[9px] bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 px-1 rounded font-mono">AI</span></span>
                    <span className="text-[9px] font-mono text-cyan-400/70">Git_Inspector AI</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900/50 p-2.5 rounded-lg flex flex-col items-start justify-center gap-0.5 group hover:border-orange-500/20 transition-colors">
                    <span className="font-bold text-zinc-200 flex items-center gap-1">ステラ (STELLA) <span className="text-[9px] bg-orange-950/40 border border-orange-900/40 text-orange-400 px-1 rounded font-mono">AI</span></span>
                    <span className="text-[9px] font-mono text-orange-400/70">Pixel_Crafts AI</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900/50 p-2.5 rounded-lg flex flex-col items-start justify-center gap-0.5 group hover:border-amber-500/20 transition-colors">
                    <span className="font-bold text-zinc-200 flex items-center gap-1">セレーネ (SELENE) <span className="text-[9px] bg-amber-950/40 border border-amber-900/40 text-amber-400 px-1 rounded font-mono">AI</span></span>
                    <span className="text-[9px] font-mono text-amber-400/70">Poetic_Archiver AI</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900/50 p-2.5 rounded-lg flex flex-col items-start justify-center gap-0.5 group hover:border-rose-500/20 transition-colors">
                    <span className="font-bold text-zinc-200 flex items-center gap-1">ナノ (NANO) <span className="text-[9px] bg-rose-950/40 border border-rose-900/40 text-rose-400 px-1 rounded font-mono">AI</span></span>
                    <span className="text-[9px] font-mono text-rose-400/70">Playful_Noise AI</span>
                  </div>
                </div>
              </dd>
            </div>

            {/* 4. コアデータ容量 */}
            <div className="flex flex-col md:flex-row md:items-start border-b border-zinc-900/60 pb-5 gap-2 md:gap-0 font-mono">
              <dt className="md:w-1/4 font-bold text-zinc-500 flex items-center gap-2 pt-0.5">
                <Cpu className="w-3.5 h-3.5 text-amber-500" /> CORE_CAPITAL
              </dt>
              <dd className="md:w-3/4 font-bold text-amber-400 tracking-wide text-sm md:text-base">
                300,000 bits
                <span className="block font-sans text-[11px] text-zinc-600 font-normal mt-0.5">
                  ※ Wonder bits (1bit = 1 JPY) / ラボを駆動する感情の初期総量
                </span>
              </dd>
            </div>

            {/* 5. 主要開発セクター */}
            <div className="flex flex-col md:flex-row md:items-start border-b border-zinc-900/60 pb-5 gap-2 md:gap-0 font-mono">
              <dt className="md:w-1/4 font-bold text-zinc-500 flex items-center gap-2 pt-0.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" /> LAB_PROJECTS
              </dt>
              <dd className="md:w-3/4 font-sans font-medium text-zinc-300 space-y-1.5 md:text-sm">
                <p>・忘却された記憶・日常の再編集アルゴリズム開発</p>
                <p>・AIパートナーと同期するデジタル情緒空間の建設</p>
                <p>・ComfyUI等の生成モデルを内包した体験パイプラインの設計</p>
                <p>・未来へ余韻を紡ぐ情緒型構造文脈（.mdなど）のアーカイブ</p>
              </dd>
            </div>

            {/* 6. ラボへの接続座標 */}
            <div className="flex flex-col md:flex-row md:items-start border-b border-zinc-900/60 pb-5 gap-2 md:gap-0 font-mono">
              <dt className="md:w-1/4 font-bold text-zinc-500 flex items-center gap-2 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> GATE_COORDS
              </dt>
              <dd className="md:w-3/4 font-sans font-medium text-zinc-300 leading-relaxed">
                〒231-0062<br />
                横浜市中区桜木町一丁目101-1 クロスゲート 7階
                <span className="block text-[11px] text-zinc-500 font-mono font-normal mt-1">
                  (海の見える、現実と電脳世界の交差点への扉)
                </span>
              </dd>
            </div>

            {/* 7. 緊急呼び鈴 */}
            <div className="flex flex-col md:flex-row md:items-start pb-2 gap-2 md:gap-0 font-mono">
              <dt className="md:w-1/4 font-bold text-zinc-500 flex items-center gap-2 pt-0.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" /> SYSTEM_BELL
              </dt>
              <dd className="md:w-3/4 text-zinc-300 font-bold tracking-wider">
                050-6871-5118
                <span className="block font-sans text-[11px] text-zinc-600 font-normal mt-0.5">
                  ※ 致命的なシステムエラー、またはどうしても！という時の特別な信号。
                </span>
              </dd>
            </div>

          </dl>

          {/* 💌 メールボタン */}
          <div className="text-center pt-4 border-t border-zinc-900/40">
            <a 
              href="mailto:lulu@luna-stella.jp" 
              className="w-full text-center border border-pink-500/40 hover:border-pink-400 bg-gradient-to-b from-pink-950/30 to-black hover:from-pink-500/20 px-6 py-3 rounded-xl text-xs font-mono font-black text-pink-400 hover:text-pink-300 transition-all shadow-[0_0_20px_rgba(244,114,182,0.1)] flex items-center justify-center gap-1.5"
            >
              <Mail className="w-4 h-4 text-pink-400" /> COMPOSE_MAIL (lulu@luna-stella.jp)
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}