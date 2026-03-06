"use server";

export async function ocrImage(
  arrayBuffer: ArrayBuffer,
  fileName: string,
  contentType: string
): Promise<{
  lines: Array<{ id: number; text: string; confidence: number }>;
  text: string;
  image_info?: { width: number; height: number };
}> {
  const blob = new Blob([arrayBuffer], { type: contentType });

  const externalFormData = new FormData();
  externalFormData.append('file', blob, fileName);

  const apiUrl = process.env.NDLOCR_URL || 'http://localhost:8080';

  const response = await fetch(`${apiUrl}/ocr`, {
    method: 'POST',
    body: externalFormData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OCR APIエラー: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * レシートOCR結果からAIで情報を抽出する
 */
export async function analyzeReceiptWithAI(
  ocrText: string
): Promise<string> {
  const cleanText = ocrText;

  const prompt = `以下のレシートテキストから店舗名、住所、日付、合計金額、支払方法、商品一覧を抽出してJSON形式で出力してください。

【重要な抽出ルール】
1. 「合計」の横にある数字が合計金額（例：合計 327）
2. 支払方法は「QUICPay支払」「現金支払」「カード支払」「PayPay」などを抽出
3. 日付は「2026年3月5日」のように「YYYY年MM月DD日」形式で出力
4. 商品は「商品名 価格」のペアで抽出（例：ワールドCフルーティ5 327）

レシートテキスト:
${cleanText}

出力形式:
{
  "storeName": "店舗名",
  "address": "住所",
  "phone": "電話番号",
  "registrationNumber": "登録番号",
  "date": "YYYY年MM月DD日",
  "time": "HH:MM",
  "totalAmount": 合計金額（数値）,
  "paymentMethod": "支払方法",
  "items": [
    { "name": "商品名", "price": 価格（数値） }
  ]
}`;

  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'lfm2.5';

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI分析エラー: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.message?.content || '';
}

/**
 * レシートOCR結果からルールベースで情報を抽出する（高速）
 */
export async function parseReceiptWithRules(
  ocrLines: Array<{ id: number; text: string; confidence: number }>
): Promise<{
  storeName: string | null;
  address: string | null;
  phone: string | null;
  registrationNumber: string | null;
  date: string | null;
  time: string | null;
  totalAmount: number | null;
  paymentMethod: string | null;
  items: Array<{ name: string; price: number }>;
}> {
  const result = {
    storeName: null as string | null,
    address: null as string | null,
    phone: null as string | null,
    registrationNumber: null as string | null,
    date: null as string | null,
    time: null as string | null,
    totalAmount: null as number | null,
    paymentMethod: null as string | null,
    items: [] as Array<{ name: string; price: number }>,
  };

  // 信頼度の低い行を除外（信心度0.4以上）
  const lines = ocrLines.filter(l => l.confidence >= 0.4).map(l => l.text);

  // 店舗名（最初の行から検索）
  const storeNamePattern = /^(.+?(?:店|ストア|SHOP|Mart|超市))$/;
  for (const line of lines.slice(0, 5)) {
    const match = line.match(storeNamePattern);
    if (match) {
      result.storeName = match[1];
      break;
    }
  }

  // 住所（埼玉県、神奈川県などのパターン）
  const addressPattern = /(.{2,3}[都道府県].+?[市区町村].*?(?:町|村|字|丁|番|号))/;
  for (const line of lines) {
    const match = line.match(addressPattern);
    if (match) {
      result.address = match[1];
      break;
    }
  }

  // 電話番号
  const phonePattern = /電話:?(0\d{1,4}-\d{1,4}-\d{4})/;
  for (const line of lines) {
    const match = line.match(phonePattern);
    if (match) {
      result.phone = match[1];
      break;
    }
  }

  // 登録番号
  const regNumPattern = /登録番号:?(T\d+)/;
  for (const line of lines) {
    const match = line.match(regNumPattern);
    if (match) {
      result.registrationNumber = match[1];
      break;
    }
  }

  // 日付と時刻
  const dateTimePattern = /(\d{4})年(\d{1,2})月(\d{1,2})日.*?(\d{1,2}):(\d{2})/;
  for (const line of lines) {
    const match = line.match(dateTimePattern);
    if (match) {
      result.date = `${match[1]}年${match[2]}月${match[3]}日`;
      result.time = `${match[4]}:${match[5]}`;
      break;
    }
  }

  // 合計金額（「合計」「請求金額」以降にある3桁数字）
  const totalPattern = /(?:合計|請求金額|支払金額|総額)[\s\:]*(?:¥|￥|\s)*(\d{1,3}(?:,\d{3})*)/;
  for (const line of lines) {
    const match = line.match(totalPattern);
    if (match) {
      result.totalAmount = parseInt(match[1].replace(/,/g, ''), 10);
      break;
    }
  }

  // 支払方法
  const paymentPatterns = [
    /(.+?支払)$/,
    /(QUICPay|現金|PayPay|バーコードPay|カード|交通系IC)$/,
  ];
  for (const line of lines) {
    for (const pattern of paymentPatterns) {
      const match = line.match(pattern);
      if (match && !line.includes('----')) {
        result.paymentMethod = match[1];
        break;
      }
    }
    if (result.paymentMethod) break;
  }

  // 商品リスト（商品名の後に価格が来るパターン）
  // 重複をチェックしながら抽出
  const itemMap = new Map<string, { name: string; price: number }>();
  const itemPattern = /^(.+?)\s+(¥|￥)?(\d{1,3}(?:,\d{3})*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 商品候補除外パターン
    if (
      line.includes('合計') ||
      line.includes('領収証') ||
      line.includes('----') ||
      line.includes('支払') ||
      line.includes('カード') ||
      line.includes('有効') ||
      line.includes('承認')
    ) {
      continue;
    }

    const match = line.match(itemPattern);
    if (match) {
      const name = match[1].trim();
      const price = parseInt(match[3].replace(/,/g, ''), 10);

      // 価格が適切な範囲（10円〜10万円）
      if (price >= 10 && price <= 100000 && name.length >= 2) {
        if (!itemMap.has(name)) {
          itemMap.set(name, { name, price });
        }
      }
    }
  }

  result.items = Array.from(itemMap.values());

  return result;
}
