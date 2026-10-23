import type {CSSProperties, ReactNode} from 'react';

/** The whole app: a top bar, then the active tab's screen filling the rest. */
export const Screen = ({children}: {children: ReactNode}) => <div className='screen'>{children}</div>;

const NO_TABS: never[] = [];

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
export const TopBar = <T extends string>({badge, tabs = NO_TABS, activeTab, onSelectTab, children}: TopBarProps<T>) => (
  <header className='topbar'>
    <span className='badge'>{badge}</span>
    {tabs.map((t, i) => (
      <button
        key={t.id}
        type='button'
        className={`tab ${activeTab === t.id ? 'is-active' : ''}`}
        onClick={() => onSelectTab?.(t.id)}
        title={t.title ?? t.label}
      >
        {i + 1}:{t.label}
        {activeTab === t.id ? '*' : ' '}
        {t.marker ?? ''}
      </button>
    ))}
    <span className='grow' />
    {children}
  </header>
);

/**
 * One tab's screen: panes, then status bar, then bottom line. Keep every tab
 * mounted and hide the inactive ones, so each keeps its cursor and state.
 */
export const TabScreen = ({hidden = false, children}: {hidden?: boolean; children: ReactNode}) => (
  <div className={`tab-screen ${hidden ? 'is-hidden' : ''}`}>{children}</div>
);

export interface PanesProps {
  /** Side by side when true (see `useWideLayout`), stacked otherwise. */
  wide?: boolean;
  /** CSS grid columns when wide. Default `1fr 1fr`. */
  columns?: string;
  className?: string;
  children: ReactNode;
}

export const Panes = ({wide = false, columns, className = '', children}: PanesProps) => (
  <main
    className={`panes ${wide ? 'is-wide' : ''} ${className}`}
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    style={columns ? ({'--pane-columns': columns} as CSSProperties) : undefined}
  >
    {children}
  </main>
);

export const StatusBar = ({children}: {children: ReactNode}) => <footer className='statusbar'>{children}</footer>;

export type Tone = 'accent' | 'blue' | 'warn' | 'error' | 'purple';

/**
 * The colored block at the left of the status bar. vera-console's colors:
 * NORMAL accent · INSERT/EDIT blue · COMMAND/SEARCH/PROMPT warn · CONFIRM error · pickers/HELP purple.
 */
export const ModeBadge = ({tone = 'accent', children}: {tone?: Tone; children: ReactNode}) => (
  <span className={`mode tone-${tone}`}>{children}</span>
);

/** A dim text button, e.g. `[logout]` or `? help`. */
export const LinkButton = ({onClick, title, children}: {onClick: () => void; title?: string; children: ReactNode}) => (
  <button
    type='button'
    className='link'
    onClick={onClick}
    title={title}
  >
    {children}
  </button>
);
