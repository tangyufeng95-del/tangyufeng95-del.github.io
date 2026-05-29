import React, { useState } from 'react';
import { Game } from '../types';
import { ArrowLeft, Play, Calendar, Clock, Edit3, Image as ImageIcon, Save, Check, Star, Trash2 } from 'lucide-react';

interface GameDetailsProps {
  game: Game;
  onBack: () => void;
  onUpdateGame: (updated: Game) => void;
  onDeleteGame: (id: string) => void;
}

export default function GameDetails({ game, onBack, onUpdateGame, onDeleteGame }: GameDetailsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playtime, setPlaytime] = useState(game.playtime);
  const [lastPlayed, setLastPlayed] = useState(game.lastPlayed);
  
  // 編輯模式
  const [isEditing, setIsEditing] = useState(false);
  const [editedReview, setEditedReview] = useState(game.review);
  const [editedRating, setEditedRating] = useState(game.rating);
  const [editedTags, setEditedTags] = useState<string[]>(game.tags);
  const [tagInput, setTagInput] = useState('');
  
  // 自訂圖片
  const [editSnippets, setEditSnippets] = useState<string[]>(game.snippets);
  const [newSnippetUrl, setNewSnippetUrl] = useState('');
  const [showToast, setShowToast] = useState(false);

  // 模擬啟動遊戲
  const handleStartGame = () => {
    setIsPlaying(true);
    // 虛擬遊玩：累積 0.2 小時
    setTimeout(() => {
      setIsPlaying(false);
      const newPlaytime = parseFloat((playtime + 0.2).toFixed(1));
      const today = new Date().toLocaleDateString('zh-TW');
      setPlaytime(newPlaytime);
      setLastPlayed(today);

      // 更新主狀態
      onUpdateGame({
        ...game,
        playtime: newPlaytime,
        lastPlayed: today
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 3000);
  };

  const handleSaveEdits = () => {
    onUpdateGame({
      ...game,
      review: editedReview,
      rating: editedRating,
      tags: editedTags,
      snippets: editSnippets
    });
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !editedTags.includes(tagInput.trim())) {
      setEditedTags([...editedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setEditedTags(editedTags.filter((_, i) => i !== index));
  };

  const handleAddSnippet = () => {
    if (newSnippetUrl.trim()) {
      setEditSnippets([...editSnippets, newSnippetUrl.trim()]);
      setNewSnippetUrl('');
    }
  };

  const handleRemoveSnippet = (index: number) => {
    setEditSnippets(editSnippets.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 bg-slate-950 font-sans p-6 text-slate-100 flex flex-col gap-6 overflow-y-auto max-h-full">
      
      {/* 頂部導覽 */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 hover:border-slate-705 px-3 py-2 rounded-xl transition-all"
        >
          <ArrowLeft size={14} />
          返回圖庫 (Back to Library)
        </button>

        <button
          onClick={() => {
            if (confirm(`確定要刪除「${game.name}」的所有客製化紀錄與整合嗎？`)) {
              onDeleteGame(game.id);
            }
          }}
          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 rounded-xl transition-all border border-rose-500/20"
        >
          <Trash2 size={14} /> 刪除此遊戲
        </button>
      </div>

      {/* 模擬啟動成功的 Toast 提醒 */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-up">
          <Check className="text-emerald-400 animate-pulse" size={16} />
          <span>🚀 遊戲關閉成功！已為您自動同步累積 +0.2 小時遊玩時數！</span>
        </div>
      )}

      {/* 遊戲主要標題與背景 Banner 大透卡 */}
      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] bg-slate-900 border border-slate-800/80">
        {/* 背景高斯模糊圖片 */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 pointer-events-none"
          style={{ backgroundImage: `url(${game.coverUrl})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"></div>

        {/* 內置核心功能區 */}
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="flex gap-4 items-end">
            <img
              src={game.coverUrl}
              alt={game.name}
              referrerPolicy="no-referrer"
              className="w-24 md:w-32 aspect-[3/4] object-cover rounded-xl shadow-2xl border border-slate-800 pointer-events-none"
            />
            <div className="space-y-1 md:space-y-2 mb-1.5">
              <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold font-mono">
                {game.category}
              </span>
              <h1 className="text-xl md:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                {game.name}
              </h1>
              
              {/* 標籤 tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {editedTags.map((t, i) => (
                  <span key={i} className="bg-slate-950 px-2 py-0.5 rounded text-[10px] text-slate-400 border border-slate-900">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 綠色大 PLAY 啟動遊戲按鈕 */}
          <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3">
            <button
              onClick={handleStartGame}
              disabled={isPlaying}
              className={`w-full md:w-auto px-10 py-4 rounded-2xl flex items-center justify-center gap-3 font-sans font-bold text-base transition-all shadow-xl outline-none ${
                isPlaying 
                  ? 'bg-amber-500 text-slate-950 animate-pulse shadow-amber-500/10' 
                  : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-400/25 active:scale-95'
              }`}
            >
              {isPlaying ? (
                <>
                  <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  正在遊玩獨立遊戲中... (游標鎖定)
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  START GAME / 啟動遊戲
                </>
              )}
            </button>
            
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1"><Clock size={12} /> 累積 {playtime} 小時</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> 上次遊玩: {lastPlayed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 雙欄：左側「心得評測客製化」、右側「代表動作畫面 (Game Snippets)」 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 左側欄：心得心得與評價 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
              我的手寫評價與心路歷程
            </h3>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-850 rounded-lg transition-all"
              >
                <Edit3 size={12} /> 編輯評測
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveEdits}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-850 rounded-lg transition-all"
              >
                <Save size={12} /> 儲存內容
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl leading-relaxed text-sm text-slate-200 font-sans whitespace-pre-wrap min-h-[120px]">
                {editedReview || '尚未記錄您對這款遊戲的想法。快編輯第一筆評價，防止之後想不起來唷！'}
              </div>

              {/* 大評分星等 */}
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-850">
                <span className="text-xs font-semibold text-slate-400 font-sans">我的精心評星與推薦指數</span>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        size={16}
                        className={idx < Math.round(editedRating / 2) ? 'text-amber-400' : 'text-slate-700'}
                        fill={idx < Math.round(editedRating / 2) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-black text-amber-400 font-sans">{editedRating} / 10 分</span>
                </div>
              </div>
            </div>
          ) : (
            /* 編輯模態 */
            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-slate-300">手寫感受、攻略心得或點滴</label>
                <textarea
                  value={editedReview}
                  onChange={(e) => setEditedReview(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 outline-none h-40 font-sans text-xs leading-relaxed"
                  placeholder="寫下你的真實感想..."
                />
              </div>

              {/* 滑桿星等評分 */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">精準評分 (10分制)</span>
                  <span className="text-sm font-black text-amber-400">{editedRating}分</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={editedRating}
                  onChange={(e) => setEditedRating(parseInt(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* 編輯標籤 */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <label className="block font-bold text-slate-300">編輯標籤 (Tags)</label>
                <div className="flex flex-wrap gap-1.5">
                  {editedTags.map((tag, i) => (
                    <span key={i} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300 flex items-center gap-1">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(i)} className="text-slate-500 hover:text-rose-400">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="新增標籤"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-slate-200"
                  />
                  <button type="button" onClick={handleAddTag} className="bg-indigo-600 px-3 py-1 rounded text-white font-semibold">加入</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右側欄：代表性實機畫面 (Game Snippets) */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              遊戲實機畫面 (Snippets)
            </h3>

            {/* 代表畫面列表 */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {editSnippets.map((img, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden aspect-[16/9] border border-slate-800">
                  <img
                    src={img}
                    alt={`片段-${index}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 pointer-events-none"
                  />
                  <button
                    onClick={() => handleRemoveSnippet(index)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-rose-600 p-1.5 rounded-lg text-slate-200 hover:text-white transition-all scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {editSnippets.length === 0 && (
                <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500 font-sans">
                  尚未導入代表截圖。您可填入網路圖片來美化回憶。
                </div>
              )}
            </div>
          </div>

          {/* 新增截圖輸入 */}
          <div className="space-y-2 border-t border-slate-850 pt-4">
            <label className="block text-[10px] font-bold text-slate-400">新增精美實機圖 (URL)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="貼上 Unsplash 或圖片網址..."
                value={newSnippetUrl}
                onChange={(e) => setNewSnippetUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSnippet();
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              />
              <button
                type="button"
                onClick={handleAddSnippet}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                加入
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
