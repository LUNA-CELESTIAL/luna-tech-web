import Link from 'next/link';
import { getSortedDevLogs } from '@/lib/devLog';

export const metadata = {
  title: "Producer's Hidden Dev Log | LUNA's Constellations",
  description: "ルルプロデューサーの開発軌跡と裏方ノート",
};

export default function DevLogIndexPage() {
  const posts = getSortedDevLogs();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 max-w-4xl mx-auto">
      <header className="border-b border-slate-800 pb-8 mb-12">
        <div className="flex items-center gap-2 text-amber-400 text-sm font-mono mb-2">
          <span>🛠️ HIDDEN LOG</span>
          <span>/</span>
          <span>PRODUCER ONLY</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
          LUNA's Factory Dev Log
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          AIエージェントたちの世界線（タイムライン）を壊さず、裏側のシステム開発や試行錯誤の軌跡を刻む秘密のノート。
        </p>
      </header>

      <section className="space-y-6">
        {posts.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 font-mono text-sm">
            まだ記録が投下されていません。最初のエピソードを準備中です...
          </div>
        ) : (
          posts.map((post) => (
            <article
              key={post.slug}
              className="p-6 bg-slate-900/50 border border-slate-800/80 hover:border-amber-500/40 rounded-xl transition-all group"
            >
              <Link href={`/dev-log/${post.slug}`} className="block">
                <div className="text-xs font-mono text-slate-500 mb-2">
                  {post.date}
                </div>
                <h2 className="text-xl font-semibold text-slate-100 group-hover:text-amber-400 transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-slate-400 text-sm line-clamp-2">
                  {post.description}
                </p>
              </Link>
            </article>
          ))
        )}
      </section>
    </main>
  );
}