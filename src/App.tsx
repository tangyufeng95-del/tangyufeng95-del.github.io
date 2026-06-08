import React, { useState, useEffect } from 'react';
import { Game, Activity } from './types';
import { INITIAL_GAMES, INITIAL_ACTIVITIES } from './data/mockData';
import MyLibrary from './components/MyLibrary';
import Explore from './components/Explore';
import Activities from './components/Activities';
import Settings from './components/Settings';
import AddGameModal from './components/AddGameModal';
import GameDetails from './components/GameDetails';
import { 
  Mail, Bell, Shield, Play, Layout, Compass, Users, 
  Settings as SettingsIcon, AlertCircle, LogIn, LogOut, Loader2, Lock 
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { 
  collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { createRawEmail, sendGmailMessage } from './lib/gmail';

export default function App() {
  const { user, profile, loading, signIn, logOut, accessToken, linkGmail } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'explore' | 'activities' | 'settings'>('library');
  
  // Real-time Firestore database state management
  const [games, setGames] = useState<Game[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // 大門面/專屬啟動頁 (Dedicated Launcher Page)
  const [viewingGame, setViewingGame] = useState<Game | null>(null);

  // 選中游戲 (用於右欄 Insights)
  const [selectedGameId, setSelectedGameId] = useState<string>('hollow_knight');

  // 新增游戲 Modal 控制
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 介面即時客製化客製參數 (可從 Settings 面板自由拉動，首頁秒生效！)
  const [cardScale, setCardScale] = useState<number>(2); // 1-4 (小 到 極大)
  const [blurStrength, setBlurStrength] = useState<number>(6); // 0-10 (高斯模糊強度)

  // 快捷訊息與 Toast 狀態
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // 初始化載入排版設定
  useEffect(() => {
    const savedScale = localStorage.getItem('legendary_hub_card_scale');
    const savedBlur = localStorage.getItem('legendary_hub_blur_strength');

    if (savedScale) setCardScale(parseInt(savedScale));
    if (savedBlur) setBlurStrength(parseInt(savedBlur));
  }, []);

  // 雲端即時載入使用者資料
  useEffect(() => {
    if (!profile || profile.role === 'blocked') return;

    // 第一次部署自動填充數據
    const autoSeedFirebase = async () => {
      try {
        const gamesSnap = await getDocs(collection(db, 'games'));
        if (gamesSnap.empty && (profile.role === 'admin' || profile.role === 'member')) {
          setBannerNotice('⚡ 正在為您在線初始化預設獨立遊戲圖庫...');
          for (const g of INITIAL_GAMES) {
            await setDoc(doc(db, 'games', g.id), {
              ...g,
              ownerUid: profile.uid
            });
          }
        }
        const actSnap = await getDocs(collection(db, 'activities'));
        if (actSnap.empty && (profile.role === 'admin' || profile.role === 'member')) {
          for (const act of INITIAL_ACTIVITIES) {
            await setDoc(doc(db, 'activities', act.id), {
              ...act,
              likedBy: []
            });
          }
        }
      } catch (err) {
        console.error('Database pre-loading failed:', err);
      }
    };
    autoSeedFirebase();

    // 註冊即時監聽 collections
    const unsubscribeGames = onSnapshot(collection(db, 'games'), (snapshot) => {
      const liveGames: Game[] = [];
      snapshot.forEach((docSnap) => {
        liveGames.push(docSnap.data() as Game);
      });
      setGames(liveGames);
    }, (error) => {
      console.error('Games live list sync failed:', error);
    });

    const unsubscribeActivities = onSnapshot(collection(db, 'activities'), (snapshot) => {
      const liveActs: Activity[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        liveActs.push({
          ...data,
          // 轉換 client endpoint 點讚狀態
          likedByMe: profile ? (data.likedBy || []).includes(profile.uid) : false
        } as Activity);
      });
      // 依 ID（時間戳）反序排序
      liveActs.sort((a, b) => b.id.localeCompare(a.id));
      setActivities(liveActs);
    }, (error) => {
      console.error('Activities live list sync failed:', error);
    });

    // 提示通知：若為賓客
    if (profile.role === 'guest') {
      setBannerNotice('🔒 提示：您目前為【賓客/待審核】權限，僅供安全瀏覽。無法寫入或發表動態，請聯繫管理員升級為成員！');
    } else if (profile.role === 'admin') {
      setBannerNotice('👑 您目前是以最高管理員 (Administrator) 身分存取，具有分配權限與最高寫入權限！');
    } else {
      setBannerNotice('⭐ 您目前已升級為認證成員 (Member)！可自由新增遊戲、評價與發表動態動態牆。');
    }

    return () => {
      unsubscribeGames();
      unsubscribeActivities();
    };
  }, [profile]);

  // 一鍵套用社群封面封面的回呼
  const handleApplyPresetCover = async (gameId: string, coverUrl: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'member')) {
      setBannerNotice('🔒 賓客權限不支援此操作，請聯繫管理員升級角色！');
      return;
    }
    try {
      await updateDoc(doc(db, 'games', gameId), { coverUrl });
      
      // 如果當前正在瀏覽的遊戲就是此款，也需要更新
      if (viewingGame && viewingGame.id === gameId) {
        setViewingGame({ ...viewingGame, coverUrl });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `games/${gameId}`);
    }
  };

  // 從設定模擬掃描資料夾添加本地遊戲
  const handleAddMockLocalGame = async (name: string, file: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'member')) {
      setBannerNotice('🔒 賓客權限：不支援匯入本地遊戲。請聯繫管理員升級角色！');
      return;
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (games.some(g => g.id === id)) return;

    const newLocal: Game = {
      id,
      name,
      coverUrl: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=500&auto=format&fit=crop&q=60',
      category: 'Local Sandbox',
      playtime: 0,
      lastPlayed: '未遊玩',
      review: '自動辨識成功。此遊戲為手動掃描本地路徑並整合。隨時點擊一鍵啟動！',
      rating: 8,
      snippets: [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
      ],
      launchUrl: file,
      isLocal: true,
      tags: ['本地偵測', '自動導入'],
      status: 'Backlog',
      ownerUid: profile.uid
    };

    try {
      await setDoc(doc(db, 'games', id), newLocal);
      setSelectedGameId(id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `games/${id}`);
    }
  };

  // 手動加入新遊戲 (Modal 表單)
  const handleAddNewGame = async (newGameData: Omit<Game, 'id'>) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'member')) {
      setBannerNotice('🔒 賓客權限：目前不支援手動新增新遊戲，可請管理員指派權限。');
      return;
    }
    const id = 'custom_' + Date.now();
    const newGame: Game = {
      ...newGameData,
      id,
      ownerUid: profile.uid
    };
    
    try {
      await setDoc(doc(db, 'games', id), newGame);
      setSelectedGameId(id);
      setViewingGame(newGame);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `games/${id}`);
    }
  };

  // 更新單一遊戲的客製與評價
  const handleUpdateGame = async (updated: Game) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'member')) {
      setBannerNotice('🔒 賓客權限：您帳號權限不足，目前所有心得與修改均不予寫入。');
      return;
    }
    try {
      await setDoc(doc(db, 'games', updated.id), updated);
      if (viewingGame && viewingGame.id === updated.id) {
        setViewingGame(updated);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `games/${updated.id}`);
    }
  };

  // 刪除游戲
  const handleDeleteGame = async (id: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'member')) {
      setBannerNotice('🔒 賓客權限：無法刪除任何雲端遊戲資源。');
      return;
    }
    try {
      await deleteDoc(doc(db, 'games', id));
      setViewingGame(null);
      const nextGames = games.filter(g => g.id !== id);
      if (selectedGameId === id && nextGames.length > 0) {
        setSelectedGameId(nextGames[0].id);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `games/${id}`);
    }
  };

  // 快速遊玩 (+0.1小時 & 更新日期)
  const handlePlayGame = async (gameId: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'member')) {
      setBannerNotice('🔒 賓客權限：無法參與一鍵啟動玩遊戲！');
      return;
    }
    const today = new Date().toLocaleDateString('zh-TW');
    const gameObj = games.find(g => g.id === gameId);
    if (!gameObj) return;

    const newPlaytime = parseFloat((gameObj.playtime + 0.1).toFixed(1));
    const updated = {
      ...gameObj,
      playtime: newPlaytime,
      lastPlayed: today
    };

    try {
      await setDoc(doc(db, 'games', gameId), updated);

      // 模擬在好友動態牆更新
      const newAct: Activity = {
        id: 'act_' + Date.now(),
        user: {
          name: profile.displayName,
          avatar: profile.photoURL,
          studentId: profile.email === 'tangyufeng95@gmail.com' ? '112707004' : undefined
        },
        gameName: gameObj.name,
        action: '剛啟動了遊戲',
        content: `進入了冒險的世界！目前我的客製累積時數已成長到 ${newPlaytime} 小時囉。這款獨立作品真心推薦！ 🎮`,
        likes: 0,
        likedBy: [],
        timestamp: '剛剛',
        comments: []
      };
      
      await setDoc(doc(db, 'activities', newAct.id), newAct);
      setBannerNotice(`⚙️ 【Legendary Launcher】成功執行一鍵對接啟動。時數累積已自動同步儲存至雲端 Firestore！`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `games/${gameId}`);
    }
  };

  // 活動點讚
  const handleLikeActivity = async (actId: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'member')) {
      setBannerNotice('🔒 賓客權限：點讚將不寫入資料庫，請連繫管理員升級權限！');
      return;
    }
    const act = activities.find(a => a.id === actId);
    if (!act) return;

    const likedByList = act.likedBy || [];
    const hasLiked = likedByList.includes(profile.uid);
    const nextLikedBy = hasLiked 
      ? likedByList.filter(uid => uid !== profile.uid)
      : [...likedByList, profile.uid];

    try {
      await updateDoc(doc(db, 'activities', actId), {
        likedBy: nextLikedBy,
        likes: nextLikedBy.length
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `activities/${actId}`);
    }
  };

  // 活動增加留言
  const handleAddComment = async (actId: string, commentText: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'member')) {
      setBannerNotice('🔒 賓客權限：目前不支援在好友活動進行回覆留念。');
      return;
    }
    const act = activities.find(a => a.id === actId);
    if (!act) return;

    const newComment = {
      id: 'c_' + Date.now(),
      userName: profile.displayName,
      avatar: profile.photoURL,
      text: commentText,
      timestamp: '剛剛'
    };

    try {
      await updateDoc(doc(db, 'activities', actId), {
        comments: [...(act.comments || []), newComment]
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `activities/${actId}`);
    }
  };

  // 發送新動態
  const handlePostActivity = async (content: string, imageUrl: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'member')) {
      setBannerNotice('🔒 賓客權限：無法在好友動態牆發表文章，請聯繫管理員。');
      return;
    }
    const newAct: Activity = {
      id: 'post_' + Date.now(),
      user: {
        name: profile.displayName,
        avatar: profile.photoURL,
        studentId: profile.email === 'tangyufeng95@gmail.com' ? '112707004' : undefined
      },
      gameName: games.length > 0 ? games[0].name : '獨立經典',
      action: imageUrl ? '上傳了精美截圖與動態' : '發布了推坑感想',
      content,
      images: imageUrl ? [imageUrl] : [],
      likes: 0,
      likedBy: [],
      timestamp: '剛剛',
      comments: []
    };
    try {
      // 1. Save post to Firestore
      await setDoc(doc(db, 'activities', newAct.id), newAct);
      setBannerNotice('🎉 貼文發布成功！正在透過 Gmail 服務發信推送給已訂閱好消息之閣員，請稍候...');

      // 2. Dispatch Gmail message if user has linking token
      if (accessToken) {
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          const recipients: string[] = [];
          
          usersSnap.forEach((docSnap) => {
            const userData = docSnap.data();
            if (userData.email && userData.gmailNotificationsEnabled !== false) {
              recipients.push(userData.email);
            }
          });

          // Always guarantee the recipient email 'tangyufeng95@gmail.com' gets added as per prompt instructions
          if (!recipients.includes('tangyufeng95@gmail.com')) {
            const tangyRef = usersSnap.docs.find(d => d.data().email === 'tangyufeng95@gmail.com');
            if (!tangyRef || tangyRef.data().gmailNotificationsEnabled !== false) {
              recipients.push('tangyufeng95@gmail.com');
            }
          }

          if (recipients.length > 0) {
            const subject = `【Legendary HUB 好友推送】${profile.displayName} 發表了全新遊戲世界動態！`;
            const promoAction = imageUrl ? '上傳了精美截圖與動態' : '發布了推坑感想';
            const emailHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b1329; color: #f1f5f9; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
  <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 24px; text-align: center;">
    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">Legendary's Hub</h1>
    <p style="margin: 4px 0 0; color: #e0e7ff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">好友新動態推送提醒 (FRIEND ACTIVITY PUSH)</p>
  </div>
  <div style="padding: 24px;">
    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px;">
      <tr>
        <td style="width: 48px; vertical-align: middle; padding-right: 12px;">
          <img src="${profile.photoURL}" alt="avatar" style="width: 48px; height: 48px; border-radius: 24px; object-fit: cover; border: 2px solid #6366f1;" />
        </td>
        <td style="vertical-align: middle;">
          <h3 style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 700;">${profile.displayName}</h3>
          <p style="margin: 2px 0 0; color: #94a3b8; font-size: 12px;">${promoAction} · 剛更新的冒險動態</p>
        </td>
      </tr>
    </table>
    
    <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <p style="margin: 0; color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${content}</p>
      ${imageUrl ? `<div style="margin-top: 12px; text-align: center;"><img src="${imageUrl}" alt="post image" style="max-width: 100%; max-height: 350px; object-fit: cover; border-radius: 8px; border: 1px solid #334155;" /></div>` : ''}
    </div>

    <div style="text-align: center; margin: 28px 0 12px;">
      <a href="https://ais-pre-ds42ju5ftnrzrfwjh7xoac-521555877481.asia-northeast1.run.app" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);" target="_blank">前往 Legendary's Hub 查看與留言互動</a>
    </div>
  </div>
  <div style="background-color: #020617; padding: 20px; text-align: center; border-top: 1px solid #1e293b;">
    <p style="margin: 0; color: #64748b; font-size: 11px; line-height: 1.5;">本郵件是由系統依您的通知設定自動寄發。如果您不想再收到此推播，可隨時前往 <strong>Legendary's Hub -> 整合設定 -> 隱私與社交設定</strong> 關閉「Gmail 好友貼文推送通知」設定。</p>
    <p style="margin: 6px 0 0; color: #475569; font-size: 10px;">Legendary's Hub © 2026 · Built with Google Workspace API</p>
  </div>
</div>
`;
            
            let successCount = 0;
            const uniqueRecipients = Array.from(new Set(recipients));
            
            await Promise.all(uniqueRecipients.map(async (email) => {
              try {
                const rawEmail = createRawEmail(email, subject, emailHtml);
                await sendGmailMessage(accessToken, rawEmail);
                successCount++;
              } catch (err) {
                console.error(`Failed to send email to ${email}:`, err);
              }
            }));

            setBannerNotice(`🎉 動態發布成功！已自動透過 Gmail 順利通知 ${successCount} 位已啟用推送提醒的好友（發送名單: ${uniqueRecipients.join(', ')}）！`);
          } else {
            setBannerNotice('🎉 動態發布成功！（當前無任何好友啟用 Gmail 接收推送設定）');
          }
        } catch (gmailErr: any) {
          console.error('Failed to dispatch updates via Gmail API:', gmailErr);
          setBannerNotice(`🔔 動態已發布，但 Gmail 推送遭遇未預期問題：${gmailErr.message || gmailErr}`);
        }
      } else {
        setBannerNotice('🎉 動態發布成功！⚠️ 提示：您目前尚未連結/授權 Gmail 送信，本次動態未以信件推送。請點動態牆「啟用 Gmail 授權」按鈕。');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `activities/${newAct.id}`);
    }
  };

  // Custom visual rendering setups
  const getBlurStyle = () => {
    return {
      backdropFilter: `blur(${blurStrength * 2.2}px)`,
      backgroundColor: `rgba(15, 23, 42, ${0.45 + blurStrength * 0.03})`
    };
  };

  // UI SECTION 1: Standard loading spinner integration
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center gap-4 relative">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
        <div className="text-center font-sans">
          <h2 className="text-sm font-bold tracking-widest text-slate-300 uppercase">Legendary's Hub</h2>
          <p className="text-xs text-slate-500 mt-1.5 font-mono">載入遠程安全認證與雲端儲存空間中...</p>
        </div>
      </div>
    );
  }

  // UI SECTION 2: Splendid authorization portal
  if (!user || !profile) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-md w-full bg-slate-900/60 border border-slate-800/85 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative z-10 font-sans text-center">
          <div className="flex justify-center mb-5">
            <div className="p-3.5 bg-indigo-600/15 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <Shield size={32} className="animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-100 bg-clip-text text-transparent">
            Legendary HUB Auth
          </h1>
          <p className="text-[11px] text-indigo-400 uppercase tracking-widest font-bold mt-1">
            牧傳奇的客製化獨立遊戲中心
          </p>

          <p className="text-xs text-slate-400 leading-relaxed mt-4">
            本系統現已全面對接 Firebase 極速雲端資料庫。請使用 Google 認證帳號登入，即可實現多端即時同步、自訂封面卡片、遊玩累時與好友極速按讚互動！
          </p>

          <div className="my-6 border-t border-b border-slate-800/60 py-4.5 text-[11px] text-slate-500 text-left space-y-2.5 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold flex-shrink-0">🔒 權限政策</span>
              <span>
                系統預設 <strong>tangyufeng95@gmail.com</strong> 為最高管理人員，其餘登入帳號會被設置為賓客 (Guest / 待核准)，並由管理人員在此指派成員 (Member) 權限。
              </span>
            </div>
          </div>

          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-550 hover:from-indigo-500 hover:to-indigo-450 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-indigo-500/15 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 transition-all outline-none"
          >
            <LogIn size={18} />
            使用 Google 帳號安全登入
          </button>
        </div>
      </div>
    );
  }

  // UI SECTION 3: Account blocked restriction layout
  if (profile.role === 'blocked') {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-md w-full bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10 text-center font-sans">
          <div className="flex justify-center mb-5">
            <div className="p-3.5 bg-rose-600/15 border border-rose-500/30 rounded-2xl text-rose-400 animate-pulse">
              <Lock size={32} />
            </div>
          </div>
          
          <h1 className="text-xl font-bold text-rose-400">您的帳號已被系統封鎖</h1>
          <p className="text-xs text-slate-400 leading-relaxed mt-4">
            由於系統偵測到未授權操作或不當的使用權限，您當前的帳號（<strong>{profile.email}</strong>）存取已被暫停。
          </p>
          
          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            若這是不合理的決定，請聯繫最高管理者 (<strong>tangyufeng95@gmail.com</strong>) 審查與恢復您的身分。
          </p>

          <button
            onClick={logOut}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold text-xs py-3 rounded-xl border border-slate-750 cursor-pointer transition-all outline-none"
          >
            <LogOut size={14} />
            登出此帳號
          </button>
        </div>
      </div>
    );
  }

  const currentSelectedGame = games.find(g => g.id === selectedGameId) || null;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none selection:bg-indigo-505 selection:text-white">
      
      {/* 全幅精美絢麗背景光效 */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* 頂部導航欄 (Header) */}
      <header 
        style={getBlurStyle()}
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 border-b border-slate-800/60 transition-all font-sans"
      >
        {/* 左側標誌: Legendary's Hub */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setViewingGame(null); setActiveTab('library'); }}>
          <div className="p-2 bg-indigo-600/15 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Shield size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-wider bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-100 bg-clip-text text-transparent uppercase">
                Legendary's Hub
              </span>
              <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-indigo-500/20">
                CLOUD SYNC
              </span>
            </div>
            <p className="text-[10px] text-slate-400">牧傳奇的客製遊戲系統</p>
          </div>
        </div>

        {/* 中間主要 Tab 選項群 */}
        {viewingGame === null && (
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-950/40 p-1 border border-slate-800/80 rounded-2xl">
            {[
              { id: 'library', label: '我的圖庫', icon: Layout },
              { id: 'explore', label: '探索靈感', icon: Compass },
              { id: 'activities', label: '好友活動', icon: Users },
              { id: 'settings', label: '整合設定', icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all outline-none ${
                    isActive
                      ? 'bg-slate-900 border border-slate-800 text-slate-100 shadow-md ring-1 ring-indigo-500/15'
                      : 'border border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-indigo-400' : ''} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* 右側：學號、姓名、角色、以及登出 */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
            <button 
              onClick={logOut}
              title="登出系統"
              className="p-2 hover:bg-slate-900 rounded-lg transition-all hover:text-slate-300 flex items-center gap-1 text-xs"
            >
              <LogOut size={14} />
              <span>安全登出</span>
            </button>
          </div>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block"></div>

          {/* 牧傳奇與本機頭像資訊 */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xs font-extrabold text-slate-200">{profile.displayName}</span>
                {profile.role === 'admin' && (
                  <span className="bg-rose-500/15 text-rose-400 text-[9px] font-sans px-1.5 py-0.5 rounded border border-rose-500/20 font-bold">
                    最高管理
                  </span>
                )}
                {profile.role === 'member' && (
                  <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-sans px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                    認證閣員
                  </span>
                )}
                {profile.role === 'guest' && (
                  <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-sans px-1.5 py-0.5 rounded border border-indigo-500/20">
                    普通賓客
                  </span>
                )}
              </div>
              <p className="text-[9px] text-slate-500 font-mono tracking-tight">{profile.email}</p>
            </div>
            
            <img
              src={profile.photoURL}
              alt="頭像"
              className="w-8 h-8 rounded-full object-cover border border-slate-800 ring-2 ring-indigo-500/30"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* 大提示 Banner 欄 */}
      {bannerNotice && (
        <div className="bg-indigo-950/30 border-b border-indigo-900/30 px-6 py-2 flex items-center justify-between text-[11px] text-indigo-300 transition-all font-sans">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-indigo-400 flex-shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button 
            onClick={() => setBannerNotice(null)} 
            className="text-indigo-400 hover:text-slate-200 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* 主面板區域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 如果正在瀏覽「專屬門面啟動頁」 */}
        {viewingGame !== null ? (
          <GameDetails
            game={viewingGame}
            onBack={() => setViewingGame(null)}
            onUpdateGame={handleUpdateGame}
            onDeleteGame={handleDeleteGame}
          />
        ) : (
          /* 根據 Active Tab 進行條件渲染 */
          <>
            {activeTab === 'library' && (
              <MyLibrary
                games={games}
                selectedGame={currentSelectedGame}
                onSelectGame={(g) => setSelectedGameId(g.id)}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onPlayGame={handlePlayGame}
                onViewDedicatedPage={(g) => setViewingGame(g)}
                onTriggerQuickEdit={(g) => setViewingGame(g)}
                cardScale={cardScale}
                onAddGame={handleAddNewGame}
                onUpdateGame={handleUpdateGame}
                profile={profile}
              />
            )}

            {activeTab === 'explore' && (
              <Explore onApplyPresetCover={handleApplyPresetCover} />
            )}

            {activeTab === 'activities' && (
               <Activities
                activities={activities}
                onAddComment={handleAddComment}
                onLikeActivity={handleLikeActivity}
                onPostActivity={handlePostActivity}
                userGamesCount={games.length}
                accessToken={accessToken}
                onLinkGmail={linkGmail}
              />
            )}

            {activeTab === 'settings' && (
              <Settings
                cardScale={cardScale}
                onCardScaleChange={(scale) => {
                  setCardScale(scale);
                  localStorage.setItem('legendary_hub_card_scale', scale.toString());
                }}
                blurStrength={blurStrength}
                onBlurStrengthChange={(strength) => {
                  setBlurStrength(strength);
                  localStorage.setItem('legendary_hub_blur_strength', strength.toString());
                }}
                onAddMockLocalGame={handleAddMockLocalGame}
                currentUserRole={profile.role}
                profile={profile}
              />
            )}
          </>
        )}
      </div>

      {/* 新增遊戲 Modal 彈窗 */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNewGame}
      />

    </div>
  );
}
