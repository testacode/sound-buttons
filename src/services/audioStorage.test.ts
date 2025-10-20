import { describe, it, expect, beforeEach, vi } from 'vitest';
import { audioStorage } from './audioStorage';

// Mock IndexedDB more thoroughly
const mockDB = {
  transaction: vi.fn(() => ({
    objectStore: vi.fn(() => ({
      put: vi.fn(() => ({
        onsuccess: null,
        onerror: null,
      })),
      get: vi.fn(() => ({
        onsuccess: null,
        onerror: null,
        result: null,
      })),
      delete: vi.fn(() => ({
        onsuccess: null,
        onerror: null,
      })),
      index: vi.fn(() => ({
        openCursor: vi.fn(() => ({
          onsuccess: null,
          onerror: null,
        })),
      })),
    })),
  })),
  objectStoreNames: {
    contains: vi.fn(() => false),
  },
  createObjectStore: vi.fn(() => ({
    createIndex: vi.fn(),
  })),
};

beforeEach(() => {
  vi.clearAllMocks();

  // Reset IndexedDB mock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).indexedDB = {
    open: vi.fn(() => ({
      result: mockDB,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    })),
  };
});

describe('AudioStorage Service', () => {
  it('should have init method', () => {
    expect(audioStorage.init).toBeDefined();
    expect(typeof audioStorage.init).toBe('function');
  });

  it('should have saveRecording method', () => {
    expect(audioStorage.saveRecording).toBeDefined();
    expect(typeof audioStorage.saveRecording).toBe('function');
  });

  it('should have getRecordings method', () => {
    expect(audioStorage.getRecordings).toBeDefined();
    expect(typeof audioStorage.getRecordings).toBe('function');
  });

  it('should have deleteRecording method', () => {
    expect(audioStorage.deleteRecording).toBeDefined();
    expect(typeof audioStorage.deleteRecording).toBe('function');
  });

  it('should have updateRecording method', () => {
    expect(audioStorage.updateRecording).toBeDefined();
    expect(typeof audioStorage.updateRecording).toBe('function');
  });

  it('should call indexedDB.open on init', async () => {
    const openSpy = vi.spyOn(global.indexedDB, 'open');

    // Simulate successful init
    const initPromise = audioStorage.init();
    const openRequest = openSpy.mock.results[0]?.value;

    if (openRequest && openRequest.onsuccess) {
      openRequest.onsuccess();
    }

    await initPromise;

    expect(openSpy).toHaveBeenCalledWith('SoundButtonsDB', 1);
  });
});
