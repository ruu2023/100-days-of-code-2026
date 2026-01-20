import Dexie, { type Table } from 'dexie';

export interface SavedImage {
  id?: number;
  blob: Blob;
  name: string;
  type: string;
  timestamp: number;
}

export class PicSpotDatabase extends Dexie {
  images!: Table<SavedImage>;

  constructor() {
    super('PicSpotDB');
    this.version(1).stores({
      images: '++id, timestamp' // Primary key and indexed props
    });
  }
}

export const db = new PicSpotDatabase();
