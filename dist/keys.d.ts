/** How long a half-typed sequence like `g` (of `gg`) waits for its next key. */
export declare const SEQUENCE_TIMEOUT_MS = 1000;
/**
 * Whether a global key handler should leave this event alone: keys a dialog or
 * input already handled, browser shortcuts, and typing inside text fields or overlays.
 */
export declare const isForeignKey: (e: KeyboardEvent) => boolean;
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
/**
 * Vim-style normal-mode keys on the whole window. Sequences like `gg`, `dd` and
 * `za` work out of the box; a sequence waits one second for its next key.
 * Typing in inputs, keys inside `.overlay` dialogs and browser shortcuts
 * (⌘/Ctrl/Alt) are left alone.
 */
export declare const useKeymap: (keymap: Keymap, { enabled, onKey, onUnbound }?: KeymapOptions) => void;
