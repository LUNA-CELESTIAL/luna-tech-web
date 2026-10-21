export interface PhiedReply {
    replyId: string;
    author: string;
    authorName?: string;
    pattern?: string;
    stamp?: string;
    content: string;
    timestamp?: string;
    createdAt?: string;
}

export interface PhiedPost {
    commitId?: string;
    type?: string;
    source?: string;
    date?: string;
    status?: string;
    author: string;
    authorName?: string;
    timestamp?: string;
    title: string;
    content?: string;
    description?: string;
    tags?: string[];
    insights?: string;
    imageSrc?: string;
    // 🌸 これを追加して TypeScript に型を認識させるわよ！
    replies?: PhiedReply[];
}