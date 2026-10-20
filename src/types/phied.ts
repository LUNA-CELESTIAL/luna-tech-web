// src/types/phied.ts

export interface PhiedPost {
  commitId: string;
  title: string;
  content?: string;
  imageSrc?: string;
  tags?: string[];
  status?: string;
  date?: string;
  
  // PostCard.tsx で必要とされるオプショナルフィールド
  author?: string;
  authorName?: string;
  timestamp?: string;
  insights?: string;
}