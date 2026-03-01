'use client';

import { useState, useEffect, useCallback } from 'react';
import { Twitter, LogIn } from 'lucide-react';
import TweetForm from '../components/TweetForm';
import TweetList from '../components/TweetList';
import type { Tweet as TweetType, User } from '../types';
import { apiFetch } from '@/lib/api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export default function TwitterPage() {
  const [tweets, setTweets] = useState<TweetType[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tweets and check auth on mount
  useEffect(() => {
    loadTweets();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await apiFetch('/api/me');
      if (res.ok) {
        const user = await res.json();
        if (user.id) {
          setCurrentUser(user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const loadTweets = async () => {
    try {
      const res = await apiFetch('/api/day060/tweets');
      if (res.ok) {
        const data = await res.json();
        setTweets(data.tweets || []);
      }
    } catch (error) {
      console.error('Failed to load tweets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTweet = useCallback(async (content: string, videoBlob: Blob | null, thumbnailBlob: Blob | null) => {
    if (!currentUser) {
      alert('ログインしてください');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    if (videoBlob) {
      formData.append('video', videoBlob);
    }
    if (thumbnailBlob) {
      formData.append('thumbnail', thumbnailBlob);
    }

    const res = await apiFetch('/api/day060/tweets', {
      method: 'POST',
      // Note: Don't set Content-Type header for FormData
      body: formData,
    });

    if (res.ok) {
      await loadTweets();
    } else {
      const error = await res.json();
      alert(error.error || '投稿に失敗しました');
    }
  }, [currentUser]);

  const handleDelete = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/day060/tweets/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      await loadTweets();
    } else {
      const error = await res.json();
      alert(error.error || '削除に失敗しました');
    }
  }, []);

  const handleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/oauth/google?callbackURL=${encodeURIComponent(window.location.href)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
              <Twitter size={18} className="text-white" />
            </div>
            <h1 className="font-bold text-slate-900">ホーム</h1>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              {currentUser.image && (
                <img
                  src={currentUser.image}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-slate-700">{currentUser.name}</span>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-3 py-1.5 bg-sky-500 text-white rounded-full text-sm font-medium hover:bg-sky-400 transition-colors"
            >
              <LogIn size={16} />
              ログイン
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-xl mx-auto bg-white border-x border-slate-200 min-h-screen">
        {/* Tweet form - only show when logged in */}
        {currentUser ? (
          <TweetForm onTweet={handleTweet} />
        ) : (
          <div className="p-4 border-b border-slate-200 text-center">
            <p className="text-slate-500">ログインして投稿しましょう</p>
          </div>
        )}

        {/* Tweet list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <TweetList
            tweets={tweets}
            currentUserId={currentUser?.id || ''}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}