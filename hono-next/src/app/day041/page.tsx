"use client";

import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, MessageSquare } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  score: number;
  comments: number;
  source: 'HackerNews' | 'Reddit';
}

export default function TechPulseApp() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'HackerNews' | 'Reddit'>('HackerNews');

  const fetchNews = async () => {
    setLoading(true);
    try {
      if (tab === 'HackerNews') {
        const res = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page');
        const data = await res.json();
        setItems(data.hits.map((h: any) => ({
          id: h.objectID,
          title: h.title,
          url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
          score: h.points,
          comments: h.num_comments,
          source: 'HackerNews'
        })));
      } else {
        const res = await fetch('https://www.reddit.com/r/programming/top.json?limit=20');
        const data = await res.json();
        setItems(data.data.children.map((c: any) => ({
          id: c.data.id,
          title: c.data.title,
          url: c.data.url,
          score: c.data.ups,
          comments: c.data.num_comments,
          source: 'Reddit'
        })));
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, [tab]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-indigo-600">TechPulse</h1>
            <p className="text-gray-500 text-sm">News Aggregator</p>
          </div>
          <button
            onClick={fetchNews}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
          {(['HackerNews', 'Reddit'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === t ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t === 'HackerNews' ? 'Hacker News' : 'Reddit /r/prog'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-semibold text-lg leading-tight group-hover:text-indigo-600">
                    {item.title}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1 font-medium text-orange-500">
                    ▲ {item.score}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> {item.comments}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-400 capitalize">
                    {item.source}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
