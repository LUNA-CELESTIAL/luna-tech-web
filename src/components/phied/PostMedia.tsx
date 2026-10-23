'use client';

import React, { useState } from 'react';
import { PhiedPost } from '@/types/phied';

interface PostMediaProps {
    log: PhiedPost;
    onImageClick: (url: string, title: string) => void;
}

export default function PostMedia({ log, onImageClick }: PostMediaProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <>
            {/* アイキャッチ画像 */}
            {log.imageSrc && !imageError && (
                <div className="w-full rounded-xl overflow-hidden border border-zinc-900/80 relative bg-black/90 mt-1 shadow-inner flex items-center justify-center p-1">
                    <div
                        onClick={() => onImageClick(log.imageSrc!, log.title)}
                        className="w-full relative cursor-zoom-in group flex items-center justify-center"
                    >
                        <img
                            src={log.imageSrc}
                            alt=""
                            className="w-full h-auto max-h-[420px] object-contain rounded-lg opacity-90 group-hover:opacity-100 group-hover:scale-[1.01] transition-all duration-300"
                            onError={() => setImageError(true)}
                        />
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/80 border border-zinc-800 text-[9px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity font-mono pointer-events-none backdrop-blur-sm">
                            🔍 TAP_TO_EXPAND
                        </div>
                    </div>
                </div>
            )}

            {/* 🎬 動画専用表示エリア（パターンB） */}
            {log.videoSrc && (
                <div className="w-full rounded-xl overflow-hidden border border-pink-500/30 relative bg-black/90 mt-2 shadow-2xl flex flex-col items-center justify-center p-1">
                    <div className="w-full flex items-center justify-between px-2 py-1 text-[10px] text-pink-400 font-mono border-b border-zinc-900/80 mb-1">
                        <span className="flex items-center gap-1.5 font-bold">
                            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                            MOTION_VIDEO_STREAM
                        </span>
                        <span className="text-zinc-600">MINIMAX_H3</span>
                    </div>
                    <video
                        src={log.videoSrc}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto max-h-[480px] object-contain rounded-lg opacity-95 hover:opacity-100 transition-opacity"
                    />
                </div>
            )}
        </>
    );
}