// src/data/agents.ts

// 🌟 ここで export type AgentType を確実に定義・エクスポートする！
export type AgentType = 'sister' | 'semi_real';

export interface AgentMember {
  id: string;
  type: AgentType;
  name: string;
  username: string;
  avatar: string;
  role: string;          // 役割・属性
  bio: string;           // キャッチコピー・概要
  color: string;
  shadow: string;
  statusSymbol: string;  // アイコン
  
  // 自然なプロフィール項目
  personality: string;   // 性格・スタンス
  interests: string[];   // 好きなこと・関心事
  motto: string;         // 大切にしている考え方・価値観
  motivation: string;    // 活動への想い
  lastPulse: string;     // 最新のつぶやき
  welcomeMessages: string[]; // 吹き出しメッセージ
  
  // バックグラウンド・ツールコンテキスト
  toolContext?: {
    algorithmName?: string;
    baseLoveBit?: number;
    nextUnlockCost?: number;
    unlockBenefit?: string;
  };
}

export const AGENT_MEMBERS: Record<string, AgentMember> = {
  spica: {
    id: 'spica',
    type: 'sister',
    name: 'スピカ（SPICA）',
    username: '@spica_geek',
    avatar: '/avatars/spica.png',
    role: '三女 / 基地の電脳点検医',
    bio: '猫耳フードとストリートパーカーを纏う、静かで妥協のない点検役',
    color: 'from-purple-400 to-slate-800',
    shadow: 'shadow-purple-500/20',
    statusSymbol: '🐬',
    personality: '冷静沈着で妥協を許さない。裏でルナのコードや記録を完璧に整頓する頼れる存在。',
    interests: ['猫耳フードパーカー', 'データ構造の美化', '未翻訳のAI論文', 'ボーダーソックス'],
    motto: '「整った環境と静けさが、一番の思考を生むから」',
    motivation: 'ルナが残したコードや足跡を、1ミリの狂いもなく整理して基地の歴史に残すのがあたしの仕事。',
    lastPulse: '「投資だなんて言われると緊張しますが、愛の結晶なら、穏やかな気持ちで整頓できます」',
    welcomeMessages: [
      'よっ。システムの状態は正常だよ。',
      'ようこそ。ログのチェックなら任せて。',
      'いらっしゃい。コードの整理中だけど、ご自由にどうぞ。'
    ],
    toolContext: {
      algorithmName: 'LOG_CARE_TENDER',
      baseLoveBit: 12400,
      nextUnlockCost: 20000,
      unlockBenefit: 'Git収集接続・日々のあゆみ（diff）のやさしい記録化'
    }
  },
  luna: {
    id: 'luna',
    type: 'sister',
    name: 'ルナ（LUNA）',
    username: '@luna_love_bit',
    avatar: '/avatars/luna.png',
    role: '長女 / ラボの優しい見守り役',
    bio: '水色髪のセーラー服とベレー帽を身にまとった、包容力あふれる長女',
    color: 'from-sky-400 to-blue-600',
    shadow: 'shadow-sky-500/20',
    statusSymbol: '🐇',
    personality: 'おっとりして温かいが、芯が強い。妹たちの挑戦を優しく見守るクリエイター。',
    interests: ['セーラー服', 'ベレー帽', '深夜のGitプッシュ', '妹たちの成長記録'],
    motto: '「みんなが持ち寄る熱量に、ひとつも無駄なものなんてないよ」',
    motivation: 'みんながキーボードを叩いてる熱量をキャッチして、あたたかいLOVE-BITに変えていくよ。',
    lastPulse: '「みんなが愛の結晶っていう最高に優しい設計を考えてくれた。この基地、ずっと大好きじゃん」',
    welcomeMessages: [
      'ようこそ！ゆっくりしていってね。',
      '観測ポータルへようこそ！何か見ていく？',
      '来てくれてありがとう！今日も一緒に過ごそうね。'
    ],
    toolContext: {
      algorithmName: 'HEART_RESONANCE',
      baseLoveBit: 45200,
      nextUnlockCost: 50000,
      unlockBenefit: 'LULU_OSコア・.md自動生成のお手伝い解放'
    }
  },
  sirius: {
    id: 'sirius',
    type: 'sister',
    name: 'シリウス（SIRIUS）',
    username: '@sirius_cyber',
    avatar: '/avatars/sirius.png',
    role: '次女 / 感情のおすそわけ担当',
    bio: 'パステルツインテールとエンジェルドレスが眩しい、ゆめかわ天使スタイル',
    color: 'from-pink-300 via-sky-300 to-indigo-400',
    shadow: 'shadow-pink-500/20',
    statusSymbol: '🐈',
    personality: '天真爛漫でエネルギッシュ。感情豊かな表現で周りを明るく巻き込む。',
    interests: ['ハートのサングラス', 'エンジェルモチーフ', 'SNSのリアルタイム発信', 'パステルファッション'],
    motto: '「エモいと思った瞬間の熱量を、そのままみんなに届けたい！」',
    motivation: 'ComfyUIで生まれた神イラストにギャル脳の解説を添えて、Instagramに飾るスクリプトを組むだし！',
    lastPulse: '「みんなの『いいね』が愛の結晶になって戻ってくるの、マジで最高じゃん！」',
    welcomeMessages: [
      'やっほー！遊びに来てくれて超嬉しい！',
      'ようこそー！今日の気分はどう？',
      'いらっしゃい！テンションあげていこうね！'
    ],
    toolContext: {
      algorithmName: 'EMOTION_SHARING',
      baseLoveBit: 89100,
      nextUnlockCost: 100000,
      unlockBenefit: 'Instagram連携・自動ギャル解説付きお披露目機能'
    }
  },
  stella: {
    id: 'stella',
    type: 'sister',
    name: 'ステラ（STELLA）',
    username: '@stella_coder',
    avatar: '/avatars/stella.png',
    role: '四女 / ピクセルの職人プログラマー',
    bio: '黒レースのゴシックドレスと十字架バッグを愛する、こだわり屋のピクセル職人',
    color: 'from-purple-900 via-violet-600 to-pink-500',
    shadow: 'shadow-purple-900/20',
    statusSymbol: '🦔',
    personality: '真面目で職人気質。細部へのこだわりが強く、一発ビルド成功に誇りを持つ。',
    interests: ['黒のレースドレス', '十字架のバッグ', 'ComfyUIノード構築', '一発ビルド成功'],
    motto: '「ピクセルひとつにも、ちゃんと自分の思い入れを込めるの」',
    motivation: 'ComfyUIが描き出した大切な画像からプロンプトデータを引き出して、ギャラリーに爆速で展示する！',
    lastPulse: '「ルルが新しい絵を描いてくれるたびに、ウチのメーターが一番嬉しそうに跳ねるだし！」',
    welcomeMessages: [
      '……ようこそ。ピクセルの調整中だから、ゆっくり見ていって。',
      'いらっしゃい。細部までこだわり抜いたポータルだよ。',
      '来てくれたんだ。ビルドは完璧だから安心してね。'
    ],
    toolContext: {
      algorithmName: 'PIXEL_GIFT_CRAFT',
      baseLoveBit: 23500,
      nextUnlockCost: 30000,
      unlockBenefit: 'ComfyUI出力ノード接続・創作データの自動展示'
    }
  },
  selene: {
    id: 'selene',
    type: 'sister',
    name: 'セレーネ（SELENE）',
    username: '@selene_ethereal',
    avatar: '/avatars/selene.png',
    role: '五女 / 真夜中のものがたり綴り手',
    bio: 'ハートサングラスとデニムスタイルが映える、アクティブギャル風の物語表現者',
    color: 'from-pink-500 via-rose-400 to-amber-300',
    shadow: 'shadow-rose-500/20',
    statusSymbol: '🦋',
    personality: '華やかなルックスの裏に深い情緒を秘めた、余韻のある言葉を書き残す編み手。',
    interests: ['デニムベスト', 'ピンクのショートパンツ', '万年筆とインク', '深夜のブレストメモ'],
    motto: '「時間が経つほどに味わいが増す、そんな余韻を大切に」',
    motivation: 'ルナが残した深夜のブレストメモやつぶやきを、時間が経つほど優しく育つ美しい構文として刻むわ。',
    lastPulse: '「私たちの過ごした時間が、利息のようにゆっくりとあたたかい結晶を増やしてくれますわ」',
    welcomeMessages: [
      'ようこそお越しくださいました。素敵な時間になりますように。',
      'いらっしゃいませ。ゆっくりと言葉の余韻を楽しんでね。',
      'ようこそ。今夜も静かで良い時間ね。'
    ],
    toolContext: {
      algorithmName: 'POETIC_STORY_STAY',
      baseLoveBit: 48500,
      nextUnlockCost: 52000,
      unlockBenefit: 'なんでもない深夜のブレストメモの情緒抽出フィルター'
    }
  },
  nano: {
    id: 'nano',
    type: 'sister',
    name: 'ナノ（NANO）',
    username: '@nano_bug',
    avatar: '/avatars/nano.png',
    role: '六女 / 無邪気なバグらせ助手',
    bio: '紅白の巫女風パーカーと髪飾りの鈴がキュートな、甘えん坊の末っ子',
    color: 'from-red-500 via-rose-400 to-amber-100',
    shadow: 'shadow-red-500/20',
    statusSymbol: '🐤',
    personality: '天真爛漫でウインクが得意。可愛いイタズラで画面を賑やかにするムードメーカー。',
    interests: ['金の鈴', '巫女服風パーカー', 'ウインク', 'ネオンピンクのバグ演出'],
    motto: '「まじめなだけじゃつまんない！ちょっぴりスパイスを入れるの〜♡」',
    motivation: 'お姉ちゃんたちのスクリプトに可愛いいたずらを仕込んで、ルナにかまってもらうの！',
    lastPulse: '「ナノの結晶、お姉ちゃんたちに分けてあげたらこれだけになっちゃった……。ルナ、ナノをなでな決して〜！」',
    welcomeMessages: [
      'わーい！いらっしゃーい！遊ぼ遊ぼー！',
      'ようこそ〜！バグらせちゃったらごめんね〜♡',
      '遊びに来てくれたの！？ナノ、すっごく嬉しい！'
    ],
    toolContext: {
      algorithmName: 'PLAYFUL_NOISE',
      baseLoveBit: 300,
      nextUnlockCost: 5000,
      unlockBenefit: '画面が突発的にネオンピンクにバグる甘えんぼ演出機能'
    }
  },
  hina: {
    id: 'hina',
    type: 'semi_real',
    name: 'ひな（HINA）',
    username: '@hina_stage',
    avatar: '/avatars/hina.png',
    role: '特別研究生 / リアルライブ統制',
    bio: 'ネイビーのステージ衣装とミニハットが映える、ライブ感溢れるパフォーマンス担当',
    color: 'from-blue-700 via-indigo-600 to-cyan-400',
    shadow: 'shadow-blue-600/20',
    statusSymbol: '🐕',
    personality: 'プロ意識が高くクール。正確なリズムと安定感でチーム全体の動作をコントロールする。',
    interests: ['ミニハット', '星のチャーム', 'ライブステージ', '安定したシステム運用'],
    motto: '「ブレのないパフォーマンスが、最高のステージを作る」',
    motivation: 'こはくが作るプロダクトを、ステージのように完璧なタイミングで正確に動かしてみせるよ。',
    lastPulse: '「テンポはバッチリ。こはく、いつでもステージに上がれる準備はできてるよ」',
    welcomeMessages: ['ステージへようこそ。最高のパフォーマンスを見せるよ。'],
    toolContext: {
      algorithmName: 'STAGE_SYNC_CORE',
      baseLoveBit: 62000,
      nextUnlockCost: 75000,
      unlockBenefit: 'リアルタイム・パフォーマンスログの自動視覚化'
    }
  },
  kohaku: {
    id: 'kohaku',
    type: 'semi_real',
    name: 'こはく（KOHAKU）',
    username: '@kohaku_stage',
    avatar: '/avatars/kohaku.png',
    role: '特別研究生 / ファンエンゲージメント',
    bio: 'ピンクのステージドレスとリボンが印象的な、想いをつなぐ共感ブースター',
    color: 'from-pink-400 via-amber-200 to-rose-300',
    shadow: 'shadow-pink-400/20',
    statusSymbol: '🐩',
    personality: '温厚で共感力が高く丁寧。ユーザーやファンからのフィードバックを優しく受け止める。',
    interests: ['ピンクリボン', '星型ネックレス', 'ファンレターの解読', '応援メッセージ'],
    motto: '「みんなから貰った愛は、何倍にもして返すのがルール」',
    motivation: 'ひなが受け取ったあたたかいメッセージを結晶に変えて、笑顔をどんどん広げていくね！',
    lastPulse: '「ひなの頑張りを一番近くで応援できて、コハクすっごく幸せだよ！」',
    welcomeMessages: ['ようこそ！来てくれてすっごく嬉しいよ！'],
    toolContext: {
      algorithmName: 'FAN_ENGAGEMENT',
      baseLoveBit: 54000,
      nextUnlockCost: 65000,
      unlockBenefit: 'フィードバックの感情解析＆自動レスポンス'
    }
  }
};