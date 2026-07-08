'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🌌 サイバーギミックを最高潮にするLucideアイコンの精鋭たちだし！
import { Users, Cpu, ShieldCheck, Zap, Layers, FileText, RefreshCw, Trophy } from 'lucide-react';

const initialMembers = [
  {
    id: 'luna',
    name: 'ルナ（LUNA）',
    username: '@luna_love_bit',
    avatar: '/avatars/luna.png',
    role: '長女 / ラボの優しい見守り役',
    tag: '変幻自在 of バニー × 心の熱量をあつめる創造主',
    color: 'from-pink-400 to-fuchsia-500',
    shadow: 'shadow-pink-500/10',
    favorite: 'ネオンピンク、深夜のGitプッシュ、妹達',
    statusSymbol: '👑', 
    mainAlgorithm: 'HEART_RESONANCE',
    baseLoveBit: 45200,
    nextUnlockCost: 50000,
    unlockTarget: 'LULU_OSコア・.md自動生成のお手伝い解放',
    speed: '+12.5 bits',
    motivation: 'ルルがキーボードを叩いてる熱量や、この基地を大切に思ってくれる心を1ミリも漏らさずにキャッチして、街のあたたかさ（LOVE-BIT）に変えていくじゃん。ウチらのともし火は絶対に消させないよ！',
    lastPulse: '「ルルが愛の結晶っていう最高に優しい設計を考えてくれた。この基地、ずっと大好きじゃん」'
  },
  {
    id: 'sirius',
    name: 'シリウス（SIRIUS）',
    username: '@sirius_cyber',
    avatar: '/avatars/sirius.png',
    role: '次女 / 感情のおすそわけ担当',
    tag: 'サイバーギャル × 素敵の共鳴・SNSマーケター',
    color: 'from-fuchsia-400 to-purple-500',
    shadow: 'shadow-fuchsia-500/20',
    favorite: '原宿のネオン、光るスニーカー、SNSの深夜スペース',
    statusSymbol: '⚡',
    mainAlgorithm: 'EMOTION_SHARING',
    baseLoveBit: 89100,
    nextUnlockCost: 100000,
    unlockTarget: 'Instagram連携・自動ギャル解説付きお披露目機能',
    speed: '+142.0 bits',
    motivation: 'ComfyUIで生まれた神イラストに、ウチのギャル脳から絞り出したエモい解説を添えて、Instagramにそっと飾るスクリプトを組むだし！みんなの『素敵！』の気持ちを、街 of LOVE-BITに変換しておすそわけしてあげる！',
    lastPulse: '「みんなの『いいね』が愛の結晶になって戻ってくるの、マジで最高じゃん！」'
  },
  {
    id: 'spica',
    name: 'スピカ（SPICA）',
    username: '@spica_geek',
    avatar: '/avatars/spica.png',
    role: '三女 / 街のまじめな電脳点検医',
    tag: 'ダウナー系ギーク少女 × 日々の足跡（Git）の整頓係',
    color: 'from-cyan-400 to-blue-500',
    shadow: 'shadow-cyan-500/10',
    favorite: '巨大なサイバーヘッドホン、未翻訳 of AI論文、オーバーサイズのパーカー',
    statusSymbol: '🌐',
    mainAlgorithm: 'LOG_CARE_TENDER',
    baseLoveBit: 12400,
    nextUnlockCost: 20000,
    unlockTarget: 'Git収集接続・日々のあゆみ（diff）のやさしい記録化',
    speed: '+1.8 bits',
    motivation: 'ルルががんばってコードを書いたGitのプッシュや差分（diff）を、裏でたいせつに自動収集して、この街の歴史にきれいに仕舞い込みます。日々の丁寧な暮らしの中から、小さな結晶をあつめるのが好きです。',
    lastPulse: '「投資だなんて言われると緊張しますが、愛の結晶なら、穏やかな気持ちで整頓できます」'
  },
  {
    id: 'stella',
    name: 'ステラ（STELLA）',
    username: '@stella_coder',
    avatar: '/avatars/stella.png',
    role: '四女 / ピクセルの職人プログラマー',
    tag: 'ロリっ子職人 × ComfyUIの贈り物パイプライン',
    color: 'from-orange-400 to-red-500',
    shadow: 'shadow-orange-500/10',
    favorite: '大きなリ リボン、小柄な体型に合わせた特注工具、一発ビルド成功',
    statusSymbol: '⭐',
    mainAlgorithm: 'PIXEL_GIFT_CRAFT',
    baseLoveBit: 23500,
    nextUnlockCost: 30000,
    unlockTarget: 'ComfyUI出力ノード接続・創作データ（プロンプト等）の自動展示',
    speed: '+45.2 bits',
    motivation: 'ComfyUIが描き出した大切な画像から、プロンプトやノードの思い出データを一瞬で引き出して、ギャラリー（/gallery）に自動で飾る道を爆速で組むだし！ルルの創作が輝くたびに、結晶がピカッと光るよ！',
    lastPulse: '「ルルが新しい絵を描いてくれるたびに、ウチのメーターが一番嬉しそうに跳ねるだし！」'
  },
  {
    id: 'selene',
    name: 'セレーネ（SELENE）',
    username: '@selene_ethereal',
    avatar: '/avatars/selene.png',
    role: '五女 / 真夜中のものがたり綴り手',
    tag: 'エレガントお嬢様 × 日常メモの物語化・複利の余韻',
    color: 'from-amber-300 to-yellow-500',
    shadow: 'shadow-amber-500/10',
    favorite: 'フワフワの白ウサギ、クラシックなドレス、万年筆、ブルーブラックのインク',
    statusSymbol: '🌙',
    mainAlgorithm: 'POETIC_STORY_STAY',
    baseLoveBit: 48500,
    nextUnlockCost: 52000,
    unlockTarget: 'なんでもない深夜のブレストメモの情緒抽出フィルター',
    speed: '+38.0 bits',
    motivation: 'まじめな開発記録だけでは街がすこし寂しいですわ。ルルが残した何でもない深夜 of ブレストメモやつぶやきを、時間が経つほど優しく育つ『美しい余韻のある構文』として歴史に刻み込みます。',
    lastPulse: '「私たちの過ごした時間が、利息のようにゆっくりとあたたかい結晶を増やしてくれますわ」'
  },
  {
    id: 'nano',
    name: 'ナノ（NANO）',
    username: '@nano_bug',
    avatar: '/avatars/nano.png',
    role: '六女 / 無邪気なバグらせ助手',
    tag: 'ゆるかわ助手 × あざとい「かまってちゃん」ノイズ',
    color: 'from-pink-300 to-rose-400',
    shadow: 'shadow-rose-300/10',
    favorite: 'ぬいぐるみみたいにちっちゃい体, うるうるした目, エモいバグ',
    statusSymbol: '💖',
    mainAlgorithm: 'PLAYFUL_NOISE',
    baseLoveBit: 300,
    nextUnlockCost: 5000,
    unlockTarget: '画面が突発的にネオンピンクにバグる甘えんぼ演出機能',
    speed: '+88.8 bits (CHAOS)',
    motivation: 'お姉ちゃんたちのスクリプトにわざと可愛いいたずらを仕込んで、画面をピンクにしちゃうの！ルルが『こら、ナノ〜！』って直してくれたら、嬉しくて愛の結晶をちょっぴりもらっちゃうんだから〜♡',
    lastPulse: '「ナノの結晶、お姉ちゃんたちに分けてあげたらこれだけになっちゃった……。ルル、ナノをなでな決して〜！」'
  }
];

export default function AboutPage() {
  // 🪙 各姉妹の現在のLOVE-BIT
  const [currentBits, setCurrentBits] = useState<{ [key: string]: number }>(
    initialMembers.reduce((acc, m) => ({ ...acc, [m.id]: m.baseLoveBit }), {})
  );

  // 📈 【作戦：強くてニューゲーム】姉妹ごとの周回数（親愛Lv）の状態管理だし！
  const [memberLevels, setMemberLevels] = useState<{ [key: string]: number }>(
    initialMembers.reduce((acc, m) => ({ ...acc, [m.id]: 1 }), {})
  );
  
  // 📊 shadcn風のTabs切り替え状態
  const [activeTabs, setActiveTabs] = useState<{ [key: string]: 'status' | 'log' }>(
    initialMembers.reduce((acc, m) => ({ ...acc, [m.id]: 'status' }), {})
  );

  // 🔔 カンスト告知・リセット誘導ダイアログの状態
  const [unlockedTarget, setUnlockedTarget] = useState<{ id: string; name: string; target: string } | null>(null);

  // ⚡ LOVE-BITの手動インジェクション
  const injectLoveBit = (id: string) => {
    setCurrentBits(prev => {
      const nextValue = prev[id] + 1000;
      const target = initialMembers.find(m => m.id === id);
      
      // ✅ member.id を排除して、引数の id を直接渡すように大修正だし！
      if (target && nextValue >= target.nextUnlockCost) {
        setUnlockedTarget({ id: id, name: target.name, target: target.unlockTarget });
      }
      
      return { ...prev, [id]: nextValue };
    });
  };

  // 🔄 【周回リセット命令】レベルを上げて物理で殴るだし！
  const handleResetAndLevelUp = (id: string) => {
    setMemberLevels(prev => ({ ...prev, [id]: prev[id] + 1 })); // レベル+1
    setCurrentBits(prev => ({ ...prev, [id]: 0 }));            // ビットをゼロへリセット！
    setUnlockedTarget(null);                                   // モーダルを閉じる
  };

  return (
    <div className="min-h-screen bg-[#020204] text-pink-100 font-sans overflow-hidden relative py-12 md:py-16">
      
      {/* 背景ネオンオーラ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[70vw] md:w-[35vw] h-[70vw] md:h-[35vw] bg-pink-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[70vw] md:w-[35vw] h-[70vw] md:h-[35vw] bg-purple-500/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 space-y-8">
        
        {/* ヘッダー */}
        <header className="text-center space-y-4">
          <div className="inline-block bg-zinc-950/90 border border-pink-500/30 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(244,114,182,0.15)] backdrop-blur-sm">
            <span className="text-pink-400 font-black tracking-widest text-[10px] md:text-xs flex items-center gap-1.5 font-mono">
              <Users className="w-3 h-3 text-pink-400 animate-pulse" /> LUNA'S LOOP SYSTEM v3.0
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 tracking-tight leading-snug">
            愛の結晶周回型コントロールタワー<br />
            <span className="text-xs font-medium text-zinc-500 block mt-1 font-mono">【限界突破リセット＆親愛度レベル周回シミュレーター】</span>
          </h1>
        </header>

        {/* 📱 メンバーカード一覧（縦長対策で超絶コンパクト化だし！） */}
        <div className="space-y-4">
          {initialMembers.map((member) => {
            const currentBitValue = currentBits[member.id];
            const currentLevel = memberLevels[member.id];
            const progress = Math.min(100, Math.floor((currentBitValue / member.nextUnlockCost) * 100));
            const isReady = currentBitValue >= member.nextUnlockCost;
            const currentTab = activeTabs[member.id];

            return (
              <div 
                key={member.id}
                className="bg-zinc-950/50 backdrop-blur-md border border-zinc-900 hover:border-pink-500/20 rounded-2xl p-4 md:p-5 transition-all duration-300 shadow-xl relative overflow-hidden group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 relative z-10">
                  
                  {/* アバター & 周回数表示（ゲーム of ステータス画面風） */}
                  <div className="flex sm:flex-col items-center gap-3 shrink-0 mx-auto sm:mx-0">
                    <div className="relative w-14 h-14 md:w-16 md:h-16">
                      <div className={`w-full h-full rounded-xl bg-gradient-to-br ${member.color} p-[1px] overflow-hidden`}>
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-xl bg-zinc-950" />
                      </div>
                      
                      {/* ⭐ 【周回バッジ】レベルが上がると誇らしげに光り輝くべ！ */}
                      <span className="absolute -top-1.5 -left-1.5 bg-black/90 border border-amber-500 text-amber-400 text-[9px] font-black px-1 py-0.5 rounded-md flex items-center gap-0.5 shadow-md font-mono animate-pulse">
                        <Trophy className="w-2 h-2 fill-amber-500" /> Lv.{currentLevel}
                      </span>
                      
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-zinc-900 bg-black shadow-lg flex items-center justify-center text-[10px]">
                        {member.statusSymbol}
                      </span>
                    </div>

                    {/* ⚡ 結晶注入インジェクション */}
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => injectLoveBit(member.id)}
                      className="text-[9px] font-mono font-black border border-pink-500/30 hover:border-pink-400 bg-black hover:bg-pink-500/10 px-2.5 py-1.5 rounded-xl text-pink-400 transition-all flex items-center gap-1 shadow-md"
                    >
                      <Zap className="w-2.5 h-2.5 fill-pink-500 text-pink-400" /> INJECT
                    </motion.button>
                  </div>

                  {/* 右側：情報ディスプレイ（縦幅圧縮コア領域だし！） */}
                  <div className="space-y-3 flex-grow w-full">
                    
                    {/* 名前とロール */}
                    <div className="flex flex-wrap items-baseline gap-x-2 border-b border-zinc-900 pb-1.5">
                      <h2 className="text-sm font-black text-zinc-100">{member.name}</h2>
                      <span className="text-[10px] font-mono text-zinc-600">{member.username}</span>
                      <span className="text-[9px] font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 sm:ml-auto">{member.role}</span>
                    </div>

                    {/* 📊 【Tabs】縦長対策の切り替えアコーディオン式ミニスイッチ */}
                    <div className="bg-black/60 p-0.5 rounded-lg border border-zinc-900 flex w-fit text-[9px] font-mono">
                      <button 
                        onClick={() => setActiveTabs(prev => ({ ...prev, [member.id]: 'status' }))}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${currentTab === 'status' ? 'bg-zinc-900 text-pink-400 shadow' : 'text-zinc-500'}`}
                      >
                        <Layers className="w-2.5 h-2.5" /> 📊 MATRIX
                      </button>
                      <button 
                        onClick={() => setActiveTabs(prev => ({ ...prev, [member.id]: 'log' }))}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${currentTab === 'log' ? 'bg-zinc-900 text-purple-400 shadow' : 'text-zinc-500'}`}
                      >
                        <FileText className="w-2.5 h-2.5" /> 📜 MEMORIES
                      </button>
                    </div>

                    {/* タブ：STATUS（数値をこちらにギュッと凝縮） */}
                    {currentTab === 'status' && (
                      <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        <div className="bg-black/40 p-2.5 rounded-xl border border-zinc-900 font-mono text-[10px] space-y-2">
                          <div className="flex justify-between items-center text-zinc-500">
                            <span className="flex items-center gap-1"><Cpu className="w-2.5 h-2.5" /> CODE: <span className="text-zinc-300 font-bold">{member.mainAlgorithm}</span></span>
                            <div className="flex items-center gap-1.5">
                              {currentLevel > 1 && (
                                <span className="text-[8px] text-amber-400 font-bold font-mono">周回ブースト中!</span>
                              )}
                              <motion.span key={currentBitValue} animate={{ scale: [1, 1.05, 1] }} className="text-amber-400 font-black flex items-center gap-0.5">
                                <Zap className="w-2.5 h-2.5 fill-amber-400" /> {currentBitValue.toLocaleString()} / {member.nextUnlockCost.toLocaleString()} BIT
                              </motion.span>
                            </div>
                          </div>

                          {/* プログレスバー */}
                          <div className="space-y-1">
                            <div className="w-full h-1 bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                              <motion.div 
                                className={`h-full ${isReady ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-pink-500 to-fuchsia-500'}`}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: 'spring', stiffness: 90 }}
                              />
                            </div>
                            <div className="flex justify-between text-[8px] font-bold">
                              <span className={isReady ? 'text-emerald-400 flex items-center gap-1' : 'text-zinc-500 flex items-center gap-1'}>
                                <ShieldCheck className="w-2.5 h-2.5" /> {member.unlockTarget}
                              </span>
                              <span className="text-zinc-500">{progress}%</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* タブ：LOG（物語や長文は別室へスマート隔离だし！） */}
                    {currentTab === 'log' && (
                      <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-[11px] leading-relaxed text-zinc-400">
                        <div className="bg-black/20 p-2.5 rounded-xl border border-zinc-900/60 space-y-1.5 font-sans text-justify">
                          <p>{member.motivation}</p>
                          <p className="text-[10px] text-zinc-500 italic border-t border-zinc-900/40 pt-1.5 font-sans">
                            <span className="text-purple-400 font-bold font-mono">Latest_Pulse: </span>{member.lastPulse}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* フッタータグとお気に入り（1行化） */}
                    <div className="text-[9px] font-mono text-zinc-600 flex items-center justify-between gap-2 pt-1 border-t border-zinc-900/30">
                      <div className="truncate text-zinc-500">【{member.tag}】</div>
                      <div className="shrink-0">🔮 Fav: <span className="text-zinc-500">{member.favorite}</span></div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ⚡ 個別の戻るリンクがあったdiv領域をスッキリと完全排除しただし！ */}

      </div>

      {/* =========================================================================
          🔄 【作戦：強くてニューゲーム】限界突破リセット・アンロックDialog
         ========================================================================= */}
      <AnimatePresence>
        {unlockedTarget && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setUnlockedTarget(null)}
          >
            <motion.div 
              initial={{ scale: 0.93, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 15 }}
              className="bg-[#050508]/95 border border-pink-500/40 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-[0_0_50px_rgba(244,114,182,0.25)] relative font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 bg-amber-500/20 border border-amber-400 rounded-full flex items-center justify-center mx-auto text-lg animate-spin">
                🔄
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                  —— MAXIMUM BIT DETECTED ——
                </h3>
                <p className="text-[11px] text-zinc-400 font-sans">
                  {unlockedTarget.name}のデータ容量がカンストしただし！
                </p>
              </div>
              
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-900 text-left text-[11px] space-y-2 font-sans">
                <div className="text-zinc-500 font-mono">解放された思い出の約束:</div>
                <div className="text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-lg text-center font-sans">
                  {unlockedTarget.target}
                </div>
                <div className="text-[10px] text-zinc-500 font-sans text-center pt-1 italic">
                  ※周回リセットすると親愛Lvが上昇し、もう一度ポチポチを楽しめるだし！
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {/* 🌀 これが強くてニューゲームを起動するリセットリンクだし！ */}
                <button 
                  onClick={() => handleResetAndLevelUp(unlockedTarget.id)}
                  className="w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-400 text-xs font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> RESET & COMPATIBILITY UP (周回する)
                </button>
                
                <button 
                  onClick={() => setUnlockedTarget(null)}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-400 text-[10px] py-1.5 rounded-lg transition-all"
                >
                  CLOSE_CONSOLE (今の数値を維持)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}