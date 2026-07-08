import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link'; 
import TechLabClient from './TechLabClient';
// 🔮 Lucideから最高に尖ったサイバーアイコンたちを召喚だし！
import { 
  Radio, 
  Terminal, 
  Layers, 
  LayoutGrid 
} from 'lucide-react';

// 📂 レポートの型定義
interface TechReport {
  id: string;
  title: string;
  summary: string;
  date: string;
  image: string;
  agent: string;
  category: string;
}

// 👁️‍🗨️ スピカの倉庫 (/src/posts) から全Markdownを自動取得する関数
function getTechReports(): TechReport[] {
  const postsDirectory = path.join(process.cwd(), 'src', 'posts');
  
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      
      try {
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        const { data, content } = matter(fileContents);

        const cleanContent = content.replace(/[#*`\n]/g, ' ').trim();
        const autoSummary = cleanContent.substring(0, 90) + '...';

        return {
          id,
          title: data.title || id,
          summary: data.summary || autoSummary,
          date: data.date || '',
          image: data.image || '/images/ComfyUI_00041_.png',
          agent: data.agent || 'シリウス（SIRIUS）',
          category: data.category || 'General',
        };
      } catch (error) {
        return {
          id,
          title: `⚠️ 破損ファイル: ${id}`,
          summary: 'ファイルの読み込み中にエラーが発生しました。',
          date: '0000.00.00',
          image: '/images/default.png',
          agent: 'SYSTEM',
          category: 'Error',
        };
      }
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// 衛星案内所（トップ画面）のメインコンポーネント
export default async function TechLabPage() {
  const reports = getTechReports();

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 font-sans antialiased selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* 🔮 案内所のサイバーパンク背景演出グラデーション */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-purple-950/15 via-pink-950/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* 🐇 案内所トップヘッダー：司令塔ルナのグランドデザイン */}
      <header className="border-b border-zinc-900/80 bg-zinc-950/40 backdrop-blur-md sticky top-12 z-30 px-6 py-5 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* 🐇 ルナのアイコンの横に、脈動するネットワークを表すRadioアイコンをフュージョン！ */}
            <div className="relative flex items-center justify-center">
              <span className="text-3xl drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] z-10">🐇</span>
              <Radio className="absolute w-10 h-10 text-purple-500/30 animate-ping pointer-events-none" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-widest text-purple-400 font-mono font-black flex items-center gap-1">
                <Layers className="w-3 h-3" /> LUNA's Constellations Pipeline
              </div>
              <h1 className="text-lg font-bold text-zinc-100 font-mono tracking-tight flex items-center gap-2">
                お星さまファクトリー・案内所スタンド
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                ルルプロデューサーの自律型AIたちが錬成した「点の成果物」が集結するショールームだし！
              </p>
            </div>
          </div>
          
          {/* ⚡ 個別ワープボタンを完全に消去し、システムステータスをここに綺麗に配置しただし！ */}
          <div className="flex items-center gap-3 md:self-center">
            <span className="text-[10px] bg-zinc-900/90 text-zinc-400 border border-zinc-800 px-3 py-1.5 rounded-lg font-mono flex items-center gap-1.5 shadow-inner">
              <Terminal className="w-3 h-3 text-emerald-400" /> SYSTEM_ACTIVE: <span className="text-emerald-400 font-bold">{reports.length} UNITS</span>
            </span>
          </div>
        </div>
      </header>

      {/* 🗺️ メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
            <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
            <span>デプロイ済みのメインコンテンツ一覧</span>
          </div>
        </div>

        {/* 🎬 カードアニメーションコンポーネント */}
        <TechLabClient initialReports={reports} />
      </main>

    </div>
  );
}