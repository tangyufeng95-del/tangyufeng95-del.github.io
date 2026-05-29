export interface Game {
  id: string;
  name: string;
  coverUrl: string; // 大卡片封面
  category: string; // 比如 "Indie Games"
  playtime: number; // 遊玩時間 (小時)
  lastPlayed: string; // 上次遊玩日期
  review: string; // 心得與評價
  rating: number; // 星等評分 (1-10)
  snippets: string[]; // 3張代表實機畫面
  launchUrl: string; // 啟動連結
  isLocal: boolean; // 是否為本地遊戲
  tags: string[]; // 標籤
  status: 'Played' | 'Backlog' | 'Playing'; // 狀態
  ownerUid?: string; // 建立者的 Uid
}

export interface Activity {
  id: string;
  user: {
    name: string;
    avatar: string;
    studentId?: string;
  };
  gameName: string;
  action: string; // e.g., "剛更新了評價", "剛啟動了遊戲"
  content?: string;
  images?: string[];
  likes: number;
  likedByMe?: boolean;
  comments: Comment[];
  timestamp: string;
  likedBy?: string[];
}

export interface Comment {
  id: string;
  userName: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface ExplorePreset {
  id: string;
  title: string;
  gameName: string;
  author: string;
  coverUrl: string;
  description: string;
  likes: number;
  tags: string[];
}

export interface ReviewPreset {
  id: string;
  name: string;
  fields: { label: string; type: 'stars' | 'text' | 'number' }[];
}
