import {useEffect, useRef} from 'react';

/** How long a half-typed sequence like `g` (of `gg`) waits for its next key. */
export const SEQUENCE_TIMEOUT_MS = 1000;

/** Named keys a keymap can bind. Anything else is a single character, or a sequence of them. */
const NAMED_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  'Tab',
  'S-Tab',
  'Enter',
  'Escape',
  'Space',
  'Backspace',
  'Delete',
]);

const MODIFIERS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock']);

/**
 * Whether a global key handler should leave this event alone: keys a dialog or
 * input already handled, browser shortcuts, and typing inside text fields or overlays.
 */
export const isForeignKey = (e: KeyboardEvent) => {
  // A handled key can still reach a global listener that re-attached mid-event
  // after the dialog that handled it closed.
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return true;
  return e.target instanceof Element && Boolean(e.target.closest('input, textarea, [contenteditable], .overlay'));
};

export type KeyHandler = (e: KeyboardEvent) => void;

/**
 * Maps keys to handlers. A binding can list alternatives separated by spaces:
 *
 * ```ts
 * {
 *   'j ArrowDown': down,
 *   'gg Home': top,     // `gg` is a two-key sequence
 *   'S-Tab': prevPane,  // shift+tab
 *   'Space x': toggle,  // the space bar is `Space`
 * }
 * ```
 */
export type Keymap = Record<string, KeyHandler | undefined>;

export interface KeymapOptions {
  /** Listen only while true, e.g. while this tab is visible. Default true. */
  enabled?: boolean;
  /** Runs before every key the keymap sees, bound or not (vera-console clears its message here). */
  onKey?: (e: KeyboardEvent) => void;
  /** Runs for keys with no binding. Useful for "press y to confirm, anything else cancels". */
  onUnbound?: (e: KeyboardEvent) => void;
}

const compile = (keymap: Keymap) => {
  const bindings = new Map<string, KeyHandler>();
  const prefixes = new Set<string>();
  for (const [spec, handler] of Object.entries(keymap)) {
    if (!handler) continue;
    for (const key of spec.split(/\s+/).filter(Boolean)) {
      bindings.set(key, handler);
      if (!NAMED_KEYS.has(key)) {
        for (let i = 1; i < key.length; i++) prefixes.add(key.slice(0, i));
      }
    }
  }
  return {bindings, prefixes};
};

/**
 * Vim-style normal-mode keys on the whole window. Sequences like `gg`, `dd` and
 * `za` work out of the box; a sequence waits one second for its next key.
 * Typing in inputs, keys inside `.overlay` dialogs and browser shortcuts
 * (⌘/Ctrl/Alt) are left alone.
 */
export const useKeymap = (keymap: Keymap, {enabled = true, onKey, onUnbound}: KeymapOptions = {}) => {
  // Handlers change every render; the listener always reads the newest ones.
  const latest = useRef({keymap, onKey, onUnbound});
  useEffect(() => {
    latest.current = {keymap, onKey, onUnbound};
  });
  const pending = useRef<{seq: string; at: number} | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const listener = (e: KeyboardEvent) => {
      if (isForeignKey(e) || MODIFIERS.has(e.key)) return;
      const {keymap: map, onKey: before, onUnbound: unbound} = latest.current;
      const {bindings, prefixes} = compile(map);
      const name = e.key === ' ' ? 'Space' : e.key === 'Tab' && e.shiftKey ? 'S-Tab' : e.key;
      const isChar = name.length === 1;

      const waiting = pending.current;
      pending.current = null;
      const prefix = waiting && isChar && Date.now() - waiting.at < SEQUENCE_TIMEOUT_MS ? waiting.seq : '';

      before?.(e);
      // A shift+tab binding falls back to plain Tab when only Tab is bound.
      const candidates = [prefix + name, ...(prefix ? [name] : []), ...(name === 'S-Tab' ? ['Tab'] : [])];
      for (const seq of candidates) {
        const handler = bindings.get(seq);
        if (handler) {
          e.preventDefault();
          handler(e);
          return;
        }
        if (isChar && prefixes.has(seq)) {
          e.preventDefault();
          pending.current = {seq, at: Date.now()};
          return;
        }
      }
      unbound?.(e);
    };
    globalThis.addEventListener('keydown', listener);
    return () => globalThis.removeEventListener('keydown', listener);
  }, [enabled]);
};
