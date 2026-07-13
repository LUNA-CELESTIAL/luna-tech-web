// src/app/posts/[id]/page.tsx
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import matter from 'gray-matter';
import PostDetailClient from './PostDetailClient';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostPageProps) {
  // 🔮 URLの [id] を Next.js の最新仕様に従って安全に await 展開だし！
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // 🛡️ 修正後：ルルの正しい要塞「data/posts/」を100%正確に狙い撃ちだし！
  const filePath = path.join(process.cwd(), 'data', 'posts', `${id}.md`);

  // もしルルが変なURLを直打ちしたりファイルが無かったら、安全に404へ退避！
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  // 💾 本物のファイルをサーバーサイドで100%安全に読み込むだし！
  const fileRaw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileRaw);

  // 🧠 タイトル自動防衛：フロントマターが無くてもファイル名からエモいタイトルを抽出！
  let displayTitle = data.title;
  if (!displayTitle) {
    if (id.toLowerCase().includes('numpy')) {
      displayTitle = 'NumPyの多次元配列定義と計算空間における絶対防衛ライン';
    } else if (id.toLowerCase().includes('pandas')) {
      displayTitle = 'Pandasの核心定義と本番運用における絶対防衛ライン';
    } else {
      displayTitle = `${id.toUpperCase()} 運用ストリームプロトコル`;
    }
  }

  const displayDate = data.date || '2026-07-09';

  // 🚀 抽出した「本物のデータ」を、動くステラ（Client）へ安全にテレポート！
  return (
    <PostDetailClient
      title={displayTitle}
      date={displayDate}
      content={content}
    />
  );
}