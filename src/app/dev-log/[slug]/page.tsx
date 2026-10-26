import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDevLogData } from '@/lib/devLog';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getDevLogData(slug);
  if (!post) return { title: 'Not Found' };
  return { title: `${post.title} | Dev Log` };
}

export default async function DevLogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getDevLogData(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 max-w-3xl mx-auto">
      <nav className="mb-8">
        <Link
          href="/dev-log"
          className="text-xs font-mono text-amber-400/80 hover:text-amber-400 transition-colors flex items-center gap-1"
        >
          ← BACK TO DEV LOGS
        </Link>
      </nav>

      <header className="border-b border-slate-800 pb-6 mb-8">
        <div className="text-xs font-mono text-slate-500 mb-2">{post.date}</div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-slate-400 text-sm italic">{post.description}</p>
        )}
      </header>

      <article
        className="prose prose-invert prose-slate max-w-none prose-headings:text-slate-100 prose-a:text-amber-400 prose-code:text-amber-300"
        dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
      />
    </main>
  );
}