// src/api/accounting.ts
// Accounting App with Strategy Pattern - 帳票出力デモ

import { Hono } from "hono";
import type { Env } from "@/lib/auth";

// -----------------------------------------------------------------------------
// Domain Models
// -----------------------------------------------------------------------------

interface Income {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: "sales" | "other";
}

interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: "office" | "travel" | "supplies" | "software" | "other";
  includesTax: boolean; // 軽減税率対象か
}

// 帳簿データ
interface BookData {
  year: number;
  incomes: Income[];
  expenses: Expense[];
}

// -----------------------------------------------------------------------------
// Strategy Pattern: 帳票出力
// -----------------------------------------------------------------------------

interface ReportStrategy {
  generate(data: BookData): Promise<string>; // ファイル内容（文字列）を返す
  getContentType(): string;
  getFileName(year: number): string;
}

// Strategy 1: CSV出力
class CsvReportStrategy implements ReportStrategy {
  async generate(data: BookData): Promise<string> {
    const lines: string[] = [];

    // 収入
    lines.push("【収入】");
    lines.push("日付,金額,摘要,カテゴリ");
    for (const inc of data.incomes) {
      lines.push(`${inc.date},${inc.amount},"${inc.description}",${inc.category}`);
    }

    // 支出
    lines.push("");
    lines.push("【支出】");
    lines.push("日付,金額,摘要,カテゴリ,税込み");
    for (const exp of data.expenses) {
      lines.push(`${exp.date},${exp.amount},"${exp.description}",${exp.category},${exp.includesTax ? "Yes" : "No"}`);
    }

    // 集計
    const totalIncome = data.incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalIncome - totalExpense;

    lines.push("");
    lines.push("【集計】");
    lines.push(`総収入,${totalIncome}`);
    lines.push(`総支出,${totalExpense}`);
    lines.push(`差引損益,${profit}`);

    return lines.join("\n");
  }

  getContentType() { return "text/csv;charset=utf-8"; }
  getFileName(year: number) { return `keiri_${year}.csv`; }
}

// Strategy 2: 青色白色判定レポート
class BlueWhiteReportStrategy implements ReportStrategy {
  async generate(data: BookData): Promise<string> {
    const lines: string[] = [];

    const totalIncome = data.incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalIncome - totalExpense;

    // 青色白色判定（簡易版）
    // 条件1: 所得が290万円以下
    // 条件2: 事業収支が赤字でない
    const isBlueEligible = profit > 0 && profit <= 2900000;
    const blueTax = isBlueEligible ? Math.min(profit * 0.05, 650000) : 0;

    lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
    lines.push(`<taxReport year="${data.year}">`);
    lines.push(`  <summary>`);
    lines.push(`    <totalIncome>${totalIncome}</totalIncome>`);
    lines.push(`    <totalExpense>${totalExpense}</totalExpense>`);
    lines.push(`    <profit>${profit}</profit>`);
    lines.push(`  </summary>`);
    lines.push(`  <blueWhiteDecision>`);
    lines.push(`    <eligible>${isBlueEligible}</eligible>`);
    lines.push(`    <reason>${isBlueEligible ? "所得290万円以下で黒字" : "青色白色の条件を満たしません"}</reason>`);
    lines.push(`    <estimatedDeduction>${blueTax}</estimatedDeduction>`);
    lines.push(`  </blueWhiteDecision>`);
    lines.push(`</taxReport>`);

    return lines.join("\n");
  }

  getContentType() { return "application/xml;charset=utf-8"; }
  getFileName(year: number) { return `tax_report_${year}.xml`; }
}

// Strategy 3: 経費内訳レポート（カテゴリ別）
class ExpenseCategoryReportStrategy implements ReportStrategy {
  async generate(data: BookData): Promise<string> {
    // カテゴリ別に集計
    const categoryTotals: Record<string, number> = {};
    for (const exp of data.expenses) {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    }

    const lines: string[] = [];
    lines.push(`# 経費内訳書（${data.year}年）`);
    lines.push("");

    const categoryNames: Record<string, string> = {
      office: "オフィス用品",
      travel: "旅費交通費",
      supplies: "消耗品",
      software: "ソフトウェア",
      other: "その他",
    };

    let total = 0;
    for (const [cat, amount] of Object.entries(categoryTotals)) {
      const name = categoryNames[cat] || cat;
      lines.push(`- ${name}: ¥${amount.toLocaleString()}`);
      total += amount;
    }

    lines.push("");
    lines.push(`**合計: ¥${total.toLocaleString()}**`);

    return lines.join("\n");
  }

  getContentType() { return "text/markdown;charset=utf-8"; }
  getFileName(year: number) { return `expense_category_${year}.md`; }
}

// -----------------------------------------------------------------------------
// Strategy Factory
// -----------------------------------------------------------------------------

const reportStrategies: Record<string, ReportStrategy> = {
  csv: new CsvReportStrategy(),
  bluewhite: new BlueWhiteReportStrategy(),
  expense: new ExpenseCategoryReportStrategy(),
};

function getReportStrategy(type: string): ReportStrategy | null {
  return reportStrategies[type] ?? null;
}

// -----------------------------------------------------------------------------
// Mock Data（デモ用）
// -----------------------------------------------------------------------------

const mockBookData: BookData = {
  year: 2025,
  incomes: [
    { id: "1", date: "2025-04-15", amount: 350000, description: "Web制作案件", category: "sales" },
    { id: "2", date: "2025-06-20", amount: 180000, description: "アプリ開発", category: "sales" },
    { id: "3", date: "2025-09-10", amount: 50000, description: "コンサルティング", category: "other" },
  ],
  expenses: [
    { id: "1", date: "2025-04-01", amount: 15000, description: "Office 365", category: "software", includesTax: false },
    { id: "2", date: "2025-05-12", amount: 22000, description: "交通費", category: "travel", includesTax: false },
    { id: "3", date: "2025-07-08", amount: 8500, description: "文具用品", category: "supplies", includesTax: true },
    { id: "4", date: "2025-08-15", amount: 45000, description: "PC購入", category: "office", includesTax: false },
  ],
};

// -----------------------------------------------------------------------------
// API Routes
// -----------------------------------------------------------------------------

const accountingApp = new Hono<{ Bindings: Env }>();

//帳票タイプ一覧
accountingApp.get("/report-types", (ctx) => {
  return ctx.json({
    types: [
      { type: "csv", name: "CSV帳票", description: "Excelで開けるCSV形式" },
      { type: "bluewhite", name: "青色白色判定", description: "XML形式の税務レポート" },
      { type: "expense", name: "経費カテゴリ", description: "Markdown形式経費内訳" },
    ],
  });
});

// 帳票生成
accountingApp.post("/report", async (ctx) => {
  const body = await ctx.req.json<{ type: string; year?: number }>();
  const { type, year = 2025 } = body;

  const strategy = getReportStrategy(type);
  if (!strategy) {
    return ctx.json({ error: "無効な帳票タイプです" }, 400);
  }

  const data = { ...mockBookData, year };
  const content = await strategy.generate(data);

  return ctx.json({
    type,
    fileName: strategy.getFileName(year),
    contentType: strategy.getContentType(),
    content,
  });
});

export { accountingApp as accountingApp };
