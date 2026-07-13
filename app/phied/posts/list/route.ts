// app/phied/posts/list/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface PhiedPost {
  postId: string;
  commitId: string;
  date: string;
  status: string;
  emoji: string;
  agent: string;
  title: string;
  description: string;
  tags: string[];
  imageSrc: string | null;
  storyReply: string;
  content: string; // 🌟 ここに文字列が入ることを厳格に定義だし！
}

export async function GET() {
  try {
    // --------------------------------------------------------
    // 1. Markdownファイル（numpy-readme等）のスキャン
    // --------------------------------------------------------
    const dirPath = path.join(process.cwd(), 'data', 'posts');
    let markdownPosts: PhiedPost[] = [];
    
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      markdownPosts = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
          const postId = file.replace('.md', '');
          const filePath = path.join(dirPath, file);
          const fileRaw = fs.readFileSync(filePath, 'utf-8');
          const { data: frontMatter, content: mdContent } = matter(fileRaw);
          
          return {
            postId,
            commitId: frontMatter.commitId || `log-${postId}-${frontMatter.date?.replace(/\./g, '') || 'unknown'}`,
            date: frontMatter.date || "2026.07.05",
            status: frontMatter.status || "ADOPTED",
            emoji: frontMatter.emoji || "📝",
            agent: frontMatter.agent || "不明なエージェント",
            title: frontMatter.title || `${postId.toUpperCase()} テクニカルレポート`,
            description: frontMatter.description || "",
            tags: frontMatter.tags || [],
            imageSrc: frontMatter.imageSrc || null,
            storyReply: frontMatter.storyReply || "秘話ログは未登録だし。",
            content: mdContent || "" // Markdownの本文を注入
          };
        });
    }

    // --------------------------------------------------------
    // 2. 外部JSONデータ（phied.json）のパースと完全マッピング
    // --------------------------------------------------------
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'phied.json');
    let jsonPosts: PhiedPost[] = [];

    if (fs.existsSync(jsonPath)) {
      const jsonRaw = fs.readFileSync(jsonPath, 'utf-8');
      const rawJsonData = JSON.parse(jsonRaw);

      if (Array.isArray(rawJsonData)) {
        jsonPosts = rawJsonData
          .map((item: any) => {
            // 重複ガード：すでにMarkdown側で同じpostIdが存在する場合はJSON側を弾く
            if (item.postId && markdownPosts.some(md => md.postId === item.postId)) {
              return null;
            }

            // 🔮 修正の特異点：JSONから "content" を絶対にドロップさせないだし！！
            return {
              postId: item.postId || "", 
              commitId: item.commitId || `json-${Math.random().toString(36).substr(2, 9)}`,
              date: item.date ? item.date.replace(/-/g, '.') : "2026.07.05",
              status: item.status || "SUCCESS",
              emoji: item.emoji || "🤖",
              agent: item.agent || "SYSTEM",
              title: item.title || "無題のログ",
              description: item.description || "",
              tags: item.tags || [],
              imageSrc: item.imageSrc || null,
              storyReply: item.storyReply || "マスターログから同期されただし。",
              content: item.content || "" // ⭐ これ！！！この行がないから消滅してたのよ！
            };
          })
          .filter(Boolean) as PhiedPost[];
      }
    }

    // --------------------------------------------------------
    // 3. データの完全結合と時系列（降順）ソート
    // --------------------------------------------------------
    const allCombinedTimeline = [...markdownPosts, ...jsonPosts].sort((a, b) => 
      b.date.localeCompare(a.date)
    );

    return NextResponse.json(allCombinedTimeline);

  } catch (error) {
    console.error("🚨 タイムライン統合スキャンエラーだし！:", error);
    return NextResponse.json({ error: 'サーバー内部エラーだし' }, { status: 500 });
  }
}