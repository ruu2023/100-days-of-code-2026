"use client"

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 型定義
interface LanguageData {
  name: string;
  count: number;
}

export function TechStackChart() {
  const [data, setData] = useState<LanguageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/ruu2023/100-days-of-code-2026/languages');
        const rawData = (await response.json()) as Record<string, number>;

        // GitHub API のレスポンス { "TypeScript": 1234, "Go": 567 } を
        // 配列 [{ name: "TypeScript", count: 1234 }, ...] に変換
        const formattedData = Object.entries(rawData)
          .map(([name, count]) => ({
            name,
            count: count as number,
          }))
          // バイト数が多い順に並び替え
          .sort((a, b) => b.count - a.count);

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching GitHub languages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  if (loading) {
    return <Card className="w-full h-[300px] flex items-center justify-center">Loading...</Card>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Languages in 100-days-of-code-2026</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{ fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                // バイト数を見やすくするためにフォーマット（任意）
                // formatter={(value: number) => [`${value.toLocaleString()} bytes`, 'Size']}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}