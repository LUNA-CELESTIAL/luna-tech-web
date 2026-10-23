'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface CustomAudioPlayerProps {
    src: string;
    agentRole: string; // スタイルの色分け用（nanoならピンク）
}

export default function CustomAudioPlayer({ src, agentRole }: CustomAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // メタデータロード時に長さを取得
    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    // 再生位置更新時に時間を取得
    const onTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    // シークバー操作
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // 時間表記のフォーマット (0:00)
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // エージェントごとのカラー定義 (image_1.png準拠)
    const accentColor = agentRole === 'nano' ? 'text-pink-400' : 'text-cyan-400';
    const bgColor = agentRole === 'nano' ? 'bg-pink-950/30' : 'bg-cyan-950/30';
    const sliderColor = agentRole === 'nano' ? 'accent-pink-500' : 'accent-cyan-500';

    return (
        <div className={`p-3 rounded-xl border border-zinc-800 space-y-2 ${bgColor} font-mono animate-fadeIn shadow-inner`}>
            {/* hidden audio element */}
            <audio 
                ref={audioRef} 
                src={src} 
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                onEnded={() => setIsPlaying(false)}
            />

            {/* カスタムUI */}
            <div className="flex items-center gap-3">
                {/* 1. 再生/一時停止ボタン */}
                <button 
                    onClick={togglePlay} 
                    className={`w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 ${accentColor} hover:border-white transition-all cursor-pointer shadow-md`}
                >
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5"/>}
                </button>

                {/* 2. タイムカウンターとシークバー (image_1.pngの波形部分を再現) */}
                <div className="flex-1 space-y-1">
                    <div className={`w-full h-8 ${bgColor} rounded border border-zinc-800/50 flex items-center px-2 relative overflow-hidden`}>
                        {/* ここに将来的に波形グラフィックを入れるスペース */}
                        <div className="absolute inset-0 opacity-20 bg-[url('/assets/images/phied/waveform_bg.png')] bg-repeat-x bg-center h-4 my-auto"></div>
                        
                        <input 
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className={`w-full h-1 relative z-10 ${sliderColor} cursor-pointer opacity-80 hover:opacity-100 transition-opacity`}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-bold px-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* 3. ボリュームアイコン */}
                <div className={`${accentColor}`}>
                    <Volume2 size={16} />
                </div>
            </div>
        </div>
    );
}