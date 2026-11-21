import { NextRequest, NextResponse } from 'next/server';
import phiedData from '@/data/phied.json';
import { PhiedPost } from '@/types/phied';

// phied.json はサーバー側でのみ読み、必要な分だけを返す窓口。
// 本体ファイルと毎日の自動更新には一切触らない。
// 使い方: /api/phied?limit=3 / ?month=2026-11&limit=20&offset=20
const ALL_POSTS = phiedData as PhiedPost[];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const month = params.get('month');
  const limitRaw = parseInt(params.get('limit') ?? '20', 10);
  const offsetRaw = parseInt(params.get('offset') ?? '0', 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20;
  const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;

  // 投稿の日付は "2026.11.20" 形式。month は "2026-11" でも "2026.11" でも受ける
  const filtered = month
    ? ALL_POSTS.filter((post) => post.date.startsWith(month.replace('-', '.')))
    : ALL_POSTS;

  const posts = filtered.slice(offset, offset + limit);

  return NextResponse.json(
    { total: filtered.length, limit, offset, posts },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    }
  );
}
