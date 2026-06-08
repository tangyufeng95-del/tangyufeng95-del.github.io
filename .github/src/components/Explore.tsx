import React, { useState } from 'react';
import { ExplorePreset } from '../types';
import { Sparkles, Heart, Copy, Download, ThumbsUp, Compass, MessageSquare, AlertCircle } from 'lucide-react';
import { INSPIRATIONS, EXPLORE_PRESETS } from '../data/mockData';

interface ExploreProps {
  onApplyPresetCover: (gameId: string, coverUrl: string) => void;
}

export default function Explore({ onApplyPresetCover }: ExploreProps) {
  const [presets, setPresets] = useState<ExplorePreset[]>(EXPLORE_PRESETS);
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleLikePreset = (id: string) => {
    setPresets(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    }));
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast(null);
    }, 3500);
  };

  const handleApplyCover = (gameName: string, coverUrl: string) => {
    // 解析對應本地與預設 mock data 的 game id
    let gameId = '';
    if (gameName.toLowerCase().includes('hollow') || gameName.toLowerCase().includes('空洞')) {
      gameId = 'hollow_knight';
    } else if (gameName.toLowerCase().includes('stardew') || gameName.toLowerCase().includes('星露')) {
      gameId = 'stardew_valley';
    } else if (gameName.toLowerCase().includes('hades') || gameName.toLowerCase().includes('黑帝')) {
      gameId = 'hades';
    } else {
      // 找不到就取預設的第一個或新增
      gameId = 'hollow_knight';
    }

    onApplyPresetCover(gameId, coverUrl);
    triggerToast(`🎉 成功！已從社群一鍵套用《${gameName}》高畫質客製化封面卡片至【我的圖庫】中！`);
  };

  const handleCopyTemplate = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast('📋 已將寫作靈感評價範本複製至剪貼簿，可於新增遊戲中直接填入！');
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col gap-8 font-sans">
      
      {/* 頂部標題 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Compass className="text-emerald-400" size={24} />
            探索靈感與客製化素材 (Explore Ideas)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            在這裡尋找其他玩家上傳的精美遊戲自訂卡片封面，以及撰寫評價的心得範本。
          </p>
        </div>
        <div className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg font-mono">
          社群分享: 1,420 款卡片
        </div>
      </div>

      {/* 溫馨提示浮空 */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl shadow-xl flex items-center gap-2.5 animate-slide-up">
          <AlertCircle className="text-emerald-400" size={16} />
          <span>{showToast}</span>
        </div>
      )}

      {/* 區塊 1: 社群客製化封面藝術牆 */}
      <section className="space-y-4">
        <div className="flex gap-2 items-center text-sm font-bold text-slate-200">
          <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <Sparkles size={14} />
          </span>
          <h2>社群客製化卡片牆 (Community Art Hub)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {presets.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                <img
                  src={p.coverUrl}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                
                {/* 浮動標籤與作者 */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">
                      {p.gameName}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 mt-1 line-clamp-1">{p.title}</h4>
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {p.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-850">
                  <span>作者: {p.author}</span>
                  <div className="flex gap-1">
                    {p.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-500">#{t}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                  <button
                    onClick={() => handleLikePreset(p.id)}
                    className="flex justify-center items-center gap-1.5 bg-slate-950 hover:bg-slate-850 text-[11px] text-slate-300 border border-slate-850 py-2 rounded-xl transition-all"
                  >
                    <Heart size={12} className="text-rose-500" fill="currentColor" />
                    讚 ({p.likes})
                  </button>
                  <button
                    onClick={() => handleApplyCover(p.gameName, p.coverUrl)}
                    className="flex justify-center items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] py-2 rounded-xl transition-all"
                  >
                    <Download size={12} />
                    一鍵套用封面
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 區塊 2: 評測寫作靈感庫 */}
      <section className="space-y-4">
        <div className="flex gap-2 items-center text-sm font-bold text-slate-200">
          <span className="p-1 rounded bg-amber-500/10 text-amber-405">
            <Sparkles size={14} className="text-amber-400" />
          </span>
          <h2>評測靈感庫 (Review Templates)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INSPIRATIONS.map((insp) => (
            <div key={insp.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-amber-500/10 border border-amber-505/20 text-amber-400 px-2.5 py-0.5 rounded font-bold font-sans">
                    {insp.category}
                  </span>
                  <span className="text-[10px] text-slate-500">來源: {insp.author}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-200">{insp.title}</h3>
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
                  <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                    {insp.content}
                  </pre>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyTemplate(insp.content)}
                className="w-full flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-300 hover:text-white font-semibold text-[11px] py-2 rounded-xl transition-all"
              >
                <Copy size={12} />
                複製並套用此靈感框架
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 獨立遊戲發現與推薦 */}
      <section className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              本週冷門獨立遊戲發現 (Weekly Indie Gem)
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">定期更新</span>
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <img
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80"
            alt="發現經典"
            referrerPolicy="no-referrer"
            className="w-full md:w-48 aspect-[16/10] md:aspect-[4/5] object-cover rounded-xl border border-slate-800 pointer-events-none"
          />
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-100">【星際荒蕪冒險】Outer Wilds (星際拓荒)</h3>
              <p className="text-xs text-indigo-400 mt-1 font-semibold">
                TAGS: 22分鐘循環、太空解謎、宇宙探索、絕對神作
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-2.5">
                這是一首給所有太空愛好者、物理學者與冒險家的絕美輓歌。22分鐘後，太陽將會超新星爆發，你將帶著飛船日誌，探尋上古種族消失的秘密。請玩家不要看任何剧透！
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-sans text-slate-400">
              <div className="flex gap-1 text-amber-400">⭐⭐⭐⭐⭐ 10/10</div>
              <div>·</div>
              <span>4,215 位評測創作者強烈推薦</span>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
