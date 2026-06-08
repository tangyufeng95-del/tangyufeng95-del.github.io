import React, { useState } from 'react';
import { Activity } from '../types';
import { AlertCircle as AlertIcon, Heart, MessageSquare, Send, Users, Sparkles, Plus, Image as ImageIcon, Flame } from 'lucide-react';

interface ActivitiesProps {
  activities: Activity[];
  onAddComment: (activityId: string, commentText: string) => void;
  onLikeActivity: (activityId: string) => void;
  onPostActivity: (content: string, imageUrl: string) => void;
  userGamesCount: number;
  accessToken: string | null;
  onLinkGmail: () => void;
}

export default function Activities({
  activities,
  onAddComment,
  onLikeActivity,
  onPostActivity,
  userGamesCount,
  accessToken,
  onLinkGmail
}: ActivitiesProps) {
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [activeChallenge, setActiveChallenge] = useState(false);
  const [challengeText, setChallengeText] = useState('');
  const [coopMessage, setCoopMessage] = useState<string | null>(null);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    onPostActivity(newPostContent, newPostImage);
    setNewPostContent('');
    setNewPostImage('');
    setActiveChallenge(false);
  };

  const handleCommentSubmit = (activityId: string) => {
    const text = commentInputs[activityId];
    if (!text || !text.trim()) return;
    onAddComment(activityId, text.trim());
    setCommentInputs({ ...commentInputs, [activityId]: '' });
  };

  const handleCoopPing = (friendName: string, gameName: string) => {
    setCoopMessage(`已成功向「${friendName}」發送《${gameName}》同步共玩語音邀請！連線代碼已自動複製至剪貼簿：L_HUB_${Math.floor(100000 + Math.random() * 900000)}`);
    setTimeout(() => {
      setCoopMessage(null);
    }, 4500);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col lg:flex-row gap-6 font-sans">
      
      {/* 左邊：好友動態牆 & 挑戰活動 */}
      <div className="flex-1 space-y-6 max-w-2xl">
        {/* 標題與發布框 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-4">
          {/* Gmail Link Indicator */}
          {!accessToken ? (
            <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <AlertIcon size={14} className="text-amber-500 flex-shrink-0 animate-pulse" />
                <span>📢 <strong>Gmail 通知未授權：</strong>新貼文將「不會」自動發信通知好友。貼文前請先點擊右側按鈕啟用。</span>
              </div>
              <button
                type="button"
                onClick={onLinkGmail}
                className="bg-amber-500 hover:bg-amber-650 active:bg-amber-700 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-all text-[11px] whitespace-nowrap cursor-pointer"
              >
                啟用 Gmail 授權
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs">
              <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0"></span>
              <span>🟢 <strong>Gmail 通知推送已就緒：</strong>發表貼文後，系統將透過您的 Gmail 帳號自動向已啟用推送的好友寄送即時動態信件。</span>
            </div>
          )}

          <div className="flex gap-3">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces"
              alt="頭像"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400"
            />
            <div className="flex-1">
              <textarea
                placeholder="牧傳奇，今天玩了什麼獨立神作？寫些心得，問問好友要不要語音共玩吧..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all resize-none"
                rows={3}
              />
            </div>
          </div>

          {(newPostContent.trim() || activeChallenge) && (
            <div className="flex gap-2 items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 animate-slide-up">
              <span className="text-slate-500 text-xs flex items-center gap-1">
                <ImageIcon size={14} /> 貼上圖片網址:
              </span>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={newPostImage}
                onChange={(e) => setNewPostImage(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-300 outline-none"
              />
            </div>
          )}

          <div className="flex justify-between items-center border-t border-slate-800/60 pt-3">
            <button
              type="button"
              onClick={() => setActiveChallenge(!activeChallenge)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles size={14} />
              加入本期話題挑戰 #用一張截圖證明你玩過黑帝斯
            </button>
            <button
              onClick={handlePostSubmit}
              disabled={!newPostContent.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-indigo-400 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              推送動態 <Send size={12} />
            </button>
          </div>
        </div>

        {/* 邀請 PING 發布訊息通知 */}
        {coopMessage && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs rounded-xl flex items-start gap-2.5 animate-slide-up">
            <Flame className="text-emerald-400 animate-pulse mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="font-bold">✨ 共玩連結邀請已送出！</p>
              <p className="mt-0.5 opacity-90">{coopMessage}</p>
            </div>
          </div>
        )}

        {/* 動態時報 */}
        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              {/* 動態頂部 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={act.user.avatar}
                    alt={act.user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-200">{act.user.name}</span>
                      {act.user.studentId && (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {act.user.studentId}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      狀態：{act.action} · {act.timestamp}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-950 text-indigo-400 border border-indigo-950 text-[11px] font-medium px-2.5 py-1 rounded-lg">
                  🎯 {act.gameName}
                </div>
              </div>

              {/* 動態內容 */}
              {act.content && (
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{act.content}</p>
              )}

              {/* 動態附帶圖片 */}
              {act.images && act.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden aspect-[21/9]">
                  {act.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="遊玩畫面"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-300 pointer-events-none"
                    />
                  ))}
                </div>
              )}

              {/* 按讚與留言功能按鈕 */}
              <div className="flex items-center gap-6 border-y border-slate-800/50 py-2.5">
                <button
                  type="button"
                  onClick={() => onLikeActivity(act.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold select-none ${
                    act.likedByMe ? 'text-rose-500' : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <Heart size={14} fill={act.likedByMe ? 'currentColor' : 'none'} />
                  {act.likes} 精心大讚
                </button>
                <div className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  {act.comments.length} 則好友吐嘈
                </div>
              </div>

              {/* 好友留言串 */}
              {act.comments.length > 0 && (
                <div className="bg-slate-950/50 border border-slate-950 rounded-xl p-3 space-y-3">
                  {act.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5">
                      <img
                        src={comment.avatar}
                        alt={comment.userName}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 text-[11px] bg-slate-900 border border-slate-850 px-3 py-2 rounded-xl">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans mb-1">
                          <span className="font-bold text-slate-300">{comment.userName}</span>
                          <span>{comment.timestamp}</span>
                        </div>
                        <p className="text-slate-200 font-sans leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 寫留言框 */}
              <div className="flex gap-2.5 pt-1">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces"
                  alt="牧傳奇"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="我想對這則動態吐槽一句..."
                    value={commentInputs[act.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [act.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommentSubmit(act.id);
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none"
                  />
                  <button
                    onClick={() => handleCommentSubmit(act.id)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-xl border border-slate-700 hover:text-white transition-all"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 右邊：好友列表與一鍵聯動 PING 邀請 */}
      <div className="w-full lg:w-80 space-y-6">
        {/* 好友列表 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Users size={14} className="text-indigo-400" />
              我的聯能玩夥伴 (4)
            </h3>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="space-y-3.5">
            {[
              { name: '亮亮', game: '霧鎖王國', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', state: '連線中' },
              { name: '神隱阿翔', game: '霧鎖王國', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', state: '連線中' },
              { name: '小瑜 (做評測的創作者)', game: 'Hollow Knight', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', state: '寫評測中' },
              { name: '種田達人阿明', game: 'Stardew Valley', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', state: '休眠' }
            ].map((friend, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-slate-950 ${
                      friend.state === '連線中' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{friend.name}</h4>
                    <p className="text-[10px] text-slate-500">正在玩: {friend.game}</p>
                  </div>
                </div>

                {friend.state === '連線中' ? (
                  <button
                    onClick={() => handleCoopPing(friend.name, friend.game)}
                    className="text-[10px] bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-2 py-1 rounded-md transition-all font-semibold"
                  >
                    邀請 (Ping)
                  </button>
                ) : (
                  <span className="text-[9px] text-slate-600 px-2 py-1">離線中</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 本期活動挑戰 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-3.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex gap-2 items-center text-xs font-bold text-slate-200">
            <span className="p-1 rounded bg-amber-500/10 text-amber-400">
              <Flame size={14} />
            </span>
            <h3>社群短評話題挑戰 (Review Event)</h3>
          </div>

          <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-850">
            <h4 className="text-xs font-bold text-indigo-400">#用一張截圖證明你玩過黑帝斯</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
              上傳你在地獄最難熬、被狂虐到痛不欲生或是爽快斬殺老爹的心得，並寫上一句真心好評！
            </p>
          </div>

          <div className="text-[10px] text-slate-400 space-y-1 border-t border-slate-800 pt-3">
            <div className="flex justify-between font-semibold">
              <span>本期參與人數:</span>
              <span className="text-indigo-300">128 人已參與</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>剩餘天數:</span>
              <span className="text-amber-400">剩餘 3 天</span>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
