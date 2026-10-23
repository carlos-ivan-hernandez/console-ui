import {useEffect, useState} from 'react';

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** True when every character of `query` appears in `text`, in order (case-insensitive). */
export const fuzzyMatch = (text: string, query: string) => {
  const t = text.toLowerCase();
  let at = 0;
  for (const ch of query.toLowerCase()) {
    at = t.indexOf(ch, at);
    if (at === -1) return false;
    at++;
  }
  return true;
};

/** True when the window is at least `minWidth` px wide (two panes side by side). */
export const useWideLayout = (minWidth = 900) => {
  const query = `(min-width: ${minWidth}px)`;
  const [wide, setWide] = useState(() => globalThis.matchMedia(query).matches);
  useEffect(() => {
    const mq = globalThis.matchMedia(query);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return wide;
};

/** The current time, refreshed every 15 seconds. */
export const useClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(timer);
  }, []);
  return now;
};

/** HH:MM, for the right end of a status bar. */
export const Clock = () => <span>{useClock().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>;

/** A small preference kept in localStorage as JSON. Falls back to memory when storage is unavailable. */
export const useStoredState = <T,>(key: string, fallback: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  });
  const set = (next: T) => {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Still works for this session.
    }
  };
  return [value, set] as const;
};

const readSet = (storageKey: string): Set<string> => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return new Set(Array.isArray(stored) ? stored.filter(k => typeof k === 'string') : []);
  } catch {
    return new Set();
  }
};

const saveSet = (storageKey: string, next: Set<string>) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...next]));
  } catch {
    // Folding still works for this session.
  }
  return next;
};

/** Which sections are folded, remembered on this device under `storageKey`. */
export const useFolded = (storageKey: string) => {
  const [folded, setFolded] = useState(() => readSet(storageKey));

  const toggleFold = (key: string) =>
    setFolded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return saveSet(storageKey, next);
    });

  const setAllFolded = (keys: string[], fold: boolean) =>
    setFolded(prev => {
      const next = new Set(prev);
      for (const key of keys) {
        if (fold) next.add(key);
        else next.delete(key);
      }
      return saveSet(storageKey, next);
    });

  return {folded, toggleFold, setAllFolded};
};

/** A set of selected ids (`v` / ⌘-click in vera-console). */
export const useSelection = () => {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const clear = () => setSelected(new Set());
  return {selected, toggle, clear, setSelected};
};
