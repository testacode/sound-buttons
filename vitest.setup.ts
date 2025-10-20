import '@testing-library/jest-dom';

// Mock window.matchMedia for Mantine
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = () => 'blob:mock-url';
global.URL.revokeObjectURL = () => {};

// Mock MediaRecorder API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).MediaRecorder = class MediaRecorder {
  static isTypeSupported = () => true;
  ondataavailable: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onstop: ((event: Event) => void) | null = null;
  state = 'inactive';

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop(new Event('stop'));
    }
  }

  pause() {}
  resume() {}
  requestData() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
};

// Mock AudioContext
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).AudioContext = class AudioContext {
  createMediaStreamSource() {
    return {
      connect: () => {},
    };
  }

  createAnalyser() {
    return {
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteTimeDomainData: () => {},
    };
  }

  close() {
    return Promise.resolve();
  }
};

// Mock getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: () => Promise.resolve({
      getTracks: () => [{
        stop: () => {},
      }],
    }),
  },
  writable: true,
});

// Mock IndexedDB
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).indexedDB = {
  open: () => ({
    result: {},
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
  }),
};

// Mock crypto.randomUUID
if (!global.crypto) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).crypto = {};
}

if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = () => Math.random().toString(36).substring(2, 15) as `${string}-${string}-${string}-${string}-${string}`;
}
