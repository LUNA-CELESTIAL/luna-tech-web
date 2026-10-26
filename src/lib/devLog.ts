import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/content/dev-log');

export interface DevLogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  contentHtml?: string;
}

/**
 * すべての開発ログ（Markdown）のメタ情報を取得し、日付降順で返す
 */
export function getSortedDevLogs(): DevLogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        slug,
        title: matterResult.data.title || 'Untitled',
        date: matterResult.data.date || '2026-01-01',
        description: matterResult.data.description || '',
      };
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * 指定したslugのMarkdown本文をHTML化して取得する
 */
export async function getDevLogData(slug: string): Promise<DevLogPost | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    console.error(`⚠️ [WARN] 指定されたDevLogが存在しません: ${fullPath}`);
    return null;
  }

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    const processedContent = await remark()
      .use(html)
      .process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
      slug,
      title: matterResult.data.title || 'Untitled',
      date: matterResult.data.date || '2026-01-01',
      description: matterResult.data.description || '',
      contentHtml,
    };
  } catch (error) {
    console.error(`❌ [ERROR] Markdownの解析に失敗しました (${slug}):`, error);
    return null;
  }
}