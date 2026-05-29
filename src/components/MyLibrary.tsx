import React, { useState } from 'react';
import { Game } from '../types';
import { Search, ChevronDown, Clock, Calendar, Star, Play, Settings, Compass, Users, Sparkles, Plus, ExternalLink, Edit } from 'lucide-react';

interface MyLibraryProps {
  games: Game[];
  selectedGame: Game | null;
  onSelectGame: (game: Game) => void;
  onOpenAddModal: () => void;
  onPlayGame: (gameId: string) => void;
  onViewDedicatedPage: (game: Game) => void;
  onTriggerQuickEdit: (game: Game) => void;
  cardScale: number; // 介面設定
}

export default function MyLibrary({
  games,
  selectedGame,
  onSelectGame,
  onOpenAddModal,
  onPlayGame,
  onViewDedicatedPage,
  onTriggerQuickEdit,
  cardScale
}: MyLibraryProps) {
  const [filter, setFilter] = useState<'All' | 'Played' | 'Backlog' | 'Local'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'playtime' | 'name' | 'lastPlayed'>('playtime');
  const [isPlaying, setIsPlaying] = useState(false);

  // 處理過濾
  const filteredGames = games.filter(game => {
    // 搜尋
    if (searchQuery.trim() && !game.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 狀態
    if (filter === 'Played') return game.playtime > 0;
    if (filter === 'Backlog') return game.status === 'Backlog';
    if (filter === 'Local') return game.isLocal;
    return true;
  });

  // 處理排序
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'playtime') return b.playtime - a.playtime;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'lastPlayed') return b.lastPlayed.localeCompare(a.lastPlayed);
    return 0;
  });

  // 控制主網格欄數
  const getGridColsClass = () => {
    switch (cardScale) {
      case 1: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 2: return 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'; // 預設標準
      case 3: return 'grid-cols-3 md:grid-cols-4 xl:grid-cols-5';
      case 4: return 'grid-cols-3 lg:grid-cols-5 xl:grid-cols-6';
      default: return 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4';
    }
  };

  // 模擬啟動
  const handleStartGame = (gameId: string) => {
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
      onPlayGame(gameId);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden font-sans h-full">
      
      {/* 左邊：遊戲瀑布卡片列表 & 檢索區 */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto max-h-full scrollbar-thin">
        {/* 頂部控制欄：Filter & Search & Sort */}
        <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 mb-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              My Games <span className="text-sm font-semibold text-slate-500 font-mono">({sortedGames.length})</span>
            </h2>
            {/* 過濾標籤群 */}
            <div className="flex flex-wrap gap-2 pt-1.5">
              {(['All', 'Played', 'Backlog', 'Local'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full outline-none transition-all ${
                    filter === tab
                      ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 shadow-sm shadow-indigo-950/30'
                      : 'border border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'All' && '全部遊戲 (All)'}
                  {tab === 'Played' && '已玩過 (Played)'}
                  {tab === 'Backlog' && '待通關庫 (Backlog)'}
                  {tab === 'Local' && '本地導入 (Local)'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            {/* 搜尋 */}
            <div className="relative flex-1 sm:w-48">
              <input
                type="text"
                placeholder="搜尋獨立遊戲..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-505 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
              />
              <Search size={12} className="absolute left-3 top-2.5 text-slate-500" />
            </div>

            {/* 排序 */}
            <div className="relative bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <span className="text-slate-500">排序:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 hover:text-white font-semibold outline-none cursor-pointer pr-4"
              >
                <option value="playtime" className="bg-slate-900 text-slate-200">時數最高 (Playtime)</option>
                <option value="name" className="bg-slate-900 text-slate-200">名字字母 (Name)</option>
                <option value="lastPlayed" className="bg-slate-900 text-slate-200">最近遊玩 (Last Played)</option>
              </select>
            </div>

            {/* ➕ 加入遊戲按鈕 */}
            <button
              onClick={onOpenAddModal}
              className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-sans font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-400/10 active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              手動加入遊戲 (Add)
            </button>
          </div>
        </div>

        {/* 遊戲瀑布卡片網格 (Big Cover Card Grid) */}
        {sortedGames.length > 0 ? (
          <div className={`grid ${getGridColsClass()} gap-4 flex-1 align-top auto-rows-max`}>
            {sortedGames.map((game) => {
              const isSelected = selectedGame?.id === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game)}
                  className={`group relative flex flex-col bg-slate-900/40 border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/40 bg-slate-900'
                      : 'border-slate-800/80 hover:border-slate-700/60 hover:bg-slate-900/30'
                  }`}
                >
                  {/* 大卡片封面 */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-950">
                    <img
                      src={game.coverUrl}
                      alt={game.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    
                    {/* 選中標籤縮影 */}
                    {isSelected && (
                      <span className="absolute top-2 left-2 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Selected
                      </span>
                    )}

                    {game.isLocal && (
                      <span className="absolute top-2 right-2 bg-teal-400/90 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        本地
                      </span>
                    )}

                    {/* 卡片時數等小標籤 */}
                    <div className="absolute bottom-3 left-3 flex flex-col gap-1">
                      <h4 className="text-xs font-bold text-slate-100 font-sans tracking-tight line-clamp-1">
                        {game.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Played: {game.playtime} hrs
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-800/80 rounded-3xl bg-slate-900/10 gap-3">
            <span className="p-4 rounded-2xl bg-slate-950 text-slate-500">
              <Search size={28} />
            </span>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-300">沒有符合條件的獨立遊戲</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                沒有搜尋到相關項目，請確認搜尋關鍵字或點擊上方「手動加入新遊戲」建立專屬實體卡片！
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 右側：Game Insights (選中遊戲詳細資訊框) */}
      {selectedGame && (
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800/80 bg-slate-900/30 flex flex-col justify-between overflow-y-auto max-h-full custom-scrollbar flex-shrink-0">
          <div className="p-5 space-y-4">
            
            {/* Header 資訊 */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                Game Insights / 遊戲洞察
              </h3>
              <button 
                onClick={() => onViewDedicatedPage(selectedGame)}
                className="text-slate-400 hover:text-indigo-400 text-xs flex items-center gap-0.5"
              >
                門面啟動頁 <ExternalLink size={10} />
              </button>
            </div>

            {/* 遊戲大標題 */}
            <div className="space-y-1">
              <h1 className="text-lg font-extrabold text-slate-100 tracking-tight leading-tight">
                {selectedGame.name}
              </h1>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                <span className="flex items-center gap-1"><Clock size={11} /> Playtime: {selectedGame.playtime} hrs</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Calendar size={11} /> Played: {selectedGame.lastPlayed}</span>
              </div>
            </div>

            {/* Game Snippets 代表隨機實機照片 */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Game Snippets / 遊戲畫面範例
              </h4>
              <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto">
                {selectedGame.snippets && selectedGame.snippets.length > 0 ? (
                  selectedGame.snippets.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Snippet"
                      referrerPolicy="no-referrer"
                      className="rounded-xl aspect-[16/9] object-cover border border-slate-800 w-full hover:scale-102 transition-all duration-300 pointer-events-none"
                    />
                  ))
                ) : (
                  <div className="p-6 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                    尚未上傳遊玩畫面
                  </div>
                )}
              </div>
            </div>

            {/* My Review & Feelings */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                My Review & Feelings / 我的評價與心得
              </h4>
              <p className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl text-xs leading-relaxed text-slate-300 italic whitespace-pre-wrap min-h-[60px]">
                {selectedGame.review || '尚未寫下心得感想，點擊 Quick Action 開始記錄！'}
              </p>
            </div>

            {/* 星等評分 1-10分 */}
            <div className="flex items-center justify-between bg-slate-950/55 border border-slate-850 p-3.5 rounded-xl">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={13}
                    className={idx < Math.round(selectedGame.rating / 2) ? 'text-amber-400' : 'text-slate-700'}
                    fill={idx < Math.round(selectedGame.rating / 2) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-amber-400 font-sans">
                {selectedGame.rating} / 10 分
              </span>
            </div>

          </div>

          {/* Quick Actions 快速操作區 */}
          <div className="p-5 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Actions / 快速動作
            </h4>
            
            <button
              onClick={() => handleStartGame(selectedGame.id)}
              disabled={isPlaying}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-sans font-bold text-xs transition-all outline-none ${
                isPlaying 
                  ? 'bg-amber-500 text-slate-950 animate-pulse' 
                  : 'bg-emerald-400 hover:bg-emerald-300 hover:text-black text-slate-950 active:scale-97'
              }`}
            >
              {isPlaying ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  正在安全啟動中...
                </>
              ) : (
                <>
                  <Play size={12} fill="currentColor" />
                  🚀 啟動遊戲 (Start Game)
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onTriggerQuickEdit(selectedGame)}
                className="py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all outline-none"
              >
                <Edit size={11} /> 快速編輯
              </button>
              <button
                onClick={() => onViewDedicatedPage(selectedGame)}
                className="py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-505 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all outline-none shadow-md shadow-indigo-950/20"
              >
                🔗 專屬啟動頁
              </button>
            </div>
          </div>
        </aside>
      )}

    </div>
  );
}
