import React, { useState } from 'react';
import { Game } from '../types';
import { X, Upload, Link, HardDrive } from 'lucide-react';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newGame: Omit<Game, 'id'>) => void;
}

export default function AddGameModal({ isOpen, onClose, onAdd }: AddGameModalProps) {
  const [name, setName] = useState('');
  const [playtime, setPlaytime] = useState(0);
  const [category, setCategory] = useState('Indie Games');
  const [launchUrl, setLaunchUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(8);
  const [isLocal, setIsLocal] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['本地導入', '待探索']);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // 給一個隨機 Unsplash 封面的備用機制
    const finalCover = coverUrl.trim() || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60';

    onAdd({
      name,
      coverUrl: finalCover,
      category,
      playtime: Number(playtime) || 0,
      lastPlayed: new Date().toLocaleDateString('zh-TW'),
      review: review || '尚未手寫評價，此遊戲為手動導入。',
      rating,
      snippets: [
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80'
      ],
      launchUrl: launchUrl || 'https://itch.io',
      isLocal,
      tags,
      status: 'Backlog'
    });

    // 重設表單
    setName('');
    setPlaytime(0);
    setLaunchUrl('');
    setCoverUrl('');
    setReview('');
    setRating(8);
    setTags(['本地導入', '待探索']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <HardDrive size={18} />
            </span>
            <h2 className="text-lg font-semibold text-slate-100 font-sans tracking-tight">手動加入新遊戲 (➕ Add Game)</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors p-1 hover:bg-slate-800/60 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* 遊戲名稱 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5">
              遊戲名稱 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如：Hollow Knight 絲之歌"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 遊戲分類 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5">
                遊戲分類
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3.5 py-2 text-sm text-slate-100 outline-none transition-all"
              >
                <option value="Indie Games">Indie Games (獨立遊戲)</option>
                <option value="AAA Games">AAA 經典大作</option>
                <option value="Local Sandbox">網頁與本地沙盒</option>
              </select>
            </div>

            {/* 起始遊玩時數 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5">
                原累積遊玩時數 (小時)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="0.0"
                value={playtime || ''}
                onChange={(e) => setPlaytime(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-lg px-3.5 py-2 text-sm text-slate-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* 啟動連結或本地路徑 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5 flex justify-between">
              <span>啟動連結 / 執行檔路徑 (.exe)</span>
              <span className="text-slate-500 text-[10px] font-mono">支援 steam:// 或網址</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="例如：C:/Games/Celeste/Celeste.exe 或 https://itch.io/..."
                value={launchUrl}
                onChange={(e) => {
                  setLaunchUrl(e.target.value);
                  setIsLocal(!e.target.value.startsWith('http'));
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
              <span className="absolute left-3 top-2.5 text-slate-500">
                {isLocal ? <HardDrive size={16} /> : <Link size={16} />}
              </span>
            </div>
          </div>

          {/* 封面圖片網址 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5 flex justify-between">
              <span>自訂封面圖片網址 (Cover URL)</span>
              <span className="text-slate-500 text-[10px]">留空將自動帶入質感隨機原創封面</span>
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
              <span className="absolute left-3 top-2.5 text-slate-500">
                <Upload size={16} />
              </span>
            </div>
          </div>

          {/* 遊戲評價與評分項目 */}
          <div className="border-t border-slate-800/80 pt-4 grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5 text-center">
                個人評分
              </label>
              <div className="flex items-center justify-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="bg-transparent text-amber-400 font-bold text-base outline-none cursor-pointer w-full text-center"
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n} className="bg-slate-900 text-slate-100 font-bold">
                      {n} 分
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5">
                編輯首筆短評與心得
              </label>
              <textarea
                placeholder="防止以後忘記！寫下你對這款遊戲的心得、難度、是否推薦..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-lg px-3.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* 自訂標籤 Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5">
              熱門標籤 (Tags)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag, i) => (
                <span 
                  key={i} 
                  className="inline-flex items-center gap-1 bg-slate-800/80 border border-slate-700/50 text-[11px] text-slate-300 px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(i)} 
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="自訂標籤名稱，例如：魂系、神作、像素風"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-slate-800 hover:bg-slate-700 px-3 py-1 text-xs text-slate-200 rounded-lg font-medium border border-slate-700transition-all"
              >
                加入
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent rounded-xl transition-all"
          >
            取消 (Cancel)
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 font-sans rounded-xl transition-all font-bold shadow-lg shadow-emerald-400/20"
          >
            🚀 建立並前往啟動頁
          </button>
        </div>
      </div>
    </div>
  );
}
