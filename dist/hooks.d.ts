export declare const plural: (n: number, word: string) => string;
/** True when every character of `query` appears in `text`, in order (case-insensitive). */
export declare const fuzzyMatch: (text: string, query: string) => boolean;
/** True when the window is at least `minWidth` px wide (two panes side by side). */
export declare const useWideLayout: (minWidth?: number) => boolean;
/** The current time, refreshed every 15 seconds. */
export declare const useClock: () => Date;
/** HH:MM, for the right end of a status bar. */
export declare const Clock: () => import("react").JSX.Element;
/** A small preference kept in localStorage as JSON. Falls back to memory when storage is unavailable. */
export declare const useStoredState: <T>(key: string, fallback: T) => readonly [T, (next: T) => void];
/** Which sections are folded, remembered on this device under `storageKey`. */
export declare const useFolded: (storageKey: string) => {
    folded: Set<string>;
    toggleFold: (key: string) => void;
    setAllFolded: (keys: string[], fold: boolean) => void;
};
/** A set of selected ids (`v` / ⌘-click in vera-console). */
export declare const useSelection: () => {
    selected: Set<string>;
    toggle: (id: string) => void;
    clear: () => void;
    setSelected: import("react").Dispatch<import("react").SetStateAction<Set<string>>>;
};
