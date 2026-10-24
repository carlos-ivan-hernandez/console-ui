import { type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
/** Dims the screen and centers its child. Pressing outside the child cancels. */
export declare const Overlay: ({ onCancel, children }: {
    onCancel: () => void;
    children: ReactNode;
}) => import("react").JSX.Element;
export interface DialogProps {
    title: ReactNode;
    footer?: ReactNode;
    onClose: () => void;
    /**
     * Keys that close the dialog even when nothing inside it has focus.
     * Default `['Escape']`. Help-style dialogs use `['Escape', 'q', '?', 'Enter']`.
     */
    closeKeys?: string[];
    /** Keys pressed inside the dialog (e.g. on its inputs). */
    onKeyDown?: (e: ReactKeyboardEvent) => void;
    className?: string;
    children: ReactNode;
}
/** A boxed dialog over a dimmed screen. */
export declare const Dialog: ({ title, footer, onClose, closeKeys, onKeyDown, className, children, }: DialogProps) => import("react").JSX.Element;
export interface PickerItem {
    id: string;
    label: string;
    /** Short key shown on the right, e.g. "t". Typing it as the first key picks the item. */
    hotkey?: string;
    /** Shows `■` in this color; `null` shows an empty `□`; leave it out for no swatch. */
    swatch?: string | null;
}
export interface PickerProps {
    title: string;
    items: PickerItem[];
    onPick: (id: string) => void;
    onCancel: () => void;
    footer?: ReactNode;
}
/**
 * A fuzzy-filtered list in a box, like fzf: type to narrow, ↑/↓ (or Ctrl-N/P,
 * Ctrl-J/K) to move, Enter to pick, Esc to cancel. Clicking an item picks it.
 */
export declare const Picker: ({ title, items, onPick, onCancel, footer, }: PickerProps) => import("react").JSX.Element;
export interface HelpGroup {
    title: string;
    /** `[keys, what they do]` pairs, e.g. `['j k  ↓ ↑', 'next / previous line']`. */
    keys: [string, string][];
}
/** The `?` screen: key bindings in groups. Esc, q, ? or Enter closes it. */
export declare const HelpDialog: ({ groups, onClose, title, }: {
    groups: HelpGroup[];
    onClose: () => void;
    title?: string;
}) => import("react").JSX.Element;
