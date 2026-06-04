/* ── Safe localStorage wrapper with `window` guard ── */

const STORAGE_PREFIX = 'Togthr_';

export const storage = {
  get: (key: string): unknown => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${key}`) || 'null');
    } catch {
      return null;
    }
  },
  set: (key: string, value: unknown): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  },
};