import {type CSSProperties, useEffect} from 'react';

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

type ColorKey = Exclude<keyof Theme, 'scheme'>;

const VARIABLES: [ColorKey, string][] = [
  ['bg', '--bg'],
  ['fg', '--fg'],
  ['accent', '--accent'],
  ['blue', '--blue'],
  ['purple', '--purple'],
  ['warn', '--warn'],
  ['error', '--error'],
  ['bgBar', '--bg-bar'],
  ['bgCursor', '--bg-cursor'],
  ['bgSelection', '--bg-selection'],
  ['bgSearchMatch', '--bg-search-match'],
  ['dim', '--dim'],
  ['border', '--border'],
  ['borderActive', '--border-active'],
  ['backdrop', '--backdrop'],
  ['font', '--font'],
];

const entries = (theme: ThemeInput) =>
  VARIABLES.flatMap(([key, variable]) => {
    const value = theme[key];
    return value ? [[variable, value] as const] : [];
  });

/** The CSS variables for a theme, e.g. `{'--bg': '#1c1c1c'}`. */
export const themeVariables = (theme: ThemeInput): Record<string, string> => Object.fromEntries(entries(theme));

/**
 * Inline style that themes one element and everything inside it. Give that
 * element the `console-theme` class too, so the mixed colors follow:
 * `<div className='console-theme' style={themeStyle(themes.nord)}>`.
 */
export const themeStyle = (theme: ThemeInput): CSSProperties => ({
  ...themeVariables(theme),
  ...(theme.scheme ? {colorScheme: theme.scheme} : {}),
});

/**
 * Applies a theme to the whole page (or to `target`), on top of the stylesheet's
 * defaults. Also updates `<meta name="theme-color">` so the browser chrome
 * matches. Returns a function that removes the theme again.
 */
export const applyTheme = (theme: ThemeInput, target: HTMLElement = document.documentElement) => {
  const pairs = entries(theme);
  for (const [variable, value] of pairs) target.style.setProperty(variable, value);
  if (theme.scheme) target.style.colorScheme = theme.scheme;

  const meta = target === document.documentElement ? document.querySelector('meta[name="theme-color"]') : null;
  const previousMeta = meta?.getAttribute('content') ?? null;
  // The meta tag needs a plain color, so read the background back as the page sees it.
  if (meta) meta.setAttribute('content', getComputedStyle(target).getPropertyValue('--bg').trim());

  return () => {
    for (const [variable] of pairs) target.style.removeProperty(variable);
    if (theme.scheme) target.style.colorScheme = '';
    if (meta && previousMeta !== null) meta.setAttribute('content', previousMeta);
  };
};

/** Applies a theme to the page while the calling component is mounted. */
export const useTheme = (theme: ThemeInput) => {
  // Callers usually pass a new object each render; re-apply only when a value changes.
  const key = JSON.stringify(theme);
  useEffect(
    () => applyTheme(theme),
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
};

/** Ready-made themes. `console` is the stylesheet's default. */
export const themes = {
  console: {
    bg: '#0d0f12',
    fg: '#c9d1d9',
    accent: '#7ee787',
    blue: '#79c0ff',
    purple: '#d2a8ff',
    warn: '#e3b341',
    error: '#ff7b72',
  },
  gruvbox: {
    bg: '#282828',
    fg: '#ebdbb2',
    accent: '#b8bb26',
    blue: '#83a598',
    purple: '#d3869b',
    warn: '#fabd2f',
    error: '#fb4934',
  },
  nord: {
    bg: '#2e3440',
    fg: '#d8dee9',
    accent: '#88c0d0',
    blue: '#81a1c1',
    purple: '#b48ead',
    warn: '#ebcb8b',
    error: '#bf616a',
  },
  dracula: {
    bg: '#282a36',
    fg: '#f8f8f2',
    accent: '#50fa7b',
    blue: '#8be9fd',
    purple: '#bd93f9',
    warn: '#f1fa8c',
    error: '#ff5555',
  },
  solarized: {
    bg: '#002b36',
    fg: '#93a1a1',
    accent: '#859900',
    blue: '#268bd2',
    purple: '#6c71c4',
    warn: '#b58900',
    error: '#dc322f',
  },
  amber: {
    bg: '#120c02',
    fg: '#ffb000',
    accent: '#ffcc66',
    blue: '#ffb000',
    purple: '#ffd68a',
    warn: '#ff8c00',
    error: '#ff5f40',
  },
  paper: {
    bg: '#fbfaf7',
    fg: '#2b2b2b',
    accent: '#1a7f37',
    blue: '#0550ae',
    purple: '#8250df',
    warn: '#9a6700',
    error: '#cf222e',
    backdrop: 'rgb(0 0 0 / 0.25)',
    scheme: 'light',
  },
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof themes;
