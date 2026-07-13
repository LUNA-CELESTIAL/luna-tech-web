// app/phied/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Tag,
  BookOpen,
  Layers,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import PostDetailClient from './[id]/PostDetailClient';

interface PhiedTimelineLog {
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
  content: string;
}

interface LoadedPostData {
  title: string;
  date: string;
  content: string;
}

export default function PhiedPage() {
  // 📡 APIからリアルデータストリームを受け取るための状態
  const [timelineData, setTimelineData] = useState<PhiedTimelineLog[]>([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState<boolean>(true);

  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [loadedPosts, setLoadedPosts] = useState<Record<string, LoadedPostData>>({});
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null);

  // 📡 画面起動時に自動的にAPIからデータをサルベージ
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setIsTimelineLoading(true);
        const res = await fetch('/phied/posts/list');
        if (!res.ok) throw new Error('タイムラインストリームの吸引に失敗');
        const data = await res.json();
        setTimelineData(data);
      } catch (err) {
        console.error("🚨 リアルデータストリームの接続エラーだし！:", err);
      } finally {
        setIsTimelineLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  const handleToggleReplyTree = async (postId: string, commitId?: string) => {
    // ✨ 1. postIdが空文字（JSON出身）の場合のユニークなキーを確定させる
    const targetKey = postId || commitId || "";

    if (!postId) {
      // 🔮 MarkdownがないJSONログなら、通信せずにその場でアコーディオンを開閉して即終了！
      setExpandedPostId(expandedPostId === targetKey ? null : targetKey);
      return;
    }

    // すでにデータを読み込み済みなら、通信せずに開閉だけ行う防衛線
    if (loadedPosts[targetKey]) {
      setExpandedPostId(expandedPostId === targetKey ? null : targetKey);
      return;
    }

    setLoadingPostId(postId);
    try {
      const res = await fetch(`/phied/posts/${postId}`);
      if (!res.ok) throw new Error('データの吸い上げに失敗しただし');

      const data = await res.json();

      // 🛠️ 修正点①：保存する時のキーを postId から「targetKey」に修正！
      setLoadedPosts(prev => ({
        ...prev,
        [targetKey]: {
          title: data.title,
          date: data.date,
          content: data.content
        }
      }));

      // 🛠️ 修正点②：展開する対象のキーも「targetKey」に修正！
      setExpandedPostId(targetKey);
    } catch (err) {
      console.error("深層ドキュメントのサルベージに失敗しただし:", err);
    } finally {
      setLoadingPostId(null);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#020204] text-zinc-100 font-mono overflow-hidden h-[calc(100dvh-112px)]">
      <div className="px-4 py-2.5 bg-zinc-950/90 border-b border-zinc-900 flex items-center justify-end text-[11px] text-zinc-500 shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>STREAM_STATUS: <span className="text-emerald-500 font-bold">REAL_DATA_STREAM_ON</span></span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-black/10 to-zinc-950/40">
        {isTimelineLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs py-20">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span>CONNECTING_REAL_DATA_STREAM...</span>
          </div>
        ) : timelineData.length === 0 ? (
          <div className="text-center text-zinc-600 text-xs py-20">// TIMELINE_STREAM_EMPTY</div>
        ) : (
          timelineData.map((log) => {
            // 🔮 1. postIdがなければcommitIdをユニークなキーとして使うだし！
            const isTreeOpen = expandedPostId === (log.postId || log.commitId);

            // ✨ 2. 【超重要】postId（Markdown）か、content（JSON本文）のどちらかがあれば「記事あり」と判定！
            const hasArticle = !!log.postId || !!log.content;

            // ⚡ 3. ローディング判定もキーに合わせるだし
            const isThisLoading = loadingPostId === log.postId && !!log.postId;
            return (
              <div key={log.commitId} className="w-full bg-zinc-900/10 border border-zinc-900/80 rounded-2xl p-3.5 flex flex-col gap-3 relative overflow-hidden transition-all shadow-sm">
                <div className="flex items-center justify-between text-[11px] select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{log.emoji}</span>
                    <span className="font-black text-zinc-200 tracking-wide">{log.agent}</span>
                    <span className="text-zinc-800">/</span>
                    <span className={`text-[9.5px] font-bold border px-1 rounded font-sans scale-95 ${log.status === 'ADOPTED' ? 'bg-emerald-950/10 border-emerald-500/30 text-emerald-400' :
                      log.status === 'SUCCESS' ? 'bg-cyan-950/10 border-cyan-500/30 text-cyan-400' :
                        'bg-purple-950/10 border-purple-500/30 text-purple-400'
                      }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-sans">
                    <Clock className="w-3 h-3" />
                    <span>{log.date}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[12px] font-black text-zinc-100 tracking-tight leading-snug">{log.title}</h3>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed text-justify">{log.description}</p>
                </div>

                {log.imageSrc && (
                  <div className="w-full rounded-xl overflow-hidden border border-zinc-900/60 relative h-48 md:h-64 bg-black mt-0.5 shadow-inner flex items-center justify-center">
                    <img
                      src={log.imageSrc}
                      alt={log.title}
                      className="max-w-full max-h-full object-contain opacity-90"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    {/* 🗑️ ここにあった「absolute inset-0 ... スレッドと制作秘話を表示」のブロックを丸ごと削除だし！ */}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {log.tags.map(tag => (
                    <span key={tag} className="text-[9.5px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-900 flex items-center gap-0.5 font-sans select-none">
                      <Tag className="w-2.5 h-2.5 text-zinc-700" /> #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-2 pt-2.5 border-t border-zinc-950 flex flex-col gap-2 bg-black/20 p-2 rounded-xl border border-zinc-900/30">
                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="text-zinc-600 select-none shrink-0 font-bold">└─ 💬</span>
                    <p className="text-zinc-400 font-sans leading-relaxed text-justify bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900/40 flex-1">{log.storyReply}</p>
                  </div>

                  {/* 🟢 画像の下に、いつでも堂々と EXPAND ボタンを出現させるだし！ */}
                  {hasArticle && (
                    <div className="flex flex-col gap-2 mt-1 pl-4">
                      <button

                        onClick={() => handleToggleReplyTree(log.postId, log.commitId)}
                        disabled={isThisLoading}
                        className={`w-full flex items-center justify-between text-[10px] px-2.5 py-1.5 rounded-lg border transition-all ${isTreeOpen ? 'bg-pink-950/10 border-pink-500/40 text-pink-400' : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'}`}
                      >
                        <span className="font-bold flex items-center gap-1">
                          <BookOpen size={12} className={isTreeOpen ? 'text-pink-500' : 'text-zinc-600'} />
                          {isTreeOpen ? '// CORE_REPORT_OPENED' : `// READ_MORE_TREE: [${(log.postId || 'JSON_LOG').toUpperCase()}]`}
                        </span>
                        <div className="flex items-center gap-1 font-black shrink-0">
                          {isThisLoading ? <Loader2 size={11} className="animate-spin text-pink-400" /> : isTreeOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          <span>{isThisLoading ? 'FETCHING...' : isTreeOpen ? 'CLOSE' : 'EXPAND'}</span>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isTreeOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden border-l-2 border-pink-950 pl-2"
                          >
                            <div className="bg-zinc-950/50 rounded-xl border border-zinc-900/60 p-3 shadow-inner space-y-2">
                              {log.postId ? (
                                /* 📝 Markdown出身ポストの時：サーバーから新しく吸い上げた loadedPosts の中身を絶対に使う！ */
                                loadedPosts[log.postId] ? (
                                  <PostDetailClient
                                    title={loadedPosts[log.postId].title}
                                    date={loadedPosts[log.postId].date}
                                    content={loadedPosts[log.postId].content}
                                    isReplyMode={true}
                                  />
                                ) : (
                                  <div className="text-zinc-600 text-[10px] animate-pulse">// LOADING_STREAM_DATA...</div>
                                )
                              ) : (
                                /* 🤖 JSON出身ポストの時：既に log の中に持っているコンテンツをそのままストレートに直出し！ */
                                <div className="space-y-3 font-sans text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                  <div className="font-mono text-[10px] text-pink-500 border-b border-zinc-900 pb-1 flex items-center gap-1 select-none">
                                    <span>[SYSTEM_INLINE_STREAM_OUTPUT]</span>
                                  </div>
                                  <div className="pl-1 text-zinc-200">
                                    {log.content}
                                  </div>
                                </div>
                              )}

                              {log.postId ? (
                                <div className="mt-3 pt-2 border-t border-zinc-900/60 flex justify-end">
                                  <Link href={`/phied/${log.postId}`} className="text-[8.5px] font-black tracking-widest text-zinc-600 hover:text-pink-400 transition-colors bg-black px-2 py-1 rounded border border-zinc-950">
                                    DEEP_LINK_WINDOW ➔
                                  </Link>
                                </div>
                              ) : null}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>                   </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}