import { Game, Activity, ExplorePreset } from '../types';

export const INITIAL_GAMES: Game[] = [
  {
    id: 'hollow_knight',
    name: 'Hollow Knight (空洞騎士)',
    coverUrl: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // 替代精美圖或手繪風
    category: 'Indie Games',
    playtime: 188.4,
    lastPlayed: '2024/05/18',
    review: '非常具有挑戰性的類銀河戰士惡魔城遊戲！世界觀深邃，美術與音樂極佳。boss戰令人難忘。期待絲之歌 (Silksong)！',
    rating: 9,
    snippets: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80'
    ],
    launchUrl: 'steam://rungameid/367520',
    isLocal: false,
    tags: ['類Metroidvania', '高難度', '神作', '魂系氛圍'],
    status: 'Played'
  },
  {
    id: 'celeste',
    name: 'Celeste (蔚藍)',
    coverUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=500&auto=format&fit=crop&q=60',
    category: 'Indie Games',
    playtime: 42.1,
    lastPlayed: '2024/04/10',
    review: '手感流暢到不可思議的平台跳躍遊戲，音樂更是神級。講述克服內心焦慮的故事，讓人邊玩邊感動，不小心死上千次也是心甘情願。',
    rating: 10,
    snippets: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80'
    ],
    launchUrl: 'steam://rungameid/504230',
    isLocal: false,
    tags: ['平台跳躍', '像素風', '劇情神作', '神級原聲帶'],
    status: 'Played'
  },
  {
    id: 'hades',
    name: 'Hades (黑帝斯)',
    coverUrl: 'https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=500&auto=format&fit=crop&q=60',
    category: 'Indie Games',
    playtime: 75.8,
    lastPlayed: '2024/05/11',
    review: '動作爽快、流暢，Rougelite 與希臘神話歷史劇情的完美結合。每一次逃離地獄都是一次全新的體驗。美術風格極具張力，吹爆！',
    rating: 9,
    snippets: [
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&auto=format&fit=crop&q=80'
    ],
    launchUrl: 'steam://rungameid/1145360',
    isLocal: false,
    tags: ['Rogue-like', '極度爽快', '神話改編', '精美立繪'],
    status: 'Played'
  },
  {
    id: 'shovel_knight',
    name: 'Shovel Knight (鏟子騎士)',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60',
    category: 'Indie Games',
    playtime: 24.5,
    lastPlayed: '2023/12/25',
    review: '懷舊的八位元風格與現代關卡設計的最佳示範。不只是致敬經典，更超越了經典。鏟子開路！',
    rating: 8,
    snippets: [
      'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
    ],
    launchUrl: 'steam://rungameid/250760',
    isLocal: false,
    tags: ['2D平台', '像素藝術', '復古風', '動作經典'],
    status: 'Played'
  },
  {
    id: 'gris',
    name: 'Gris',
    coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=60',
    category: 'Indie Games',
    playtime: 8.2,
    lastPlayed: '2024/02/15',
    review: '這不是遊戲，這是一幅會動的絕美水彩畫。藉由色彩解鎖來象徵悲傷的心路歷程，治癒感拉滿，非常安靜而意境深遠。',
    rating: 9,
    snippets: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    ],
    launchUrl: 'steam://rungameid/683320',
    isLocal: false,
    tags: ['藝術風格', '視覺流', '解謎', '治癒感動'],
    status: 'Played'
  },
  {
    id: 'stardew_valley',
    name: 'Stardew Valley (星露谷物語)',
    coverUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&auto=format&fit=crop&q=60',
    category: 'Indie Games',
    playtime: 320.0,
    lastPlayed: '2024/05/20',
    review: '「等你在現實生活中累了，就打開這封信...」這款遊戲拯救了無數社畜的靈魂。種田、釣魚、挖礦、與村民社交，能讓人玩到廢寢忘食。單人開發的神話！',
    rating: 10,
    snippets: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=600&auto=format&fit=crop&q=80'
    ],
    launchUrl: 'steam://rungameid/413150',
    isLocal: false,
    tags: ['模擬經營', '種田防禿', '神作', '支持多人'],
    status: 'Played'
  },
  {
    id: 'ori_blind_forest',
    name: 'Ori and the Blind Forest (奧里與迷失森林)',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
    category: 'Indie Games',
    playtime: 18.5,
    lastPlayed: '2024/03/02',
    review: '極具手部肌肉挑戰性的橫向動作解謎，但其畫面與如交響樂般的 BGM 的渲染度會讓你就算狂死也無法自拔。開場劇情就直接讓人眼框泛淚。',
    rating: 9,
    snippets: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80'
    ],
    launchUrl: 'steam://rungameid/261570',
    isLocal: false,
    tags: ['高難度', 'Metroidvania', '精美音畫', '治癒冒險'],
    status: 'Played'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act1',
    user: {
      name: '阿牧 (牧傳奇)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
      studentId: '112707004'
    },
    gameName: '霧鎖王國 (Enshrouded)',
    action: '剛更新了評價',
    content: '今天跟遠程武器的頭目打得超痛苦，建議帶足補給，不推薦一個人硬幹，有沒有人要一鍵共玩？大奶法師需要前排坦！ ⚔️',
    images: [
      'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=500&auto=format&fit=crop&q=60'
    ],
    likes: 12,
    likedByMe: false,
    timestamp: '1小時前',
    comments: [
      {
        id: 'c1',
        userName: '亮亮',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        text: '靠北，我昨天才被那個丟炸藥的王炸飛好幾次，晚上有空一起開圖啊！',
        timestamp: '45分鐘前'
      },
      {
        id: 'c2',
        userName: '神隱阿翔',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
        text: '我的雙手劍戰士已經準備好了，今晚八點語音碰面！',
        timestamp: '30分鐘前'
      }
    ]
  },
  {
    id: 'act2',
    user: {
      name: '小瑜 (做評測的創作者)',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    gameName: 'Hollow Knight (空洞騎士)',
    action: '分享了自訂大封面與超長精選評測',
    content: '耗時兩週終於把神居五門突破了！空洞騎士絕對是近十年來獨立遊戲界最耀眼的鑽石。為了這款神作，我手繪了十幾款長卡片封面，喜歡的人可以在【探索】社群牆一鍵套用！',
    likes: 45,
    likedByMe: true,
    timestamp: '4小時前',
    comments: [
      {
        id: 'c3',
        userName: '阿牧 (牧傳奇)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
        text: '神居五門太神了吧... 我打完三門就被虐到退坑了orz，超愛你畫的封面，已套用到我的圖庫！',
        timestamp: '3小時前'
      }
    ]
  }
];

export const EXPLORE_PRESETS: ExplorePreset[] = [
  {
    id: 'epub1',
    title: '【手繪霓虹風】空洞騎士高畫質客製化封面',
    gameName: 'Hollow Knight',
    author: '小瑜 (做評測的創作者)',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=550&auto=format&fit=crop&q=80',
    description: '專為橫向螢幕或長卡片設計的霓虹水彩風格空洞騎士封面，帶有淡淡的星空點綴。',
    likes: 128,
    tags: ['手繪風', '空洞騎士', '大卡片預設']
  },
  {
    id: 'epub2',
    title: '【極簡像素風】星露谷四季變幻動態封面',
    gameName: 'Stardew Valley',
    author: '種田達人阿明',
    coverUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=550&auto=format&fit=crop&q=80',
    description: '春櫻、夏雨、秋楓、冬雪，這套極簡封面能讓你的遊戲圖庫主畫面完美呼應四季變化。',
    likes: 95,
    tags: ['動態封面', '星露谷', '極簡風']
  },
  {
    id: 'epub3',
    title: '【暗黑神話】黑帝斯扎格列歐斯地獄繪卷',
    gameName: 'Hades',
    author: '神話收集家',
    coverUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=550&auto=format&fit=crop&q=80',
    description: '厚塗風的扎格列歐斯立體大封面，紅黑潑墨背景，擺在整合系統首頁質感拉滿！',
    likes: 154,
    tags: ['厚塗風', 'Hades', '暗黑酷炫']
  }
];

export const INSPIRATIONS = [
  {
    id: 'insp1',
    title: '如何撰寫高質感的獨立遊戲評測？',
    category: '評測範本',
    content: '1. 引入（點出遊戲最獨特的一個亮點：如畫風、一項絕無僅有的機制）\n2. 遊戲核心循環（玩什麼？怎麼爽？）\n3. 情感共鳴（美術與音樂如何加分？故事是否感人？）\n4. 缺點與痛點（難度過高？引導不佳？）\n5. 總結評分（給予明確的客製化標籤）',
    author: '評測家小瑜'
  },
  {
    id: 'insp2',
    title: '用三行文字擊中玩家：精簡推坑評測模板',
    category: '極簡短評',
    content: '【一句話核心體驗】+【推薦給什麼樣的玩家】+【一句避坑警告】。\n例如：「這是近年來手感最棒的平台跳躍神作。如果你喜歡《精靈與森林》卻又怕狂死，這款遊戲的難度曲線極佳，死再多次都讓人想繼續。警告：玩到手筋發炎是正常的。」',
    author: '阿牧 (牧傳奇)'
  }
];
