'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isTopPage = pathname === '/';

  return (
    <header className="w-full bg-[#020204]/90 backdrop-blur-md border-b border-zinc-900 px-4 py-3 text-[13px] text-zinc-500 select-none sticky top-0 z-40 shrink-0">
      <div className="w-full flex items-center justify-between gap-x-3">
        <div className="flex items-center gap-2">
          {isTopPage ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
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

        <div className="flex items-center gap-3 sm:gap-4 font-mono text-[10px] sm:text-[11px] text-zinc-600">
          <div>
            <span className="text-zinc-700">SYS_STBL:</span> <span className="text-zinc-400 font-bold">100%</span>
          </div>
        </div>
      </div>
    </header>
  );
}