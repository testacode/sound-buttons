import type { Recording } from '@/types/audio';

const DB_NAME = 'SoundButtonsDB';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

type DBRecording = Omit<Recording, 'blob' | 'createdAt'> & {
  blobData: ArrayBuffer;
  blobType: string;
  createdAt: string;
};

class AudioStorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    return this.db;
  }

  async saveRecording(recording: Recording): Promise<void> {
    const db = await this.ensureDB();
    const blobData = await recording.blob.arrayBuffer();

    const dbRecording: DBRecording = {
      id: recording.id,
      name: recording.name,
      blobData,
      blobType: recording.blob.type,
      createdAt: recording.createdAt.toISOString(),
      duration: recording.duration,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(dbRecording);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getRecordings(): Promise<Recording[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev'); // Newest first

      const recordings: Recording[] = [];

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const dbRecording = cursor.value as DBRecording;
          const blob = new Blob([dbRecording.blobData], { type: dbRecording.blobType });

          recordings.push({
            id: dbRecording.id,
            name: dbRecording.name,
            blob,
            createdAt: new Date(dbRecording.createdAt),
            duration: dbRecording.duration,
          });

          cursor.continue();
        } else {
          resolve(recordings);
        }
      };
    });
  }

  async deleteRecording(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateRecording(id: string, updates: Partial<Pick<Recording, 'name'>>): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const recording = getRequest.result as DBRecording | undefined;
        if (!recording) {
          reject(new Error('Recording not found'));
          return;
        }

        const updatedRecording = { ...recording, ...updates };
        const putRequest = store.put(updatedRecording);

        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };
    });
  }

  async deleteAllRecordings(): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const audioStorage = new AudioStorageService();
