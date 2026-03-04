"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, Calculator, PieChart, Receipt, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface ReportType {
  type: string;
  name: string;
  description: string;
}

interface ReportResult {
  type: string;
  fileName: string;
  contentType: string;
  content: string;
}

export default function AccountingPage() {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('expense');
  const [year, setYear] = useState<number>(2025);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 帳票タイプ一覧を取得
  useEffect(() => {
    apiFetch('/api/accounting/report-types')
      .then(res => res.json())
      .then(data => {
        if (data.types) setReportTypes(data.types);
      })
      .catch(console.error);
  }, []);

  // 帳票生成
  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await apiFetch('/api/accounting/report', {
        method: 'POST',
        body: JSON.stringify({ type: selectedType, year }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '帳票生成に失敗しました');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ダウンロード
  const downloadReport = () => {
    if (!result) return;
    const blob = new Blob([result.content], { type: result.contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'csv':
        return <FileText className="w-6 h-6" />;
      case 'bluewhite':
        return <Calculator className="w-6 h-6" />;
      case 'expense':
        return <PieChart className="w-6 h-6" />;
      default:
        return <Receipt className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">会計帳票作成</h1>
              <p className="text-slate-500 text-sm">ストラテジーパターンデモ - 個人事業主向け</p>
            </div>
          </div>
        </header>

        {/* 帳票タイプ選択 */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            帳票タイプを選択
          </h2>

          <div className="grid gap-3 md:grid-cols-3 mb-6">
            {reportTypes.map(rt => (
              <button
                key={rt.type}
                onClick={() => setSelectedType(rt.type)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedType === rt.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className={`mb-2 ${selectedType === rt.type ? 'text-blue-600' : 'text-slate-400'}`}>
                  {getIcon(rt.type)}
                </div>
                <div className="font-semibold text-slate-900">{rt.name}</div>
                <div className="text-sm text-slate-500 mt-1">{rt.description}</div>
              </button>
            ))}
          </div>

          {/* 年度選択 */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-slate-700">年度:</label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={2025}>2025年</option>
              <option value={2024}>2024年</option>
              <option value={2023}>2023年</option>
            </select>
          </div>

          {/* 生成ボタン */}
          <button
            onClick={generateReport}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                帳票を生成
              </>
            )}
          </button>

          {/* エラー表示 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
        </section>

        {/* 結果表示 */}
        {result && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-900">{result.fileName}</h3>
                <p className="text-xs text-slate-500">{result.contentType}</p>
              </div>
              <button
                onClick={downloadReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                ダウンロード
              </button>
            </div>

            <div className="p-6">
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 bg-slate-50 p-4 rounded-lg overflow-x-auto border border-slate-200">
                {result.content}
              </pre>
            </div>
          </section>
        )}

        {/* ストラテジーパターン説明 */}
        <section className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">ストラテジーパターンとは</h3>
          <p className="text-sm text-blue-800 mb-3">
            アルゴリズム（帳票出力）を互いに替えられるように設計するパターンです。
            新しい帳票フォーマットを追加しても、既存のコードを変更する必要がありません。
          </p>
          <div className="flex flex-wrap gap-2">
            {['CSV', 'XML', 'Markdown'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-white text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
