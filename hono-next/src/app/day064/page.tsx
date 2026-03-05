"use client";

import React, { useState, useMemo, useRef } from 'react';
import { Search, AlertCircle, CheckCircle2, Trash2, Copy, FileJson, LayoutList, Type, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ocrImage } from './actions';

type OcrLine = {
  id: number;
  text: string;
  confidence: number;
  boundingBox?: number[][];
  isVertical?: string;
  isTextline?: string;
};

type ParsedData = {
  lines: OcrLine[];
  text: string;
  image_info?: { width: number; height: number };
};

const OcrParserPage = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.4);
  const [activeTab, setActiveTab] = useState<'table' | 'raw'>('table');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleOcrApi = async () => {
    if (!selectedFile) {
      setError("画像を選択してください");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const data = await ocrImage(formData);
      setParsedData(data);
    } catch (err) {
      setError("OCR処理エラー: " + (err instanceof Error ? err.message : String(err)));
      setParsedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParse = () => {
    try {
      if (!jsonInput.trim()) {
        setError("JSONを入力してください");
        return;
      }
      const data = JSON.parse(jsonInput);
      if (!data.lines || !Array.isArray(data.lines)) {
        throw new Error("有効なOCRレスポンス形式ではありません（'lines'配列が見つかりません）");
      }
      setParsedData(data);
      setError(null);
    } catch (err) {
      setError("解析エラー: " + (err instanceof Error ? err.message : String(err)));
      setParsedData(null);
    }
  };

  const filteredLines = useMemo(() => {
    if (!parsedData) return [];
    return parsedData.lines.filter(line => line.confidence >= confidenceThreshold);
  }, [parsedData, confidenceThreshold]);

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (conf >= 0.5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setJsonInput('');
    setParsedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <FileJson className="text-blue-600" />
            NDL OCR Parser
          </h1>
          <p className="text-slate-500 mt-2">画像からOCRを実行し、結果を可視化します。</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Input Section */}
          <div className="xl:col-span-4 space-y-4">
            {/* Image Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">画像アップロード</span>
                <button
                  onClick={clearAll}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div
                className="p-4"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!previewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                  >
                    <Upload className="mx-auto mb-3 text-slate-400" size={32} />
                    <p className="text-sm text-slate-500">クリックまたはドラッグ＆ドロップ</p>
                    <p className="text-xs text-slate-400 mt-1">JPEG, PNG, TIFF, BMP対応</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-auto max-h-[200px] object-contain"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <button
                      onClick={handleOcrApi}
                      disabled={isLoading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          処理中...
                        </>
                      ) : (
                        <>
                          <ImageIcon size={18} />
                          OCR実行
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* JSON Input */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">JSON Input</span>
                <button
                  onClick={() => setJsonInput('')}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                className="w-full h-[200px] p-4 font-mono text-xs focus:outline-none resize-none"
                placeholder='Paste OCR JSON here...'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <div className="p-4 bg-white border-t border-slate-100">
                <button
                  onClick={handleParse}
                  className="w-full py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  JSONを解析
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="xl:col-span-8">
            {!parsedData ? (
              <div className="h-full flex flex-col items-center justify-center bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl p-12 text-slate-400 min-h-[400px]">
                <FileJson size={48} className="mb-4 opacity-20" />
                <p>画像をアップロードするか、JSONを貼り付けてください</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Controls & Tabs */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab('table')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <LayoutList size={16} /> 表形式
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'raw' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Type size={16} /> テキスト抽出
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      信頼度しきい値: {Math.round(confidenceThreshold * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                      className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {activeTab === 'table' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">#</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">認識テキスト</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase w-24 text-right">信頼度</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLines.map((line) => (
                            <tr key={line.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="p-4 text-xs text-slate-400 font-mono">{line.id}</td>
                              <td className="p-4 text-sm font-medium text-slate-700 group">
                                <div className="flex items-center justify-between">
                                  <span>{line.text}</span>
                                  <button
                                    onClick={() => copyToClipboard(line.text)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-all"
                                    title="Copy text"
                                  >
                                    <Copy size={14} />
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getConfidenceColor(line.confidence)}`}>
                                  {Math.round(line.confidence * 100)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'raw' && (
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-800">抽出テキスト全文</h4>
                        <button
                          onClick={() => parsedData.text && copyToClipboard(parsedData.text)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Copy size={14} /> コピー
                        </button>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 font-serif text-lg leading-relaxed text-slate-800 whitespace-pre-wrap">
                        {parsedData.text}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <div>
                      総行数: <strong>{parsedData.lines.length}</strong> |
                      表示中: <strong>{filteredLines.length}</strong>
                    </div>
                    {parsedData.image_info && (
                      <div>
                        画像サイズ: {parsedData.image_info.width} × {parsedData.image_info.height}
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Info */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="text-blue-500" size={20} />
                  <div className="text-sm text-blue-700">
                    <span className="font-bold">ヒント:</span> 「信頼度しきい値」を調整することで、かすれや汚れによる誤認識行をフィルタリングできます。
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* License Attribution */}
      <div className="text-xs text-slate-400 text-center pt-4">
        <p>
          OCR機能:{' '}
          <a
            href="https://github.com/ndl-lab/ndlocr-lite"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            ndlocr-lite
          </a>
          {' '}(<a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            CC-BY-4.0
          </a>)
        </p>
      </div>
    </div>
  );
};

export default OcrParserPage;
