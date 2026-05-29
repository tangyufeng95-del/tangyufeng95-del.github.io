import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sliders, Shield, Award, FolderOpen, RefreshCcw, Check, Sparkles, AlertCircle, Users as UsersIcon } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../context/AuthContext';

interface SettingsProps {
  cardScale: number; // 1 to 4 (小, 中, 大, 極大)
  onCardScaleChange: (scale: number) => void;
  blurStrength: number; // 0 (無) 到 10 (強)
  onBlurStrengthChange: (strength: number) => void;
  onAddMockLocalGame: (name: string, file: string) => void;
  currentUserRole?: string;
  profile?: UserProfile | null;
}

export default function Settings({
  cardScale,
  onCardScaleChange,
  blurStrength,
  onBlurStrengthChange,
  onAddMockLocalGame,
  currentUserRole,
  profile
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'ui' | 'review' | 'privacy' | 'backup' | 'users'>('import');

  // 人員與權限狀態 (當登入者為管理員時)
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (currentUserRole !== 'admin') return;
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      // 排序: admin 最前，接著 member, guest, blocked
      const roleOrder = { admin: 0, member: 1, guest: 2, blocked: 3 };
      list.sort((a, b) => {
        const orderA = roleOrder[a.role as keyof typeof roleOrder] ?? 99;
        const orderB = roleOrder[b.role as keyof typeof roleOrder] ?? 99;
        return orderA - orderB;
      });
      setUsers(list);
    }, (error) => {
      console.error('Error fetching users collection:', error);
    });
    return unsubscribe;
  }, [currentUserRole]);

  const handleUpdateRole = async (targetUid: string, nextRole: string) => {
    try {
      await updateDoc(doc(db, 'users', targetUid), {
        role: nextRole,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to assign new user role:', err);
    }
  };

  // 本地掃描模擬狀態
  const [localFolders, setLocalFolders] = useState<string[]>(['C:\\Users\\Legendary\\Desktop\\MyIndieFolder', 'D:\\DRM_Free_Games']);
  const [newPath, setNewPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // 評價預設
  const [ratingSystem, setRatingSystem] = useState<'10' | '5' | 'thumb'>('10');
  const [defaultTemplate, setDefaultTemplate] = useState('標準 4 部曲（引入、機制、視聽、缺點與總結）');

  // 隱私
  const [shareActivities, setShareActivities] = useState(true);
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'friends' | 'private'>('friends');

  // 雲端備份與匯出狀態
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const handleAddScannerPath = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath.trim()) return;
    setLocalFolders([...localFolders, newPath.trim()]);
    setNewPath('');

    // 模擬自動掃描
    setIsScanning(true);
    setScanMessage('正在掃描資料夾中的 .exe 獨立遊戲檔案...');

    setTimeout(() => {
      setIsScanning(false);
      // 隨機選一個獨立小遊戲加入
      const randomGames = [
        { name: 'Baba Is You (巴巴是你)', exe: 'BabaIsYou.exe' },
        { name: 'Dead Cells (死亡細胞)', exe: 'deadcells.exe' },
        { name: 'Cuphead (茶杯頭)', exe: 'cuphead.exe' },
        { name: 'Outer Wilds (星際拓荒)', exe: 'outerwilds.exe' }
      ];
      const picked = randomGames[Math.floor(Math.random() * randomGames.length)];
      onAddMockLocalGame(picked.name, picked.exe);
      setScanMessage(`🎉 掃描完成！在資料夾中成功辨識並自動匯入本地獨立遊戲：${picked.name} (${picked.exe})`);
    }, 2000);
  };

  const clearScanMessage = () => {
    setScanMessage(null);
  };

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncDone(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
    }, 1800);
  };

  const handleExportData = () => {
    const data = localStorage.getItem('legendary_hub_games');
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legendarys_games_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col gap-6 font-sans">
      {/* 標題區 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <SettingsIcon className="text-indigo-400 rotate-45" size={24} />
            系統設定 (Settings)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            客製化您的遊戲整合平台、外觀、自動掃描與備份，一切隨心所欲。
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
          可客製化整合系統 v1.0.4
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-[500px]">
        {/* 左側：設定分頁 */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-1 md:col-span-1">
          <button
            onClick={() => setActiveTab('import')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
              activeTab === 'import'
                ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-950/25'
                : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FolderOpen size={16} />
            平台與資料夾監測
          </button>
          <button
            onClick={() => setActiveTab('ui')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
              activeTab === 'ui'
                ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-950/25'
                : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sliders size={16} />
            介面與卡片客製化
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
              activeTab === 'review'
                ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-950/25'
                : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Award size={16} />
            評價預設與範本
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
              activeTab === 'privacy'
                ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-950/25'
                : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Shield size={16} />
            隱私與社交設定
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
              activeTab === 'backup'
                ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-950/25'
                : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <RefreshCcw size={16} />
            備份與資料匯出
          </button>
          {currentUserRole === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-950/25'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <UsersIcon size={16} />
              管理者權限管理
            </button>
          )}
        </div>

        {/* 右側：詳細內容 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 md:col-span-3 flex flex-col justify-between">
          
          {/* TAB 1: 平台與資料夾 */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <FolderOpen className="text-emerald-400" size={18} />
                  一鍵整合外部平台與本地掃描
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  實現「把遊戲整合在一個平台」的核心宗旨。綁定 API 或手動設定本地資料夾來無縫匯入你的獨立遊戲。
                </p>
              </div>

              {/* 平台同步模擬 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Steam 帳號同步</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">自動同步遊戲清單與 188.4+ 小時時數</p>
                  </div>
                  <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-semibold">
                    已連結 (Connected)
                  </span>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Epic Games Store</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">未授權 API 帳號連動</p>
                  </div>
                  <button className="text-xs bg-slate-800 hover:bg-slate-700 hover:text-slate-100 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-750 transition-all font-semibold">
                    去連結
                  </button>
                </div>
              </div>

              {/* 本地資料夾監測設定 */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 font-sans uppercase tracking-wider">
                  本地掃描資料夾監控路徑 (Local Directory Monitor)
                </h4>
                <div className="space-y-2">
                  {localFolders.map((folder, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-xs font-mono text-slate-400">
                      <span>📁 {folder}</span>
                      <button 
                        onClick={() => setLocalFolders(localFolders.filter((_, i) => i !== index))}
                        className="text-rose-400 hover:text-rose-300 font-sans"
                      >
                        移除
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddScannerPath} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="輸入新的偵測路徑，例如 C:\Steam\steamapps\common 或 D:\DRM_Free"
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-slate-100 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 rounded-lg flex items-center gap-1.5 transition-all outline-none disabled:bg-indigo-800 disabled:text-indigo-300"
                  >
                    {isScanning ? '掃描中...' : '新增與自動掃描'}
                  </button>
                </form>

                {scanMessage && (
                  <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs rounded-xl flex items-start justify-between">
                    <div className="flex gap-2 items-center">
                      <Sparkles className="animate-bounce text-indigo-400" size={14} />
                      <span>{scanMessage}</span>
                    </div>
                    <button onClick={clearScanMessage} className="text-indigo-400 hover:text-slate-100 font-bold ml-2">×</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: UI卡片客製化 */}
          {activeTab === 'ui' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Sliders className="text-indigo-400" size={18} />
                  介面與卡片客製化顯示
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  響應解決方案中「讓遊戲的圖示變大與明顯、毛玻璃效果強弱」的自由設定。
                </p>
              </div>

              {/* 遊戲卡片大小調整 */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">主頁遊戲大卡片尺寸 (Grid Art Scale)</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">拉動調整首頁瀑布網格中遊戲封面的大小</p>
                  </div>
                  <span className="text-xs bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-bold">
                    {cardScale === 1 && '精簡列表 (3 欄)'}
                    {cardScale === 2 && '標準中等 (4 欄)'}
                    {cardScale === 3 && '極炫精美 (5 欄)'}
                    {cardScale === 4 && '大特寫卡片 (6 欄)'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">精簡</span>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={cardScale}
                    onChange={(e) => onCardScaleChange(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-slate-300">特寫</span>
                </div>
              </div>

              {/* 磨砂玻璃特效透明度 */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">毛玻璃磨砂強度 (Glassmorphism Blur)</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">控制 UI 側邊欄與詳細資訊面板的透明玻璃霧化效果</p>
                  </div>
                  <span className="text-xs bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-bold">
                    {blurStrength === 0 ? '無 (純色)' : `${blurStrength * 10}% 強度`}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={blurStrength}
                    onChange={(e) => onBlurStrengthChange(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-slate-300">100%</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-805 text-slate-400 text-xs rounded-xl flex gap-2 items-center">
                <AlertCircle size={14} className="text-indigo-400 flex-shrink-0" />
                <span>此項視覺變更將會「即時」套用至 Legendary's Hub 側邊欄與主頁網格！</span>
              </div>
            </div>
          )}

          {/* TAB 3: 評價預設與範本 */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Award className="text-amber-400" size={18} />
                  評價與評測範本預設 (針對創作者)
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  為了方便小瑜等評測創作者在當下不漏掉紀錄，可在此定義預設的心得表格。
                </p>
              </div>

              <div className="space-y-4">
                {/* 评分制 */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    預設分數與評價計算系統
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setRatingSystem('10')}
                      className={`px-4 py-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        ratingSystem === '10'
                          ? 'bg-slate-950 border-amber-500/50 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ⭐ 10分制 (Hollow Knight 預設)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingSystem('5')}
                      className={`px-4 py-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        ratingSystem === '5'
                          ? 'bg-slate-950 border-amber-500/50 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ⭐⭐⭐⭐⭐ 5星制
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingSystem('thumb')}
                      className={`px-4 py-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        ratingSystem === 'thumb'
                          ? 'bg-slate-950 border-amber-500/50 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      👍 推薦 / 👎 避坑推薦制
                    </button>
                  </div>
                </div>

                {/* 模板 */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    新增時預設載入之評測架構模板
                  </label>
                  <select
                    value={defaultTemplate}
                    onChange={(e) => setDefaultTemplate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  >
                    <option>標準 4 部曲（引入、機制、視聽、缺點與總結）</option>
                    <option>極簡爽快流（一瞬間最愛的心得 + 是否推薦）</option>
                    <option>深奧魂系考據（世界觀推敲、美術象徵、難度吐槽）</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 社交隱私 */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Shield className="text-indigo-400" size={18} />
                  社交與好友隱私 (Social & Privacy)
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  專為「與朋友遊玩的人」核心設計，能決定你的即時心得是否要公開被其他人看到。
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">
                      動態同步同步開關 (Friends Live Update)
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      當你在寫下短評、上傳遊戲截圖時，是否要自動推播此更新到朋友的「活動牆 (Activities)」
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={shareActivities}
                      onChange={() => setShareActivities(!shareActivities)}
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Gmail Push Notifications Toggle */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between col-span-1">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">
                      📧 Gmail 好友貼文推送通知
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      當好友發表新貼文時，是否要透過 Gmail 寄信通知到您的電子信箱：<strong>{profile?.email || '未設定'}</strong>
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={profile?.gmailNotificationsEnabled !== false}
                      onChange={async () => {
                        if (!profile) return;
                        try {
                          await updateDoc(doc(db, 'users', profile.uid), {
                            gmailNotificationsEnabled: profile.gmailNotificationsEnabled === false,
                            updatedAt: new Date().toISOString()
                          });
                        } catch (err) {
                          console.error('Failed to update Gmail push settings:', err);
                        }
                      }}
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    個人整合圖庫公開層級 (Library Visibility)
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'public', label: '🌍 公開 (Public)', desc: '系統上所有人都能瀏覽我的客製化圖庫、總遊玩時數與手寫評價' },
                      { id: 'friends', label: '👥 僅限好友 (Friends Only)', desc: '只有加為好友的人（如同阿牧的朋友）能看見我的整合庫與在玩狀態' },
                      { id: 'private', label: '🔒 私密 (Private/Incognito)', desc: '隱藏整合庫，可用來隱藏某些不想被朋友發現的特殊獨立遊戲' }
                    ].map((item) => (
                      <label 
                        key={item.id}
                        onClick={() => setPrivacyLevel(item.id as any)}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          privacyLevel === item.id 
                            ? 'bg-slate-950 border-indigo-500/40 text-slate-100'
                            : 'bg-slate-950 border-slate-800/60 text-slate-400 hover:border-slate-850'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="privacy" 
                          checked={privacyLevel === item.id}
                          onChange={() => {}} 
                          className="mt-1 accent-indigo-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-200">{item.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 備份與資料匯出 */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <RefreshCcw className="text-indigo-400" size={18} />
                  資料備份與創作者匯出
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  確保玩家辛苦上傳的自訂封面、大圖標、心得與評測不會遺失。創作者可以一鍵匯出為乾淨的 JSON。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase">雲端同步備份 (Firestore Sync)</h4>
                  <p className="text-slate-500 text-[11px]">將目前手動新增的遊戲、自訂封面與 3 張截圖同步至極速雲端資料庫。</p>
                  
                  <button
                    type="button"
                    onClick={handleTriggerSync}
                    disabled={isSyncing}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-all outline-none disabled:bg-slate-900"
                  >
                    {isSyncing ? (
                      <>
                        <span className="h-3 w-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></span>
                        同步備份中...
                      </>
                    ) : syncDone ? (
                      <>
                        <Check className="text-emerald-400 animate-pulse" size={14} />
                        同步完成！
                      </>
                    ) : (
                      '立即在線備份'
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase">創作者一鍵 JSON 備份檔</h4>
                  <p className="text-slate-500 text-[11px]">將你寫的所有獨立遊戲評測資料匯出為規格 JSON。可用於文案撰寫與轉貼。</p>
                  
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all outline-none"
                  >
                    匯出 JSON 備份檔
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 管理者權限管理 */}
          {activeTab === 'users' && currentUserRole === 'admin' && (
            <div className="space-y-6 flex-1 flex flex-col">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <span className="p-1 px-1.5 rounded bg-rose-500/15 border border-rose-500/20 text-rose-400">🛡️</span>
                  高階使用者角色與權限指派 (Admin Panel)
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  預設 <strong>tangyufeng95@gmail.com</strong> 為最高管理人員。其餘登入帳號由您在此指派權限（點擊下拉選單即時更新）：
                </p>
              </div>

              <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40 flex-1 flex flex-col min-h-[300px]">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3 text-xs">基本資訊</th>
                        <th className="px-4 py-3 text-xs">電子郵件</th>
                        <th className="px-4 py-3 text-xs font-mono">當前角色</th>
                        <th className="px-4 py-3 text-xs text-right">指派新權限</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                            正在載入系統認證用戶資料...
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.uid} className="hover:bg-slate-900/40 transition-colors">
                            <td className="px-4 py-3 flex items-center gap-3">
                              <img src={u.photoURL} alt={u.displayName} className="w-7 h-7 rounded-full object-cover border border-slate-800" referrerPolicy="no-referrer" />
                              <span className="font-semibold text-slate-200 text-xs">{u.displayName}</span>
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{u.email}</td>
                            <td className="px-4 py-3">
                              {u.role === 'admin' && (
                                <span className="bg-rose-500/10 text-rose-400 text-[10px] px-2.5 py-0.5 rounded border border-rose-500/20 font-bold">
                                  👑 最高管理員
                                </span>
                              )}
                              {u.role === 'member' && (
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                                  🎮 認證成員
                                </span>
                              )}
                              {u.role === 'guest' && (
                                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2.5 py-0.5 rounded border border-indigo-500/20 font-bold">
                                  👤 一般賓客
                                </span>
                              )}
                              {u.role === 'blocked' && (
                                <span className="bg-rose-950/25 text-rose-500 text-[10px] px-2.5 py-0.5 rounded border border-rose-900/40 font-bold">
                                  🚫 已封鎖用戶
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <select
                                value={u.role}
                                disabled={u.email === 'tangyufeng95@gmail.com'}
                                onChange={(e) => handleUpdateRole(u.uid, e.target.value)}
                                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500 disabled:opacity-50"
                              >
                                <option value="guest">Guest (賓客/待審)</option>
                                <option value="member">Member (認證成員)</option>
                                <option value="admin">Admin (管理員)</option>
                                <option value="blocked">Blocked (已封鎖)</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Area */}
          <div className="border-t border-slate-800/80 pt-4 mt-8 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">
              Last saved: {new Date().toLocaleTimeString()}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">所有變動已自動儲存至 LocalStorage</span>
              <span className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Check size={12} />
              </span>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
