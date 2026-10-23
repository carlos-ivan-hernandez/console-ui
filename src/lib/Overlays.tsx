import {type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useEffect, useRef, useState} from 'react';
import {Box} from './Box';
import {fuzzyMatch} from './hooks';

/** Dims the screen and centers its child. Pressing outside the child cancels. */
export const Overlay = ({onCancel, children}: {onCancel: () => void; children: ReactNode}) => (
  <div
    className='overlay'
    onMouseDown={e => e.target === e.currentTarget && onCancel()}
  >
    {children}
  </div>
);

const ESCAPE = ['Escape'];
const HELP_CLOSE_KEYS = ['Escape', 'q', '?', 'Enter'];

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
export const Dialog = ({
  title,
  footer,
  onClose,
  closeKeys = ESCAPE,
  onKeyDown,
  className = '',
  children,
}: DialogProps) => {
  const closeRef = useRef({onClose, closeKeys});
  useEffect(() => {
    closeRef.current = {onClose, closeKeys};
  });

  useEffect(() => {
    // Capture phase, so the screen underneath never sees these keys.
    const onKey = (e: KeyboardEvent) => {
      if (!closeRef.current.closeKeys.includes(e.key)) return;
      // Letters typed into a field inside the dialog are text, not commands.
      if (e.key.length === 1 && e.target instanceof Element && e.target.closest('input, textarea')) return;
      e.preventDefault();
      e.stopPropagation();
      closeRef.current.onClose();
    };
    globalThis.addEventListener('keydown', onKey, true);
    return () => globalThis.removeEventListener('keydown', onKey, true);
  }, []);

  return (
    <Overlay onCancel={onClose}>
      <div onKeyDown={onKeyDown}>
        <Box
          title={title}
          className={`dialog ${className}`}
          footer={footer}
        >
          {children}
        </Box>
      </div>
    </Overlay>
  );
};

// ── Picker ────────────────────────────────────────────────────────────────────

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
export const Picker = ({
  title,
  items,
  onPick,
  onCancel,
  footer = 'type to filter · ↑↓ move · enter pick · esc cancel',
}: PickerProps) => {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const shown = query ? items.filter(it => fuzzyMatch(it.label, query)) : items;
  const current = Math.min(index, Math.max(0, shown.length - 1));

  useEffect(() => {
    listRef.current?.children[current]?.scrollIntoView({block: 'nearest'});
  }, [current]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    const down = e.key === 'ArrowDown' || (e.ctrlKey && (e.key === 'n' || e.key === 'j'));
    const up = e.key === 'ArrowUp' || (e.ctrlKey && (e.key === 'p' || e.key === 'k'));
    if (down || up) {
      e.preventDefault();
      setIndex((current + (down ? 1 : -1) + shown.length) % Math.max(1, shown.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (shown[current]) onPick(shown[current].id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (!query && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const hit = items.find(it => it.hotkey === e.key);
      if (hit) {
        e.preventDefault();
        onPick(hit.id);
      }
    }
  };

  return (
    <Overlay onCancel={onCancel}>
      <Box
        title={title}
        className='picker'
        footer={footer}
      >
        <div className='picker-query'>
          <span className='accent'>❯ </span>
          <input
            autoFocus
            className='prompt-input'
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            spellCheck={false}
            aria-label={title}
          />
          <span className='dim'>
            {shown.length}/{items.length}
          </span>
        </div>
        <ul
          ref={listRef}
          className='picker-list'
        >
          {shown.map((it, i) => (
            <li
              key={it.id}
              className={i === current ? 'is-current' : undefined}
              onMouseEnter={() => setIndex(i)}
              onMouseDown={e => {
                e.preventDefault();
                onPick(it.id);
              }}
            >
              <span className='cursor-mark'>{i === current ? '›' : ' '}</span>
              {it.swatch !== undefined && (
                <span
                  className='swatch'
                  style={it.swatch ? {color: it.swatch} : undefined}
                >
                  {it.swatch ? '■' : '□'}
                </span>
              )}
              <span className='grow'>{it.label}</span>
              {it.hotkey && <span className='dim'>{it.hotkey}</span>}
            </li>
          ))}
          {shown.length === 0 && <li className='dim'> no matches</li>}
        </ul>
      </Box>
    </Overlay>
  );
};

// ── Help ──────────────────────────────────────────────────────────────────────

export interface HelpGroup {
  title: string;
  /** `[keys, what they do]` pairs, e.g. `['j k  ↓ ↑', 'next / previous line']`. */
  keys: [string, string][];
}

/** The `?` screen: key bindings in groups. Esc, q, ? or Enter closes it. */
export const HelpDialog = ({
  groups,
  onClose,
  title = 'help',
}: {
  groups: HelpGroup[];
  onClose: () => void;
  title?: string;
}) => (
  <Dialog
    title={title}
    className='help'
    footer='esc / q to close'
    onClose={onClose}
    closeKeys={HELP_CLOSE_KEYS}
  >
    {groups.map(group => (
      <div
        key={group.title}
        className='help-group'
      >
        <p className='accent'>{group.title}</p>
        {group.keys.map(([key, what]) => (
          <p
            key={key}
            className='help-line'
          >
            <span className='help-key'>{key}</span>
            <span className='dim'>{what}</span>
          </p>
        ))}
      </div>
    ))}
  </Dialog>
);
