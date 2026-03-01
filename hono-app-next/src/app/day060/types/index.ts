export interface Tweet {
  id: string;
  content: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date | string;
  userId: string;
  // ユーザー情報（JOIN結果）
  user?: {
    name: string;
    image?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}
