import { type CSSProperties } from 'react';
/**
 * A color scheme. Only `bg`, `fg` and `accent` are needed; the bars, cursor
 * line, borders, dim text and selection are mixed from them unless set here.
 * Any CSS color works, including `var(...)`.
 */
export interface Theme {
    /** Page background. */
    bg: string;
    /** Text. */
    fg: string;
    /** Active things: cursor, active borders, NORMAL badge, the login banner. */
    accent: string;
    /** Section titles, INSERT/EDIT badges, links. */
    blue?: string;
    /** Selected items, MOVE/HELP badges. */
    purple?: string;
    /** Dates, COMMAND/SEARCH badges, warnings. */
    warn?: string;
    /** Errors and the CONFIRM badge. */
    error?: string;
    /** Top bar and status bar. */
    bgBar?: string;
    /** The line under the cursor. */
    bgCursor?: string;
    bgSelection?: string;
    bgSearchMatch?: string;
    /** Secondary text. */
    dim?: string;
    border?: string;
    /** Border of the focused box and dialogs. */
    borderActive?: string;
    /** Behind dialogs. */
    backdrop?: string;
    font?: string;
    /** Tells the browser how to draw scrollbars and form controls. Defaults to dark. */
    scheme?: 'dark' | 'light';
}
export type ThemeInput = Partial<Theme>;
/** The CSS variables for a theme, e.g. `{'--bg': '#1c1c1c'}`. */
export declare const themeVariables: (theme: ThemeInput) => Record<string, string>;
/**
 * Inline style that themes one element and everything inside it. Give that
 * element the `console-theme` class too, so the mixed colors follow:
 * `<div className='console-theme' style={themeStyle(themes.nord)}>`.
 */
export declare const themeStyle: (theme: ThemeInput) => CSSProperties;
/**
 * Applies a theme to the whole page (or to `target`), on top of the stylesheet's
 * defaults. Also updates `<meta name="theme-color">` so the browser chrome
 * matches. Returns a function that removes the theme again.
 */
export declare const applyTheme: (theme: ThemeInput, target?: HTMLElement) => () => void;
/** Applies a theme to the page while the calling component is mounted. */
export declare const useTheme: (theme: ThemeInput) => void;
/** Ready-made themes. `console` is the stylesheet's default. */
export declare const themes: {
    console: {
        bg: string;
        fg: string;
        accent: string;
        blue: string;
        purple: string;
        warn: string;
        error: string;
    };
    gruvbox: {
        bg: string;
        fg: string;
        accent: string;
        blue: string;
        purple: string;
        warn: string;
        error: string;
    };
    nord: {
        bg: string;
        fg: string;
        accent: string;
        blue: string;
        purple: string;
        warn: string;
        error: string;
    };
    dracula: {
        bg: string;
        fg: string;
        accent: string;
        blue: string;
        purple: string;
        warn: string;
        error: string;
    };
    solarized: {
        bg: string;
        fg: string;
        accent: string;
        blue: string;
        purple: string;
        warn: string;
        error: string;
    };
    amber: {
        bg: string;
        fg: string;
        accent: string;
        blue: string;
        purple: string;
        warn: string;
        error: string;
    };
    paper: {
        bg: string;
        fg: string;
        accent: string;
        blue: string;
        purple: string;
        warn: string;
        error: string;
        backdrop: string;
        scheme: "light";
    };
};
export type ThemeName = keyof typeof themes;
