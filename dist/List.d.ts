import { type MouseEvent, type ReactNode } from 'react';
export interface SectionHeaderProps {
    title: ReactNode;
    /** Shown dim at the right end, e.g. the item count. */
    count?: ReactNode;
    folded?: boolean;
    isCursor?: boolean;
    /** Sets `data-row`, for finding the row in the DOM. */
    rowKey?: string;
    onToggleFold?: () => void;
    /** Shows a `[+]` button. */
    onAdd?: () => void;
    addTitle?: string;
    onMouseDown?: (e: MouseEvent) => void;
}
/** `› ▾ Today ──────────── ✓2 5 [+]` */
export declare const SectionHeader: ({ title, count, folded, isCursor, rowKey, onToggleFold, onAdd, addTitle, onMouseDown, }: SectionHeaderProps) => import("react").JSX.Element;
export interface ItemRowProps {
    children: ReactNode;
    isCursor?: boolean;
    selected?: boolean;
    /** A colored `▌` bar before the checkbox. */
    color?: string | null;
    /**
     * `true`/`false` shows `[x]`/`[ ]`; `null` shows a dim `·` (an item that
     * can't be checked off); leave it out for no checkbox column.
     */
    done?: boolean | null;
    onToggleDone?: () => void;
    /** Yellow text before the main text, e.g. a date. */
    tag?: ReactNode;
    /** Dim text after the main text, e.g. ` ¶`. */
    suffix?: ReactNode;
    /** Replaces the selection mark (`●`) column, e.g. a yellow `+` for unsaved. */
    mark?: ReactNode;
    /** Dims the main text. */
    dimText?: boolean;
    rowKey?: string;
    onMouseDown?: (e: MouseEvent) => void;
    onDoubleClick?: () => void;
}
/** `› ● ▌[ ] fri  Buy milk ¶` */
export declare const ItemRow: ({ children, isCursor, selected, color, done, onToggleDone, tag, suffix, mark, dimText, rowKey, onMouseDown, onDoubleClick, }: ItemRowProps) => import("react").JSX.Element;
/** Inline input for new items. Enter adds and stays open for the next one; Esc or blur closes. */
export declare const AddRow: ({ onSubmit, onClose, placeholder, checkbox, }: {
    onSubmit: (text: string) => void;
    onClose: () => void;
    placeholder?: string;
    /** Show a `[ ]` like the items around it. Default true. */
    checkbox?: boolean;
}) => import("react").JSX.Element;
/** Keeps the element in view (nearest edge) whenever `active` turns on. */
export declare const useScrollIntoView: <T extends HTMLElement>(active: boolean) => import("react").RefObject<T | null>;
export interface ListSection<T> {
    key: string;
    title: ReactNode;
    items: T[];
    /** Overrides the default count (number of items). */
    count?: ReactNode;
    /** Shows `[+]` on the header and allows `addingTo` this section. */
    canAdd?: boolean;
}
/** A visible line. `S` is your section type when it carries extra fields. */
export interface ListRow<T, S = ListSection<T>> {
    key: string;
    kind: 'header' | 'item';
    section: S;
    item?: T;
}
export declare const headerRowKey: (sectionKey: string) => string;
export declare const itemRowKey: (itemKey: string) => string;
/** The lines a list shows, in order; folded sections contribute only their header. Feed this to `useCursor`. */
/** The item type of a section type. */
export type ItemOf<S> = S extends ListSection<infer T> ? T : never;
export declare const listRows: <S extends ListSection<unknown>>(sections: S[], getKey: (item: ItemOf<S>) => string, folded?: ReadonlySet<string>) => ListRow<ItemOf<S>, S>[];
/** What an item looks like; the list fills in the cursor, key and mouse handling. */
export type ItemView = Omit<ItemRowProps, 'isCursor' | 'rowKey' | 'onMouseDown'>;
export interface SectionListProps<T, S = ListSection<T>> {
    sections: S[];
    getKey: (item: T) => string;
    renderItem: (item: T, section: S) => ItemView;
    folded?: ReadonlySet<string>;
    cursorKey?: string | null;
    onToggleFold?: (sectionKey: string) => void;
    /** Any row pressed: move the cursor there. */
    onRowMouseDown?: (row: ListRow<T, S>, e: MouseEvent) => void;
    /** The `[+]` on a section header. */
    onOpenAdd?: (section: S) => void;
    /** Section key showing an `AddRow`, or null. */
    addingTo?: string | null;
    onAdd?: (section: S, text: string) => void;
    onCloseAdd?: () => void;
    addPlaceholder?: string;
    /** Shown when there are no sections. */
    empty?: ReactNode;
}
/**
 * Foldable sections of items, like vera-console's task panes. Put it in a
 * `Box`; it scrolls on its own.
 */
export declare const SectionList: <S extends ListSection<unknown>>({ sections, getKey, renderItem, folded, cursorKey, onToggleFold, onRowMouseDown, onOpenAdd, addingTo, onAdd, onCloseAdd, addPlaceholder, empty, }: SectionListProps<ItemOf<S>, S>) => import("react").JSX.Element;
/**
 * A cursor over a list of rows that survives the list changing: it follows
 * its row by key, and when that row goes away it stays at the same position.
 */
export declare const useCursor: <R extends {
    key: string;
}>(rows: R[]) => {
    /** The row under the cursor, if the list isn't empty. */
    row: R;
    index: number;
    key: string;
    moveTo: (i: number) => void;
    /** Moves by `delta` rows (e.g. ±1, or ±10 for page up/down). */
    move: (delta: number) => void;
    top: () => void;
    bottom: () => void;
    /** Puts the cursor on the row with this key. */
    setKey: (key: string) => void;
    /** Jumps to the next (1) or previous (-1) row matching `test`, e.g. section headers for `{` `}`. */
    jump: (direction: 1 | -1, test: (r: R) => boolean) => void;
};
