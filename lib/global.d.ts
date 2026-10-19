import type Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
    __preloaderDone?: boolean;
  }
}

export {};
