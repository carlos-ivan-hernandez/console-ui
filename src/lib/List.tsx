import {type MouseEvent, type ReactNode, useLayoutEffect, useRef, useState} from 'react';

// ── Rows ──────────────────────────────────────────────────────────────────────

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
export const SectionHeader = ({
  title,
  count,
  folded = false,
  isCursor = false,
  rowKey,
  onToggleFold,
  onAdd,
  addTitle,
  onMouseDown,
}: SectionHeaderProps) => {
  const ref = useScrollIntoView<HTMLDivElement>(isCursor);
  return (
    <div
      ref={ref}
      data-row={rowKey}
      className={`row header ${isCursor ? 'is-cursor' : ''}`}
      onMouseDown={onMouseDown}
      onClick={onToggleFold}
    >
      <span className='cursor-mark'>{isCursor ? '›' : ' '}</span>
      <span className='fold'>{folded ? '▸' : '▾'}</span>
      <span className='section-title'>{title}</span>
      <span className='rule' />
      {count !== undefined && <span className='dim'>{count}</span>}
      {onAdd && (
        <button
          type='button'
          className='add-button'
          title={addTitle}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            onAdd();
          }}
        >
          [+]
        </button>
      )}
    </div>
  );
};

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
export const ItemRow = ({
  children,
  isCursor = false,
  selected = false,
  color,
  done,
  onToggleDone,
  tag,
  suffix,
  mark,
  dimText = false,
  rowKey,
  onMouseDown,
  onDoubleClick,
}: ItemRowProps) => {
  const ref = useScrollIntoView<HTMLDivElement>(isCursor);
  return (
    <div
      ref={ref}
      data-row={rowKey}
      className={`row item ${isCursor ? 'is-cursor' : ''} ${selected ? 'is-selected' : ''} ${done ? 'is-done' : ''}`}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <span className='cursor-mark'>{isCursor ? '›' : ' '}</span>
      <span className='select-mark'>{mark ?? (selected ? '●' : ' ')}</span>
      <span
        className='color-mark'
        style={color ? {color} : undefined}
      >
        {color ? '▌' : ' '}
      </span>
      {done === null ? (
        <span className='check is-static'> · </span>
      ) : done === undefined ? null : (
        <span
          className='check'
          role='checkbox'
          aria-checked={done}
          onClick={e => {
            e.stopPropagation();
            onToggleDone?.();
          }}
        >
          {done ? '[x]' : '[ ]'}
        </span>
      )}
      {tag !== undefined && <span className='tag'>{tag}</span>}
      <span className={`text ${dimText ? 'dim' : ''}`}>
        {children}
        {suffix !== undefined && <span className='suffix'>{suffix}</span>}
      </span>
    </div>
  );
};

/** Inline input for new items. Enter adds and stays open for the next one; Esc or blur closes. */
export const AddRow = ({
  onSubmit,
  onClose,
  placeholder = 'new item · enter adds · esc done',
  checkbox = true,
}: {
  onSubmit: (text: string) => void;
  onClose: () => void;
  placeholder?: string;
  /** Show a `[ ]` like the items around it. Default true. */
  checkbox?: boolean;
}) => {
  const [value, setValue] = useState('');
  return (
    <div className='row item add-row'>
      <span className='cursor-mark accent'>›</span>
      <span className='select-mark'> </span>
      <span className='color-mark'> </span>
      {checkbox && <span className='check accent'>[ ]</span>}
      <input
        autoFocus
        className='prompt-input text'
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        onChange={e => setValue(e.target.value)}
        onBlur={onClose}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (value.trim()) onSubmit(value.trim());
            setValue('');
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
          }
        }}
        aria-label='New item'
      />
    </div>
  );
};

/** Keeps the element in view (nearest edge) whenever `active` turns on. */
export const useScrollIntoView = <T extends HTMLElement>(active: boolean) => {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    if (active) ref.current?.scrollIntoView({block: 'nearest'});
  }, [active]);
  return ref;
};

// ── Sectioned lists ───────────────────────────────────────────────────────────

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

const NOTHING_FOLDED: ReadonlySet<string> = new Set();

export const headerRowKey = (sectionKey: string) => `h:${sectionKey}`;
export const itemRowKey = (itemKey: string) => `i:${itemKey}`;

/** The lines a list shows, in order; folded sections contribute only their header. Feed this to `useCursor`. */
/** The item type of a section type. */
export type ItemOf<S> = S extends ListSection<infer T> ? T : never;

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const itemsOf = <S extends ListSection<unknown>>(section: S) => section.items as ItemOf<S>[];

export const listRows = <S extends ListSection<unknown>>(
  sections: S[],
  getKey: (item: ItemOf<S>) => string,
  folded: ReadonlySet<string> = NOTHING_FOLDED,
): ListRow<ItemOf<S>, S>[] =>
  sections.flatMap(section => [
    {key: headerRowKey(section.key), kind: 'header' as const, section},
    ...(folded.has(section.key)
      ? []
      : itemsOf(section).map(item => ({key: itemRowKey(getKey(item)), kind: 'item' as const, section, item}))),
  ]);

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
export const SectionList = <S extends ListSection<unknown>>({
  sections,
  getKey,
  renderItem,
  folded = NOTHING_FOLDED,
  cursorKey = null,
  onToggleFold,
  onRowMouseDown,
  onOpenAdd,
  addingTo = null,
  onAdd,
  onCloseAdd,
  addPlaceholder,
  empty,
}: SectionListProps<ItemOf<S>, S>) => (
  <div className='pane-scroll'>
    {sections.length === 0 && empty}
    {sections.map(section => {
      const isFolded = folded.has(section.key);
      const header: ListRow<ItemOf<S>, S> = {key: headerRowKey(section.key), kind: 'header', section};
      const doneCount = itemsOf(section).filter(item => renderItem(item, section).done === true).length;
      return (
        <div
          key={section.key}
          className='section'
        >
          <SectionHeader
            rowKey={header.key}
            title={section.title}
            folded={isFolded}
            isCursor={cursorKey === header.key}
            count={
              section.count ?? (
                <>
                  {doneCount > 0 && <span className='ok'>✓{doneCount} </span>}
                  {section.items.length}
                </>
              )
            }
            onToggleFold={() => onToggleFold?.(section.key)}
            onAdd={section.canAdd && onOpenAdd ? () => onOpenAdd(section) : undefined}
            addTitle={typeof section.title === 'string' ? `Add to ${section.title} (o)` : 'Add (o)'}
            onMouseDown={e => onRowMouseDown?.(header, e)}
          />
          {!isFolded &&
            itemsOf(section).map(item => {
              const row: ListRow<ItemOf<S>, S> = {key: itemRowKey(getKey(item)), kind: 'item', section, item};
              return (
                <ItemRow
                  key={row.key}
                  rowKey={row.key}
                  isCursor={cursorKey === row.key}
                  onMouseDown={e => onRowMouseDown?.(row, e)}
                  {...renderItem(item, section)}
                />
              );
            })}
          {addingTo === section.key && onAdd && (
            <AddRow
              placeholder={addPlaceholder}
              onSubmit={text => onAdd(section, text)}
              onClose={() => onCloseAdd?.()}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ── Cursor ────────────────────────────────────────────────────────────────────

/**
 * A cursor over a list of rows that survives the list changing: it follows
 * its row by key, and when that row goes away it stays at the same position.
 */
export const useCursor = <R extends {key: string}>(rows: R[]) => {
  const [cursor, setCursor] = useState<{key: string | null; index: number}>({key: null, index: 0});

  const found = cursor.key === null ? -1 : rows.findIndex(r => r.key === cursor.key);
  const index = found === -1 ? Math.max(0, Math.min(cursor.index, rows.length - 1)) : found;
  const row: R | undefined = rows[index];

  const moveTo = (i: number) => {
    const clamped = Math.max(0, Math.min(i, rows.length - 1));
    setCursor({key: rows[clamped]?.key ?? null, index: clamped});
  };

  return {
    /** The row under the cursor, if the list isn't empty. */
    row,
    index,
    key: row?.key ?? null,
    moveTo,
    /** Moves by `delta` rows (e.g. ±1, or ±10 for page up/down). */
    move: (delta: number) => moveTo(index + delta),
    top: () => moveTo(0),
    bottom: () => moveTo(rows.length - 1),
    /** Puts the cursor on the row with this key. */
    setKey: (key: string) => {
      const i = rows.findIndex(r => r.key === key);
      setCursor({key, index: i === -1 ? index : i});
    },
    /** Jumps to the next (1) or previous (-1) row matching `test`, e.g. section headers for `{` `}`. */
    jump: (direction: 1 | -1, test: (r: R) => boolean) => {
      for (let i = index + direction; i >= 0 && i < rows.length; i += direction) {
        if (test(rows[i])) return moveTo(i);
      }
    },
  };
};
