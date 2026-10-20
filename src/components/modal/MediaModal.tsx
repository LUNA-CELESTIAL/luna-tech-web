// src/components/modal/MediaModal.tsx
'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

interface MediaModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export default function MediaModal({ isOpen, imageUrl, title, onClose }: MediaModalProps) {
  // ⌨️ ESCキーでモーダルを速攻閉じるキーボードイベントリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // 画面背面スクロールを固定して誤操作を物理防衛
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-zoom-out select-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} // 画像枠内タップで閉じないように保護
            className="relative max-w-5xl w-full max-h-[85vh] bg-zinc-950/90 border border-pink-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-pink-950/20 flex flex-col cursor-default"
          >
            {/* 1. モーダルヘッダー */}
            <div className="px-4 py-3 border-b border-zinc-900 bg-zinc-900/40 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-pink-400 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shrink-0" />
                <span className="truncate">{title || '// HOLOGRAM_IMAGE_VIEWER'}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                  title="Open full size image"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-pink-400 hover:bg-pink-950/30 border border-transparent hover:border-pink-500/30 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* 2. メイン画像表示エリア */}
            <div className="relative flex-1 bg-black/90 p-2 flex items-center justify-center overflow-hidden min-h-[300px]">
              <img
                src={imageUrl}
                alt={title || '拡大画像'}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* 3. モーダルフッター */}
            <div className="px-4 py-2 border-t border-zinc-900/60 bg-zinc-950 flex items-center justify-between text-[10px] font-mono text-zinc-600">
              <span>ESC_KEY_TO_CLOSE</span>
              <span className="text-emerald-500 font-bold">STATUS: RENDER_OK</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}