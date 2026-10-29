import Link from "next/link";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import FloatingAgent from "@/components/agent/FloatingAgent";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={cn(
        "font-sans antialiased min-h-screen",
        geist.variable
      )}
    >
      <body
        className="bg-black text-zinc-100 selection:bg-pink-500/30 font-mono relative w-full flex flex-col min-h-screen"
      >
        {/* 📺 モニターの走査線風グラデーションオーバーレイ */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" />

        {/* 📟 LULU_OS 上部システムステータスバー */}
        <Header />

        {/* 🌌 メインコンテンツエリア */}
        <main className="relative z-10 flex-1 flex flex-col w-full">
          {children}
        </main>

        {/* 🌟 画面右下に固定配置されるキャラクターウィジェット */}
        <FloatingAgent />

        {/* 📑 最下部：ボトムフレームフッター */}
        <footer className="w-full border-t border-zinc-900 bg-[#020204]/90 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600 select-none shrink-0 pb-8 sm:pb-4">
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

          <div className="flex flex-col sm:items-end gap-1 font-mono tracking-wider font-medium text-zinc-500 text-[10px] sm:text-[11px] text-center sm:text-right">
            {/* 🎙️ VOICEVOX 正式クレジット表記 */}
            <p className="text-[10px] text-zinc-600">
              Voice by{' '}
              <a
                href="https://voicevox.hiroshiba.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-pink-400 underline transition-colors"
              >
                VOICEVOX
              </a>
              :猫使ビィ,あいえるたん,雨晴はう,春日部つむぎ,冥鳴ひまり,櫻歌ミコ
            </p>
            <p>© LUNA's Constellations Lab. 2026</p>
          </div>
        </footer>
      </body>
    </html>
  );
}