'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TechReport {
  id: string;
  title: string;
  summary: string;
  date: string;
  image: string;
  agent: string;
  category: string;
}

interface TechLabClientProps {
  initialReports: TechReport[];
}

export default function TechLabClient({ initialReports }: TechLabClientProps) {
  const [terminalText, setTerminalText] = useState('');
  const [showContent, setShowContent] = useState(false);

  const fullWelcomeMessage = `[SYSTEM-LOG]: Welcome to LUNA constellations Lab.
[AGENT]: スピカの自動開通パイプラインを検出中...
[STATUS]: /src/posts の全スキャンに成功。ログを展開するじゃん！⚡💖
--------------------------------------------------`;

  // 📟 ターミナルのタイピング演出だし！
  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < fullWelcomeMessage.length) {
        setTerminalText((prev) => prev + fullWelcomeMessage[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setShowContent(true);
      }
    }, 10); // ちょっぴり高速化しておいたよ！

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans selection:bg-pink-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ハッカー風ストリーミング・コンソール */}
        <div className="bg-zinc-900/60 border border-purple-500/20 rounded-xl p-4 font-mono text-xs md:text-sm text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.05)]">
          <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 mb-2 text-zinc-500 text-[10px]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/40"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/40"></span>
            <span className="ml-2 tracking-wider">LULU_OS_TERMINAL.sh</span>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed">{terminalText}</pre>
          {!showContent && <span className="animate-pulse text-pink-400 font-bold ml-0.5">▋</span>}
        </div>

        {/* 📚 レポート集積所 */}
        <div className={`space-y-6 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h1 className="text-sm font-bold tracking-widest text-zinc-400 uppercase font-mono">📂 Repository Analysis Logs</h1>
            {/* 🌸 スピカの倉庫にあるファイルの数がリアルタイムにここへ反映されるだし！ */}
            <span className="text-[10px] text-pink-400 bg-pink-950/30 border border-pink-900/40 px-2 py-0.5 rounded-full font-mono">
              Total: {initialReports.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {initialReports.map((report) => (
              <div key={report.id} className="group relative bg-zinc-900/30 border border-zinc-850 hover:border-pink-500/30 rounded-xl p-5 transition-all duration-300 flex flex-col md:flex-row gap-5">
                <div className="w-full md:w-40 h-40 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden shrink-0 relative">
                  <img src={report.image} alt="挿絵" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                <div className="flex flex-col justify-between space-y-2 flex-1">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                      <span>{report.date}</span>
                      <span>•</span>
                      <span className="text-purple-400 font-bold">{report.category}</span>
                    </div>
                    <h2 className="text-base font-bold text-zinc-200 group-hover:text-pink-300 transition-colors">{report.title}</h2>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">{report.summary}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-850 text-[11px]">
                    <span className="text-zinc-500 font-mono">Analyzed by: <span className="text-fuchsia-400 font-bold">{report.agent}</span></span>
                    <Link href={`/posts/${report.id}`} className="text-pink-400 group-hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer">
                      Read Log <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 🫙 倉庫が空っぽの時の可愛いエラーハンドリング */}
            {initialReports.length === 0 && (
              <div className="text-center p-8 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs font-mono">
                ⚠️ [WARNING]: スピカの倉庫 (/src/posts) に .md ファイルが見つからないだし！
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}