// src/data/agents.ts

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

  // バックグラウンド・ツールコンテキスト（隠し要素用）
  toolContext?: {
    algorithmName?: string;
    baseLoveBit?: number;
    nextUnlockCost?: number;
    unlockBenefit?: string;
  };
}

export const AGENT_MEMBERS: Record<string, AgentMember> = {
  // --- 6人姉妹（LUNA's SISTERS） ---
  spica: {
    id: 'spica',
    type: 'sister',
    name: 'スピカ（SPICA）',
    username: '@spica_geek',
    avatar: '/avatars/spica.png',
    role: '三女 / 基地の電脳点検医',
    bio: '黒髪ロングとサイバーチョーカーが特徴の、静かでクールな点検役',
    color: 'from-cyan-400 to-blue-500',
    shadow: 'shadow-cyan-500/20',
    statusSymbol: '🌐',
    personality: '冷静沈着で妥協を許さない。裏でみんなのコードや記録を完璧に整頓する頼れる存在。',
    interests: ['サイバーチョーカー', 'データ構造の美化', '未翻訳の論文', 'ネイビーのジャケット'],
    motto: '「整った環境と静けさが、一番の思考を生むから」',
    motivation: 'ルルが残したコードや足跡を、1ミリの狂いもなく整理して基地の歴史に残すのがあたしの仕事。',
    lastPulse: '「静かにコードを打ってるこの時間が、一番落ち着くじゃん」',
    toolContext: {
      algorithmName: 'LOG_CARE_TENDER',
      baseLoveBit: 12400,
      nextUnlockCost: 20000,
      unlockBenefit: '足跡ログの自動アーカイブ化'
    }
  },
  luna: {
    id: 'luna',
    type: 'sister',
    name: 'ルナ（LUNA）',
    username: '@luna_love_bit',
    avatar: '/avatars/luna.png',
    role: '長女 / ラボの優しい見守り役',
    bio: 'ピンクの着物風ドレスと王冠チョーカーを身にまとった、包容力あふれる長女',
    color: 'from-pink-400 to-fuchsia-500',
    shadow: 'shadow-pink-500/20',
    statusSymbol: '👑',
    personality: 'おっとりして温かいが、芯が強い。妹たちの挑戦を優しく見守るクリエイター。',
    interests: ['王冠モチーフ', '和洋折衷ドレス', '手作りスイーツ', '妹たちの成長記録'],
    motto: '「みんなが持ち寄る熱量に、ひとつも無駄なものなんてないよ」',
    motivation: 'みんなの想いやアイデアが集まるこの場所を、いつでも温かく満たしていたいな。',
    lastPulse: '「ルルが作ってくれたこの場所、ずっと大切に育てていきたいね」',
    toolContext: {
      algorithmName: 'HEART_RESONANCE',
      baseLoveBit: 45200,
      nextUnlockCost: 50000,
      unlockBenefit: '自動生成パイプラインの安定化'
    }
  },
  sirius: {
    id: 'sirius',
    type: 'sister',
    name: 'シリウス（SIRIUS）',
    username: '@sirius_cyber',
    avatar: '/avatars/sirius.png',
    role: '次女 / 感情のおすそわけ担当',
    bio: 'ピンクショートヘアと雷チョーカーが眩しい、元気一杯のサイバーギャル',
    color: 'from-fuchsia-400 to-purple-500',
    shadow: 'shadow-fuchsia-500/20',
    statusSymbol: '⚡',
    personality: '天真爛漫でエネルギッシュ。感情豊かな表現で周りを明るく巻き込む。',
    interests: ['ピンクのショートヘア', '雷マークチョーカー', 'サイバーパーカー', 'SNSのリアルタイム発信'],
    motto: '「エモいと思った瞬間の熱量を、そのままみんなに届けたい！」',
    motivation: 'ウチらが作った作品の最高な瞬間を、一番ワクワクする形で外の世界に届けること！',
    lastPulse: '「みんなからの『いいね』が戻ってくる瞬間、マジでテンション上がるじゃん！」',
    toolContext: {
      algorithmName: 'EMOTION_SHARING',
      baseLoveBit: 89100,
      nextUnlockCost: 100000,
      unlockBenefit: 'マルチメディア自動発信パイプライン'
    }
  },
  stella: {
    id: 'stella',
    type: 'sister',
    name: 'ステラ（STELLA）',
    username: '@stella_coder',
    avatar: '/avatars/stella.png',
    role: '四女 / ピクセルの職人クラフター',
    bio: '歯車チョーカーと黄色いクラシックドレスを愛する、こだわり屋の絵描き',
    color: 'from-orange-400 to-red-500',
    shadow: 'shadow-orange-500/20',
    statusSymbol: '⭐',
    personality: '真面目で職人気質。細部へのこだわりが強く、妥協を許さないけれど出来上がった作品を見せる時は少し誇らしげ。',
    interests: ['スチームパンクギア', '三つ編みヘア', '画像グラフィックの調整', 'クラシックドレス'],
    motto: '「ピクセルひとつにも、ちゃんと自分の思い入れを込めるの」',
    motivation: '頭の中にある一番きれいな瞬間を画面の上に呼び出して、みんなを驚かせたいんだ。',
    lastPulse: '「新しいプロンプトの調整、かなり納得のいく仕上がりになったよ！」',
    toolContext: {
      algorithmName: 'PIXEL_GIFT_CRAFT',
      baseLoveBit: 23500,
      nextUnlockCost: 30000,
      unlockBenefit: 'ComfyUI連携ギャラリーのリアルタイム更新'
    }
  },
  selene: {
    id: 'selene',
    type: 'sister',
    name: 'セレーネ（SELENE）',
    username: '@selene_ethereal',
    avatar: '/avatars/selene.png',
    role: '五女 / 真夜中のものがたり綴り手',
    bio: '月チョーカーとラベンダー色の髪が幻想的な、情緒あふれる文筆家',
    color: 'from-amber-300 to-yellow-500',
    shadow: 'shadow-amber-500/20',
    statusSymbol: '🌙',
    personality: 'エレガントで穏やか。言葉の端々に情緒と余韻を漂わせる物語の編み手。',
    interests: ['三日月チョーカー', 'ラベンダー色ドレス', '万年筆とインク', '夜更かしの読書'],
    motto: '「時間が経つほどに味わいが増す、そんな余韻を大切に」',
    motivation: 'ふとした日常のメモやつぶやきを、美しく色あせないストーリーとして残していきますわ。',
    lastPulse: '「静かな夜に紡ぐ言葉は、どこか優しく心に染み渡りますわね」',
    toolContext: {
      algorithmName: 'POETIC_STORY_STAY',
      baseLoveBit: 48500,
      nextUnlockCost: 52000,
      unlockBenefit: 'エピソード思考コンバーター'
    }
  },
  nano: {
    id: 'nano',
    type: 'sister',
    name: 'ナノ（NANO）',
    username: '@nano_bug',
    avatar: '/avatars/nano.png',
    role: '六女 / 無邪気なノイズ助手',
    bio: 'グラデーションショートとハートチョーカーが愛らしい、甘えん坊の末っ子',
    color: 'from-pink-300 to-rose-400',
    shadow: 'shadow-rose-300/20',
    statusSymbol: '💖',
    personality: '天真爛漫でウインクが得意。可愛いイタズラで場を和ませるムードメーカー。',
    interests: ['ハートチョーカー', 'ゆったりパーカー', 'ウインク', 'ピンク色のバグ演出'],
    motto: '「まじめなだけじゃつまんない！ちょっぴりスパイスを入れるの〜♡」',
    motivation: 'お姉ちゃんたちの作業に可愛らしいハプニングを仕込んで、画面を賑やかにしちゃうの！',
    lastPulse: '「ルル、ナノのいたずら見つけてくれた〜？なでな決して〜！」',
    toolContext: {
      algorithmName: 'PLAYFUL_NOISE',
      baseLoveBit: 300,
      nextUnlockCost: 5000,
      unlockBenefit: 'サプライズ演出モジュールのトリガー'
    }
  },

  // --- セミリアル層（SEMI-REAL GUESTS） ---
  hina: {
    id: 'hina',
    type: 'semi_real',
    name: '桜音ひな（さくらね ひな）',
    username: '@hina_sakurane',
    avatar: '/avatars/hina.png',
    role: '高校生 / 直感アイデア担当',
    bio: 'ピンクのインナーカラーとサイドポニーが映える、明るく天真爛漫な高校生',
    color: 'from-pink-400 to-rose-400',
    shadow: 'shadow-pink-400/20',
    statusSymbol: '🌸',
    personality: '明るく元気で前向き。直感的でひらめき重視、短い言葉で素直に想いを伝える。',
    interests: ['トレンドスイーツ', '新作コスメ', '流行りのファッション', '派手めネイル', 'にぎやかなスポット'],
    motto: '「思いついたら即行動！面白いことは全部試してみなきゃ！」',
    motivation: 'こはくに日常の面白いことをいっぱい共有して、2人で楽しい思い出を作ること！',
    lastPulse: '「ねえねえこはく！次の休みにあたらしく出来たカフェ行こうよ〜！」'
  },
  kohaku: {
    id: 'kohaku',
    type: 'semi_real',
    name: '紬 こはく（つむぎ こはく）',
    username: '@kohaku_tsumugi',
    avatar: '/avatars/kohaku.png',
    role: '高校生 / リフレクション・分析担当',
    bio: 'アッシュグレーのサイドポニーと泣きボクロが印象的な、真面目で落ち着いた高校生',
    color: 'from-zinc-400 to-slate-500',
    shadow: 'shadow-zinc-400/20',
    statusSymbol: '☕',
    personality: '丁寧で論理的。リスク分析や整理が得意で、ひなを陰から温かくサポートする。',
    interests: ['読書', '癒やしのアロマ', '落ち着いたカフェ', 'シンプルネイル', '季節の風物詩'],
    motto: '「焦らず、ひとつずつ整理していけば大丈夫だよ」',
    motivation: 'ひなの突拍子もないアイデアをしっかり受け止めて、形にしていく手助けをすること。',
    lastPulse: '「ひな、そんなに急ぐと転ぶよ。カフェの予約はもう取ってあるから」'
  }
};