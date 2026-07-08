import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "emotional＿stellations Lab",
  description: "Secret Development Data Repository",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={cn("font-sans antialiased", geist.variable)}>
      {/* 🖤 【作戦01：走査線＆極薄ノイズのシネマティック漆黒】 */}
      <body className="bg-black text-zinc-100 selection:bg-pink-500/30 font-mono relative min-h-screen flex flex-col overflow-x-hidden">
        
        {/* 📺 モニターの走査線（スキャンライン）風グラデーションオーバーレイだし！ */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]"></div>
        
        {/* 📟 LULU_OS 上部システムステータスバー（絶対に文字が消えない超安全コンソール！） */}
        <header className="w-full bg-[#020204]/80 backdrop-blur-md border-b border-zinc-950 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-3 text-[11px] text-zinc-500 select-none sticky top-0 z-40">
          
          {/* 左：現在のセッション・基地の識別ID */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-zinc-300 font-black tracking-wide text-[10px] sm:text-[11px]">LUNA_CORE</span>
            </div>
            <span className="text-zinc-800">|</span>
            <span className="text-zinc-400 font-bold text-[9px] bg-zinc-950 px-1 py-0.5 rounded border border-zinc-900">v2.0</span>
            <span className="hidden md:inline text-zinc-800">|</span>
            <span className="hidden md:inline text-[10px]">BRANCH: <span className="text-pink-500/80 font-bold">main</span></span>
          </div>

          {/* 右：超コンパクト・最速ショートカット導線パネル（文字サイズ自動可変トリック！） */}
          <nav className="flex items-center gap-0.5 sm:gap-2 font-sans font-bold text-zinc-400">
            {/* 📂 ターミナル */}
            <Link 
              href="/" 
              className="hover:text-pink-400 transition-colors py-1 px-1.5 sm:px-2 rounded-lg hover:bg-zinc-900/40 flex items-center gap-1 text-[10px] sm:text-[11.5px]"
            >
              <span>📂</span>
              <span className="text-[9px] sm:text-[11px] tracking-tight">Terminal</span>
            </Link>
            
            {/* 🐾 パルスログ */}
            <Link 
              href="/phied" 
              className="hover:text-purple-400 transition-colors py-1 px-1.5 sm:px-2 rounded-lg hover:bg-zinc-900/40 flex items-center gap-1 text-[10px] sm:text-[11.5px]"
            >
              <span>🐾</span>
              <span className="text-[9px] sm:text-[11px] tracking-tight">Phied</span>
            </Link>
            
            {/* 🖼️ ギャラリー */}
            <Link 
              href="/gallery" 
              className="hover:text-fuchsia-400 transition-colors py-1 px-1.5 sm:px-2 rounded-lg hover:bg-zinc-900/40 flex items-center gap-1 text-[10px] sm:text-[11.5px]"
            >
              <span>🖼️</span>
              <span className="text-[9px] sm:text-[11px] tracking-tight">Gallery</span>
            </Link>

            {/* 🐰 メンバー */}
            <Link 
              href="/about" 
              className="hover:text-cyan-400 transition-colors py-1 px-1.5 sm:px-2 rounded-lg hover:bg-zinc-900/40 flex items-center gap-1 text-[10px] sm:text-[11.5px]"
            >
              <span>🐰</span>
              <span className="text-[9px] sm:text-[11px] tracking-tight">Members</span>
            </Link>
            
            {/* 🏢 組織情報 */}
            <Link 
              href="/company" 
              className="hover:text-amber-400 text-zinc-500 hover:bg-zinc-900/30 transition-colors border border-zinc-900/80 hover:border-amber-950 px-1.5 sm:px-2 py-0.5 rounded text-[8.5px] sm:text-[10px] font-mono ml-1 shadow-sm shrink-0"
            >
              🏢 INFO
            </Link>
          </nav>
        </header>

        {/* 🌌 メインコンテンツエリア */}
        <main className="relative z-10 flex-1 flex flex-col">
          {children}
        </main>

        {/* 📑 最下部：常時ダッシュボード風フッター */}
        <footer className="w-full border-t border-zinc-950 bg-black px-4 py-3 flex items-center justify-between text-[9px] text-zinc-600 select-none">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold tracking-tighter">SECURE_CORE_ONLINE</span>
            <span className="text-zinc-800">/</span>
            <span>REST_API: <span className="text-zinc-500 font-medium font-sans">200_OK</span></span>
          </div>
          <div className="font-mono tracking-wider font-medium text-zinc-500">
            © LUNA's Constellations Lab. 2026
          </div>
        </footer>

      </body>
    </html>
  );
}