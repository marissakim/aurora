import { useState, useEffect } from 'react';

/**
 * Like useState, but syncs to localStorage under the given key.
 * Gracefully handles missing / corrupted data by falling back to `initial`.
 * Values are JSON-serialized; don't store non-serializable types (like Set)
 * directly — convert to/from arrays at the boundary.
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return initial;
      return JSON.parse(stored);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      if (value === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Quota exceeded, private browsing, etc. — silently ignore
    }
  }, [key, value]);

  return [value, setValue];
}

/**
 * Clear every key Eve owns — used by the "Start over" action.
 */
export function clearAllEveStorage() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('eve:')) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
