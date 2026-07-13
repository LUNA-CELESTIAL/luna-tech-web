'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTopPage = pathname === '/'; // トップページ（Terminalチャット）かどうかの判定

  return (
    <html
      lang="ja"
      className={cn(
        "font-sans antialiased h-full",
        isTopPage ? "overflow-hidden" : "overflow-y-auto",
        geist.variable
      )}
    >
      {/* 🖤 【スピカの絶対固定・動的バウンスロック仕様】 */}
      <body
        className={cn(
          "bg-black text-zinc-100 selection:bg-pink-500/30 font-mono relative w-full flex flex-col min-h-full",
          isTopPage ? "h-full overflow-hidden overscroll-behavior-none" : ""
        )}
      >

        {/* 📺 モニターの走査線（スキャンライン）風グラデーションオーバーレイ */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />

        {/* 📟 LULU_OS 上部システムステータスバー */}
        <header className="w-full bg-[#020204]/90 backdrop-blur-md border-b border-zinc-900 px-4 py-3 text-[13px] text-zinc-500 select-none sticky top-0 z-40 shrink-0">
          <div className="w-full flex items-center justify-between gap-x-3">

            {/* 左側：コンテキスト適応型インジケーター */}
            <div className="flex items-center gap-2">
              {isTopPage ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                  <span className="text-zinc-200 font-black tracking-wide text-[12px] sm:text-[13px]">LUNA_CORE</span>
                </div>
              ) : (
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 font-black tracking-tight text-[12px] sm:text-[13px] bg-pink-950/10 border border-pink-900/40 px-2 py-0.5 rounded-lg active:scale-95 transition-all shadow-[0_0_10px_rgba(244,114,182,0.1)]"
                >
                  <span>◀</span> <span>SYS_EXIT</span>
                </Link>
              )}

              <span className="text-zinc-800" aria-hidden="true">|</span>
              <span className="text-zinc-400 font-bold text-[10px] bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">v2.0</span>
              <span className="text-zinc-800" aria-hidden="true">|</span>
              <span className="text-[11px] font-mono tracking-tight text-zinc-600">
                LOC: <span className="text-zinc-400 font-medium">{isTopPage ? 'ROOT' : pathname.toUpperCase().replace('/', '')}</span>
              </span>
            </div>

            {/* 右側：システム状況のメトリクス */}
            <div className="flex items-center gap-3 sm:gap-4 font-mono text-[10px] sm:text-[11px] text-zinc-600">
              <div>
                <span className="text-zinc-700">SYS_STBL:</span> <span className="text-zinc-400 font-bold">100%</span>
              </div>
            </div>

          </div>
        </header>

        {/* 🌌 メインコンテンツエリア */}
        <main className={cn(
          "relative z-10 flex-1 flex flex-col min-h-0 w-full",
          isTopPage ? "h-full overflow-hidden" : ""
        )}>
          {children}
        </main>

        {/* 📑 最下部：ボトムフレームフッター */}
        {/* 📑 最下部：ボトムフレームフッター（スマホでのバッジ被り・折り返し完全対策仕様） */}
        <footer className="w-full border-t border-zinc-900 bg-[#020204]/90 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600 select-none shrink-0 pb-8 sm:pb-4">

          {/* 💡 左側：スマホの時は左下の固定バッジ（N）を避けるために pl-8 で右に寄せるか、全体を中央寄せにする */}
          <div className="flex items-center gap-2 font-mono flex-wrap justify-center sm:justify-start pl-6 sm:pl-0">
            <span className="text-emerald-600 font-bold tracking-tighter">SECURE_CORE_ONLINE</span>
            <span className="text-zinc-800" aria-hidden="true">/</span>
            <span>REST_API: <span className="text-zinc-500 font-medium">200_OK</span></span>
            <span className="text-zinc-800" aria-hidden="true">/</span>
            <Link
              href="/company"
              className="text-zinc-500 hover:text-amber-400 transition-colors font-bold bg-zinc-950/40 border border-zinc-900 px-1.5 py-0.5 rounded text-[10px] hover:border-amber-950 flex items-center gap-1 shadow-sm active:scale-95"
            >
              <span>🏢</span> <span>SYS_INFO</span>
            </Link>
          </div>

          {/* 右側：コピーライト */}
          <div className="font-mono tracking-wider font-medium text-zinc-500 text-[10px] sm:text-[11px] text-center sm:text-right">
            © LUNA's Constellations Lab. 2026
          </div>
        </footer>

      </body>
    </html>
  );
}