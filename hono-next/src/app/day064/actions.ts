"use server";

export async function ocrImage(formData: FormData): Promise<{
  lines: Array<{ id: number; text: string; confidence: number }>;
  text: string;
  image_info?: { width: number; height: number };
}> {
  "use server";

  const file = formData.get('file') as File | null;

  if (!file) {
    throw new Error('ファイルが選択されていません');
  }

  const externalFormData = new FormData();
  externalFormData.append('file', file);

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
