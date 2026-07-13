// app/phied/posts/[id]/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Next.js 15以降の非同期paramsに対応だし！
) {
  try {
    // 1. 動的URLから postId（例: numpy-readme）を取得する
    const { id: postId } = await params;
    
    // 2. 対象のMarkdownファイルへのパスをビルド
    const filePath = path.join(process.cwd(), 'data', 'posts', `${postId}.md`);
    
    // 3. ファイルが存在するか検閲！
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'ドキュメントが見つからないだし' }, { status: 404 });
    }
    
    // 4. ファイルを生テキストで読み込み
    const fileRaw = fs.readFileSync(filePath, 'utf-8');
    
    // 5. gray-matterでヘッダー（data）と本文（content）を完全分離パース！
    const { data, content } = matter(fileRaw);
    
    // 6. page.tsx が求めている形に綺麗にパッキングして送り返すだし！
    return NextResponse.json({
      title: data.title || `${postId.toUpperCase()} レポート`,
      date: data.date || "2026.07.05",
      content: content // 🌟 これが！画面の枠の中に流れ込む「本物の文字データ」だし！！
    });

  } catch (error) {
    console.error("🚨 個別ドキュメントのサルベージに失敗しただし！:", error);
    return NextResponse.json({ error: 'サーバー内部エラーだし' }, { status: 500 });
  }
}