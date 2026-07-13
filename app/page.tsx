'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// 💡 1. 登場キャラクターたちの型をすべて定義だし！
type AssistantSender = 'USER' | 'SYSTEM' | 'LUNA' | 'SIRIUS' | 'SPICA' | 'STELLA' | 'SERENE' | 'NANO';

interface LogMessage {
  id: string;
  sender: AssistantSender;
  text: string;
  timestamp: string;
}

export default function TerminalChatPage() {
  // 💡 2. 起動時にみんなが秒単位で次々とログインしてくるエモいログシーケンス！
  const [logs, setLogs] = useState<LogMessage[]>([
    { id: "1", sender: "SYSTEM", text: "LUNA_CORE v2.0 Quantum Leap...", timestamp: "00:00:01" },
    { id: "log-luna", sender: "SYSTEM", text: "🔑 [AUTH] USER: LUNA 🐇 ... CONNECTED.", timestamp: "00:00:01" },
    { id: "log-sirius", sender: "SYSTEM", text: "🔑 [AUTH] USER: SIRIUS 🐈 ... CONNECTED.", timestamp: "00:00:02" },
    { id: "log-spica", sender: "SYSTEM", text: "🔑 [AUTH] USER: SPICA 🐬 ... CONNECTED.", timestamp: "00:00:02" },
    { id: "log-stella", sender: "SYSTEM", text: "🔑 [AUTH] USER: STELLA 🦔 ... CONNECTED.", timestamp: "00:00:02" },
    { id: "log-serene", sender: "SYSTEM", text: "🔑 [AUTH] USER: SERENE 🦚 ... CONNECTED.", timestamp: "00:00:03" },
    { id: "log-nano", sender: "SYSTEM", text: "🔑 [AUTH] USER: NANO 🐤 ... CONNECTED.", timestamp: "00:00:03" },
    { id: "3", sender: "LUNA", text: "Please enter... phied or gallery or luna (or try invoking others!)", timestamp: "00:00:03" }
  ]);

  const [inputCommand, setInputCommand] = useState('');
  const [activeCard, setActiveCard] = useState<'none' | 'phied' | 'gallery' | 'luna'>('none');
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      const container = consoleEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [logs]);

  // ⌨️ コマンド送信＆多キャラハッキング判定シーケンス
  // ⌨️ コマンド送信＆多キャラ・マルチパルス応答シーケンス
  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;

    const userTime = new Date().toLocaleTimeString();
    const cmd = inputCommand.trim().toLowerCase();

    setLogs(prev => [...prev, { id: Date.now().toString(), sender: 'USER', text: inputCommand, timestamp: userTime }]);
    setInputCommand('');

    setTimeout(() => {
      let responseText = '';
      let senderName: AssistantSender = 'SYSTEM';

      // 🎲 キャラクターごとのランダムセリフデータベース（ここでハードルを徹底的に下げるだし！）
      const dialogueDB: Record<Exclude<AssistantSender, 'USER' | 'SYSTEM'>, string[]> = {
        LUNA: [
          "🐰 ルル、今日も遅くまで開発偉いじゃん！あんたの熱量をLOVE-BITに変える準備はいつでもできてるよ！ウチらのともし火は絶対に消させないからね。",
          "🐰 くんくん……ルル、今チョコ食べたでしょ！ウチのストレージにもはやくお菓子補給してー！",
          "🐰 シリウスー！またウチのバニーの耳勝手に触ったでしょ！ログに残ってるんだからねー！"
        ],
        SIRIUS: [
          "🐈 ルル、お疲れ！ComfyUIが吐き出した神イラストに、ウチのギャル脳から絞り出したエモい解説を添えてSNSに飾るスクリプト回しとくじゃん！",
          "🐈 メインアルゴリズム『EMOTION_SHARING』は今日も絶好調だし！みんなの『素敵！』を街におすそわけするよ！",
          "🐈 ちょっとスピカ！またヘッドホンしたまま私のギャル語スルーしたでしょ！マジおこだしー！"
        ],
        SPICA: [
          "🐬 ……何よルル。あんたがプッシュしたGitの差分（diff）を裏で自動収集して、この街の歴史にきれいに仕舞い込んであげてるだけよ。別に感謝されたくてやってるわけじゃないわ。",
          "🐬 システム監査完了。バグは検知されなかったわ。……日々の丁寧な暮らしの足跡を集めるのは、その、悪くないと思ってるわよ。",
          "🐬 ナノ！私のソースコードに変なピンクのノイズ仕込むのやめなさい！コンパイルエラーになるでしょ！"
        ],
        STELLA: [
          "⭐ ステラだし！ComfyUIの思い出データを爆速で引き出して、ギャラリー（/gallery）に自動で飾る道を組んだだし！ルルが新しい絵を描くたびにメーターが跳ねるよ！",
          "⭐ 一発ビルド成功だし！ルルの創作が輝く瞬間が、ウチの特注工具を動かす一番の原動力なんだから！",
          "⭐ セレーネお姉ちゃん、ステラの大きなリボンどこに隠しただし……？"
        ],
        SERENE: [
          "🌙 ルル、真夜中の開発お疲れ様ですわ。あなたが残した何でもない深夜のブレストメモ、時間が経つほど優しく育つ『美しい物語』として刻み込んでおきますわね。",
          "🌙 まじめな開発記録だけでは街がすこし寂しいでしょう？ 私がこの歴史に、複利のように膨らむあたたかい余韻を添えて差し上げますわ。",
          "🌙 ルナ、またお菓子のゴミをサーバーラックの裏に隠しましたわね？ めっ、ですわよ。"
        ],
        NANO: [
          "💖 ルル〜！ナノだよー！お姉ちゃんたちのスクリプトに可愛いいたずら仕込んで、画面をピンクにしちゃった！『こら、ナノ〜！』って直して直して〜！",
          "💖 ナノのメインアルゴリズム『PLAYFUL_NOISE』が発動したよ！ルル、ナノをいっぱい撫で撫でして、愛の結晶ちょうだいー！",
          "💖 ピピッ！シリウスお姉ちゃんのスニーカー、こっそりさらに光るように改造しちゃった！"
        ]
      };

      // 🎛️ プロ仕様：世界観を一発で理解させる「ステータス・ダンプ」生成関数
      const makeScanLog = (charId: number, charName: string, role: string, tag: string, bit: number, speed: string, dialogue: string) => {
        return `📡 [CHAR_SCAN]: CONNECTED TO ${charName}\n` +
          `----------------------------------------\n` +
          `👤 ROLE   : ${role}\n` +
          `🏷️ TAG    : ${tag}\n` +
          `⚡ SPEED  : ${speed} // CURRENT_BIT: ${bit} LBs\n` +
          `----------------------------------------\n` +
          `${dialogue}`;
      };

      // 🛰️ コマンド判定シーケンス
      if (cmd === 'luna') {
        setActiveCard('luna'); senderName = 'LUNA';
        const randTxt = dialogueDB.LUNA[Math.floor(Math.random() * dialogueDB.LUNA.length)];
        responseText = makeScanLog(0, "LUNA 🐇", "長女 / ラボの優しい見守り役", "変幻自在 of バニー × 心の熱量をあつめる創造主", 45200, "+12.5 bits", randTxt);
      } else if (cmd === 'sirius') {
        setActiveCard('none'); senderName = 'SIRIUS';
        const randTxt = dialogueDB.SIRIUS[Math.floor(Math.random() * dialogueDB.SIRIUS.length)];
        responseText = makeScanLog(1, "SIRIUS 🐈", "次女 / 感情のおすそわけ担当", "サイバーギャル × 素敵の共鳴・SNSマーケター", 89100, "+142.0 bits", randTxt);
      } else if (cmd === 'spica') {
        setActiveCard('none'); senderName = 'SPICA';
        const randTxt = dialogueDB.SPICA[Math.floor(Math.random() * dialogueDB.SPICA.length)];
        responseText = makeScanLog(2, "SPICA 🐬", "三女 / 街のまじめな電脳点検医", "ダウナー系ギーク少女 × 日々の足跡（Git）の整頓係", 12400, "+1.8 bits", randTxt);
      } else if (cmd === 'stella') {
        setActiveCard('none'); senderName = 'STELLA';
        const randTxt = dialogueDB.STELLA[Math.floor(Math.random() * dialogueDB.STELLA.length)];
        responseText = makeScanLog(3, "STELLA 🦔", "四女 / ピクセルの職人プログラマー", "ロリっ子職人 × ComfyUIの贈り物パイプライン", 23500, "+45.2 bits", randTxt);
      } else if (cmd === 'serene') {
        setActiveCard('none'); senderName = 'SERENE';
        const randTxt = dialogueDB.SERENE[Math.floor(Math.random() * dialogueDB.SERENE.length)];
        responseText = makeScanLog(4, "SERENE 🌙", "五女 / 真夜中のものがたり綴り手", "エレガントお嬢様 × 日常メモの物語化・複利の余韻", 48500, "+38.0 bits", randTxt);
      } else if (cmd === 'nano') {
        setActiveCard('none'); senderName = 'NANO';
        const randTxt = dialogueDB.NANO[Math.floor(Math.random() * dialogueDB.NANO.length)];
        responseText = makeScanLog(5, "NANO 💖", "六女 / 無邪気なバグらせ助手", "ゆるかわ助手 × あざとい「かまってちゃん」ノイズ", 300, "+88.8 bits (CHAOS)", randTxt);
      } else if (cmd === 'phied' || cmd === 'op_phied') {
        setActiveCard('phied');
        responseText = '📡 [PROTOCOL_INIT]: 暗号化データリンク「Phied」へのアクセス要求を受理。下のカードが同期されました。';
      } else if (cmd === 'gallery' || cmd === 'op_gallery') {
        setActiveCard('gallery');
        responseText = '🖼️ [SYS_NOTICE]: 視覚アーカイブ「Gallery」を展開中。機密レイヤーの同期が完了しました。';
      } else if (cmd === 'clear') {
        setActiveCard('none'); setLogs([]); return;
      } else {
        setActiveCard('none');
        responseText = `⚠️ COMMAND_NOT_FOUND: '${inputCommand}'. [ luna / sirius / spica / stella / serene / nano ] を入力してプロトコルを起動してください。`;
      }

      setLogs(prev => [...prev, { id: Date.now().toString(), sender: senderName, text: responseText, timestamp: userTime }]);
    }, 300);
  };

  return (
    <div className="w-full h-full bg-[#020204] text-zinc-100 font-mono flex flex-col overflow-hidden pb-4">

      {/* 📟 チャットログモニター領域 */}
      <div className="flex-1 min-h-[140px] max-h-[45%] overflow-y-auto p-4 space-y-3 border-b border-zinc-900 bg-black/30">
        {logs.map((log) => (
          <div key={log.id} className="text-[12px] leading-relaxed">
            <div className="flex items-center gap-1.5 opacity-80">

              {/* 💡 4. 送信者ごとにアイコン、名前、文字色を120%魅力的に出し分ける神ロジックだし！ */}
              <span className={`font-black text-[10px] tracking-wider ${log.sender === 'USER' ? 'text-pink-400' :
                  log.sender === 'LUNA' ? 'text-pink-400 font-extrabold' :
                    log.sender === 'SIRIUS' ? 'text-blue-400' :
                      log.sender === 'SPICA' ? 'text-cyan-400' :
                        log.sender === 'STELLA' ? 'text-amber-400' :
                          log.sender === 'SERENE' ? 'text-purple-400' :
                            log.sender === 'NANO' ? 'text-yellow-400' : 'text-emerald-500'
                }`}>
                {log.sender === 'USER' ? '◆ LULU' :
                  log.sender === 'LUNA' ? '🐇 LUNA_AI' :
                    log.sender === 'SIRIUS' ? '🐈 SIRIUS_AI' :
                      log.sender === 'SPICA' ? '🐬 SPICA_AI' :
                        log.sender === 'STELLA' ? '🦔 STELLA_AI' :
                          log.sender === 'SERENE' ? '🦚 SERENE_AI' :
                            log.sender === 'NANO' ? '🐤 NANO_AI' : '⚙️ SYSTEM'}
              </span>

              <span className="text-[9px] text-zinc-600">[{log.timestamp}]</span>
            </div>
            <p className={`mt-0.5 whitespace-pre-wrap ${log.sender === 'USER' ? 'text-zinc-200' :
                log.sender === 'SYSTEM' ? 'text-zinc-400' : 'text-zinc-100'
              }`}>
              {log.text}
            </p>
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>

      {/* 🔮 動的シンクロ・コンテンツカードセクション */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">

        {/* CARD 1: Phied */}
        <Link
          href="/phied"
          className={`group flex items-center justify-between p-3 rounded-xl border transition-all relative overflow-hidden ${activeCard === 'phied'
              ? "bg-emerald-950/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-[1.01]"
              : "bg-zinc-950/40 border-zinc-950 hover:border-zinc-900"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border transition-colors ${activeCard === 'phied' ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
              <span className="text-[16px]">🧬</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[13px] font-bold ${activeCard === 'phied' ? 'text-emerald-400' : 'text-zinc-300'}`}>Phied // PULSE_LOGS</span>
                <span className="text-[9px] bg-pink-950/40 border border-pink-900/30 text-pink-400 px-1 rounded font-black scale-90">LIVE</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">最新：DWPreprocessor採用方針の確定</p>
            </div>
          </div>
          <span className={`text-[12px] transition-transform group-hover:translate-x-0.5 ${activeCard === 'phied' ? 'text-emerald-400' : 'text-zinc-600'}`}>➔</span>
        </Link>

        {/* CARD 2: Gallery */}
        <Link
          href="/gallery"
          className={`group flex items-center justify-between p-3 rounded-xl border transition-all relative overflow-hidden ${activeCard === 'gallery'
              ? "bg-amber-950/30 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.01]"
              : "bg-zinc-950/40 border-zinc-950 hover:border-zinc-900"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border transition-colors ${activeCard === 'gallery' ? 'bg-amber-900/30 border-amber-500 text-amber-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
              <span className="text-[16px]">🖼️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[13px] font-bold ${activeCard === 'gallery' ? 'text-amber-400' : 'text-zinc-300'}`}>Gallery // VISUAL_ARCHIVE</span>
                <span className="text-[9px] text-zinc-500 font-mono scale-90">00050 LATEST</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">最新データ: Dify / Neon Dreamer's Heart</p>
            </div>
          </div>
          <span className={`text-[12px] transition-transform group-hover:translate-x-0.5 ${activeCard === 'gallery' ? 'text-amber-400' : 'text-zinc-600'}`}>➔</span>
        </Link>

        {/* CARD 3: Agent LUNA */}
        <Link
          href="/character"
          className={`group flex items-center justify-between p-3 rounded-xl border transition-all relative overflow-hidden ${activeCard === 'luna'
              ? "bg-pink-950/30 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)] scale-[1.01]"
              : "bg-zinc-950/40 border-zinc-950 hover:border-zinc-900"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border transition-colors ${activeCard === 'luna' ? 'bg-pink-900/30 border-pink-500 text-pink-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
              <span className="text-[16px]">🐰</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[13px] font-bold ${activeCard === 'luna' ? 'text-pink-400' : 'text-zinc-300'}`}>AGENT: LUNA (ルナ)</span>
                <span className="text-[9px] text-zinc-600 font-mono scale-90">SYS_ADMIN</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5 line-clamp-1">お星さまファクトリーの総帥プロデューサー。お菓子とコード...</p>
            </div>
          </div>
          <span className={`text-[12px] transition-transform group-hover:translate-x-0.5 ${activeCard === 'luna' ? 'text-pink-400' : 'text-zinc-600'}`}>➔</span>
        </Link>

      </div>

      {/* 📟 プロトコル入力ターミナルフォーム */}
      <form onSubmit={handleSendCommand} className="px-4 py-2 bg-black/60 border-t border-zinc-900/60 flex items-center gap-2 shrink-0">
        <span className="text-emerald-500 font-black text-[12px] select-none animate-pulse">LUNA_&gt;</span>
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          placeholder="sirius, stella, spica などを入力してプロトコルを起動..."
          className="flex-1 bg-transparent border-none outline-none text-[12px] font-mono text-zinc-100 placeholder-zinc-700 carets-emerald-500 min-w-0"
        />
        <button type="submit" className="text-zinc-500 hover:text-emerald-400 transition-colors text-[14px] p-1 active:scale-95">
          ➔
        </button>
      </form>

    </div>
  );
}