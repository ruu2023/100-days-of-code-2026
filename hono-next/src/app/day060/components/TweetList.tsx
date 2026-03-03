'use client';

import { Trash2 } from 'lucide-react';
import type { Tweet } from '../types';

interface TweetListProps {
  tweets: Tweet[];
  currentUserId: string;
  onDelete: (id: string) => void;
}

function TweetItem({ tweet, currentUserId, onDelete }: { tweet: Tweet; currentUserId: string; onDelete: (id: string) => void }) {
  const formattedDate = new Date(tweet.createdAt).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isOwn = tweet.userId === currentUserId;

  return (
    <div className="bg-white border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {tweet.user?.name?.[0]?.toUpperCase() || '?'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-900">{tweet.user?.name || 'Anonymous'}</span>
            <span className="text-slate-400 text-sm">· {formattedDate}</span>
          </div>

          {/* Content */}
          <p className="text-slate-800 whitespace-pre-wrap break-words">{tweet.content}</p>

          {/* Video */}
          {tweet.videoUrl && (
            <video
              src={tweet.videoUrl}
              controls
              className="mt-2 max-h-80 rounded-xl border border-slate-200 w-auto"
            />
          )}

          {/* Thumbnail (if no video but has thumbnail) */}
          {!tweet.videoUrl && tweet.thumbnailUrl && (
            <img
              src={tweet.thumbnailUrl}
              alt="Tweet image"
              className="mt-2 max-h-80 rounded-xl border border-slate-200 w-auto"
            />
          )}

          {/* Actions */}
          {isOwn && (
            <button
              onClick={() => onDelete(tweet.id)}
              className="mt-2 flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors text-sm"
            >
              <Trash2 size={14} />
              削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TweetList({ tweets, currentUserId, onDelete }: TweetListProps) {
  if (tweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <p className="text-lg">まだポストがありません</p>
        <p className="text-sm mt-1">ログインして最初のポストを投稿しましょう</p>
      </div>
    );
  }

  return (
    <div>
      {tweets.map((tweet) => (
        <TweetItem
          key={tweet.id}
          tweet={tweet}
          currentUserId={currentUserId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
