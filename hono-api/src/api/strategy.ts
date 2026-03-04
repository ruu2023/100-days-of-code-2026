// src/api/strategy.ts
// Strategy Pattern Demo - 支払い方法を選択できるAPI

import type { Env } from "@/lib/auth";
import { Hono } from "hono";

// -----------------------------------------------------------------------------
// Strategy Pattern: 支払い方法的インターフェース
// -----------------------------------------------------------------------------

interface PaymentStrategy {
  process(amount: number): Promise<{ success: boolean; message: string; transactionId?: string }>;
  getName(): string;
}

// 具体Strategy 1: クレジットカード
class CreditCardPayment implements PaymentStrategy {
  async process(amount: number) {
    const txId = `cc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      success: true,
      message: `クレジットカードで${amount}円を決済しました`,
      transactionId: txId,
    };
  }
  getName() { return "credit_card"; }
}

// 具体Strategy 2: PayPay
class PayPayPayment implements PaymentStrategy {
  async process(amount: number) {
    const txId = `pp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      success: true,
      message: `PayPayで${amount}円を決済しました`,
      transactionId: txId,
    };
  }
  getName() { return "paypay"; }
}

// 具体Strategy 3: 銀行振込
class BankTransferPayment implements PaymentStrategy {
  async process(amount: number) {
    const txId = `bn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      success: true,
      message: `銀行振込で${amount}円の手続きました。振込先: ${this.getAccount()}`,
      transactionId: txId,
    };
  }
  getName() { return "bank_transfer"; }
  private getAccount() {
    return "三菱UFJ銀行 (1234567)";
  }
}

// -----------------------------------------------------------------------------
// Strategy Factory: 支払い方法を選択
// -----------------------------------------------------------------------------

const paymentStrategies: Record<string, PaymentStrategy> = {
  credit_card: new CreditCardPayment(),
  paypay: new PayPayPayment(),
  bank_transfer: new BankTransferPayment(),
};

function getPaymentStrategy(type: string): PaymentStrategy | null {
  return paymentStrategies[type] ?? null;
}

// -----------------------------------------------------------------------------
// API Routes
// -----------------------------------------------------------------------------

const strategyApp = new Hono<{ Bindings: Env }>();

// 支払い方法一覧を返す
strategyApp.get("/methods", (ctx) => {
  return ctx.json({
    methods: [
      { type: "credit_card", name: "クレジットカード", description: "Visa, Mastercard, JCB対応" },
      { type: "paypay", name: "PayPay", description: "QRコード決済" },
      { type: "bank_transfer", name: "銀行振込", description: "三菱UFJ銀行" },
    ],
  });
});

// 決済を実行（ストラテジーパターンで支払い方法を選択）
strategyApp.post("/pay", async (ctx) => {
  const body = await ctx.req.json<{ amount: number; method: string }>();
  const { amount, method } = body;

  if (!amount || amount <= 0) {
    return ctx.json({ error: "有効な金額を指定してください" }, 400);
  }

  const strategy = getPaymentStrategy(method);
  if (!strategy) {
    return ctx.json({ error: "無効な支払い方法です" }, 400);
  }

  const result = await strategy.process(amount);

  return ctx.json({
    method: strategy.getName(),
    amount,
    ...result,
  });
});

export { strategyApp as strategyPatternApp };
