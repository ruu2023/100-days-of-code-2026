'use client';

import { useState, useRef } from 'react';
import { Video, Image, X, Send } from 'lucide-react';

interface TweetFormProps {
  onTweet: (content: string, videoBlob: Blob | null, thumbnailBlob: Blob | null) => void;
}

export default function TweetForm({ onTweet }: TweetFormProps) {
  const [content, setContent] = useState('');
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const maxLength = 140;
  const remaining = maxLength - content.length;
  const isOverLimit = remaining < 0;

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoBlob(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailBlob(file);
      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isOverLimit) return;

    onTweet(content, videoBlob, thumbnailBlob);

    // Reset form
    setContent('');
    setVideoPreview(null);
    setVideoBlob(null);
    setThumbnailPreview(null);
    setThumbnailBlob(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const removeVideo = () => {
    setVideoPreview(null);
    setVideoBlob(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeThumbnail = () => {
    setThumbnailPreview(null);
    setThumbnailBlob(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border-b border-slate-200 p-4">
      <div className="flex gap-3">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          <Video size={18} />
        </div>

        <div className="flex-1">
          {/* Tweet content */}
          <textarea
            placeholder="今何在想う？ (140文字以内)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-lg text-slate-800 placeholder-slate-400 border-none outline-none resize-none bg-transparent min-h-[80px]"
            rows={3}
          />

          {/* Video preview */}
          {videoPreview && (
            <div className="relative mt-2 inline-block">
              <video
                src={videoPreview}
                controls
                className="max-h-40 rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Thumbnail preview */}
          {thumbnailPreview && (
            <div className="relative mt-2 inline-block">
              <img
                src={thumbnailPreview}
                alt="Thumbnail"
                className="max-h-40 rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              {/* Video upload */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="p-2 text-sky-500 hover:bg-sky-50 rounded-full cursor-pointer transition-colors"
                title="動画をアップロード"
              >
                <Video size={20} />
              </label>

              {/* Thumbnail upload */}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail-upload"
              />
              <label
                htmlFor="thumbnail-upload"
                className="p-2 text-sky-500 hover:bg-sky-50 rounded-full cursor-pointer transition-colors"
                title="サムネイル画像をアップロード"
              >
                <Image size={20} />
              </label>
            </div>

            <div className="flex items-center gap-3">
              {/* Character count */}
              <span
                className={`text-xs font-mono ${
                  remaining < 0
                    ? 'text-red-500 font-bold'
                    : remaining < 20
                    ? 'text-orange-500'
                    : 'text-slate-400'
                }`}
              >
                {remaining}
              </span>

              <button
                type="submit"
                disabled={!content.trim() || isOverLimit}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-full font-bold text-sm hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
                ポスト
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
