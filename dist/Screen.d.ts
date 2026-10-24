import type { ReactNode } from 'react';
/** The whole app: a top bar, then the active tab's screen filling the rest. */
export declare const Screen: ({ children }: {
    children: ReactNode;
}) => import("react").JSX.Element;
export interface TabDef<T extends string = string> {
    id: T;
    label: string;
    /** Shown after the label, e.g. `+` for unsaved changes. */
    marker?: string;
    title?: string;
}
export interface TopBarProps<T extends string> {
    /** The app name, shown inverted on the left. */
    badge: ReactNode;
    tabs?: TabDef<T>[];
    activeTab?: T;
    onSelectTab?: (id: T) => void;
    /** Right-aligned content, e.g. the signed-in user and a `[logout]` link. */
    children?: ReactNode;
}
/** A tmux-style bar: `[app] 1:tasks* 2:notes ……… user [logout]`. */
export declare const TopBar: <T extends string>({ badge, tabs, activeTab, onSelectTab, children }: TopBarProps<T>) => import("react").JSX.Element;
/**
 * One tab's screen: panes, then status bar, then bottom line. Keep every tab
 * mounted and hide the inactive ones, so each keeps its cursor and state.
 */
export declare const TabScreen: ({ hidden, children }: {
    hidden?: boolean;
    children: ReactNode;
}) => import("react").JSX.Element;
export interface PanesProps {
    /** Side by side when true (see `useWideLayout`), stacked otherwise. */
    wide?: boolean;
    /** CSS grid columns when wide. Default `1fr 1fr`. */
    columns?: string;
    className?: string;
    children: ReactNode;
}
export declare const Panes: ({ wide, columns, className, children }: PanesProps) => import("react").JSX.Element;
export declare const StatusBar: ({ children }: {
    children: ReactNode;
}) => import("react").JSX.Element;
export type Tone = 'accent' | 'blue' | 'warn' | 'error' | 'purple';
/**
 * The colored block at the left of the status bar. vera-console's colors:
 * NORMAL accent · INSERT/EDIT blue · COMMAND/SEARCH/PROMPT warn · CONFIRM error · pickers/HELP purple.
 */
export declare const ModeBadge: ({ tone, children }: {
    tone?: Tone;
    children: ReactNode;
}) => import("react").JSX.Element;
/** A dim text button, e.g. `[logout]` or `? help`. */
export declare const LinkButton: ({ onClick, title, children }: {
    onClick: () => void;
    title?: string;
    children: ReactNode;
}) => import("react").JSX.Element;
