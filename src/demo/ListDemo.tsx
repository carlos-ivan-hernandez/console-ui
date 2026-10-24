import {useState} from 'react';
import {
  Box,
  BottomLine,
  choiceField,
  Clock,
  FormDialog,
  HelpDialog,
  type HelpGroup,
  LinkButton,
  type ListRow,
  listRows,
  type ListSection,
  type Message,
  ModeBadge,
  Panes,
  Picker,
  plural,
  SectionList,
  StatusBar,
  TabScreen,
  type Tone,
  useCursor,
  useFolded,
  useKeymap,
  useSelection,
  useWideLayout,
  wordCompleter,
} from '../lib';

interface Item {
  id: string;
  text: string;
  group: string;
  done: boolean;
  color: string | null;
}

const GROUPS = ['inbox', 'today', 'later', 'ideas', 'reading'];
const COLORS = ['#ff7b72', '#e3b341', '#7ee787', '#79c0ff', '#d2a8ff'];
const PANES = [
  {id: 'left', title: 'agenda', groups: ['inbox', 'today', 'later']},
  {id: 'right', title: 'lists', groups: ['ideas', 'reading']},
];

const SEED: Item[] = [
  {id: '1', text: 'Try j/k, then x to check this off', group: 'inbox', done: false, color: null},
  {id: '2', text: 'Press e to edit me', group: 'inbox', done: false, color: '#79c0ff'},
  {id: '3', text: 'm moves me to another list', group: 'today', done: false, color: null},
  {id: '4', text: 'Already done', group: 'today', done: true, color: null},
  {id: '5', text: 'dd deletes (asks first)', group: 'later', done: false, color: '#ff7b72'},
  {id: '6', text: 'A terminal-style todo app', group: 'ideas', done: false, color: null},
  {id: '7', text: 'The Art of Unix Programming', group: 'reading', done: false, color: '#d2a8ff'},
];

type Mode =
  | {kind: 'normal'}
  | {kind: 'add'; group: string}
  | {kind: 'command'}
  | {kind: 'search'; previous: string}
  | {kind: 'prompt'; label: string; onSubmit: (value: string) => void}
  | {kind: 'confirm'; question: string; onYes: () => void}
  | {kind: 'edit'; id: string}
  | {kind: 'move'; ids: string[]}
  | {kind: 'help'};

const MODE_BADGES: Record<Mode['kind'], [string, Tone]> = {
  normal: ['NORMAL', 'accent'],
  add: ['INSERT', 'blue'],
  edit: ['EDIT', 'blue'],
  command: ['COMMAND', 'warn'],
  search: ['SEARCH', 'warn'],
  prompt: ['PROMPT', 'warn'],
  confirm: ['CONFIRM', 'error'],
  move: ['MOVE', 'purple'],
  help: ['HELP', 'purple'],
};

const HELP: HelpGroup[] = [
  {
    title: 'move',
    keys: [
      ['j k  ↓ ↑', 'next / previous line'],
      ['h l  ← →  tab', 'switch pane'],
      ['{ }', 'previous / next section'],
      ['gg G', 'top / bottom'],
    ],
  },
  {
    title: 'items',
    keys: [
      ['x  space', 'check / uncheck'],
      ['o', 'add to this section'],
      ['e  enter', 'edit'],
      ['dd', 'delete'],
      ['m', 'move to another list'],
      ['v  ⌘/ctrl-click', 'select; m and dd act on all selected'],
    ],
  },
  {
    title: 'view',
    keys: [
      ['za  zM zR', 'fold section / fold all / unfold all'],
      ['/', 'filter'],
      [':', 'commands: :add, :rename, :clear, :theme <name>'],
      ['gt', 'next tab'],
    ],
  },
];

/** A small todo app showing lists, keys, dialogs, the picker and the bottom line. */
interface ListDemoProps {
  active: boolean;
  onNextTab: () => void;
  themeNames: string[];
  onTheme: (name: string) => boolean;
}

export const ListDemo = ({active, onNextTab, themeNames, onTheme}: ListDemoProps) => {
  const [items, setItems] = useState(SEED);
  const [mode, setMode] = useState<Mode>({kind: 'normal'});
  const [message, setMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState('');
  const [paneIndex, setPaneIndex] = useState(0);
  const {folded, toggleFold, setAllFolded} = useFolded('console-ui-demo-folded');
  const {selected, toggle: toggleSelected, clear: clearSelection} = useSelection();
  const wide = useWideLayout();
  const info = (text: string) => setMessage({text, kind: 'info'});

  const shown = filter ? items.filter(it => it.text.toLowerCase().includes(filter.toLowerCase())) : items;
  const sectionsFor = (groups: string[]): ListSection<Item>[] =>
    groups.map(g => ({
      key: g,
      title: g[0].toUpperCase() + g.slice(1),
      items: shown.filter(it => it.group === g),
      canAdd: true,
    }));

  const paneSections = PANES.map(p => sectionsFor(p.groups));
  const paneRowLists = paneSections.map(s => listRows(s, it => it.id, folded));
  const cursors = [useCursor(paneRowLists[0]), useCursor(paneRowLists[1])];
  const cursor = cursors[paneIndex];
  const current = cursor.row;
  const currentItem = current?.item;

  const update = (ids: string[], change: Partial<Item>) =>
    setItems(prev => prev.map(it => (ids.includes(it.id) ? {...it, ...change} : it)));
  const targets = () => (selected.size > 0 ? [...selected] : currentItem ? [currentItem.id] : []);

  const confirmDelete = (ids: string[]) =>
    setMode({
      kind: 'confirm',
      question: `delete ${plural(ids.length, 'item')}? (y/n)`,
      onYes: () => {
        setItems(prev => prev.filter(it => !ids.includes(it.id)));
        clearSelection();
        setMode({kind: 'normal'});
        info(`deleted ${plural(ids.length, 'item')}`);
      },
    });

  const switchPane = (i: number) => setPaneIndex((i + PANES.length) % PANES.length);

  useKeymap(
    mode.kind === 'confirm'
      ? {'y Y': mode.onYes}
      : mode.kind === 'normal'
        ? {
            'j ArrowDown': () => cursor.move(1),
            'k ArrowUp': () => cursor.move(-1),
            PageDown: () => cursor.move(10),
            PageUp: () => cursor.move(-10),
            'gg Home': cursor.top,
            'G End': cursor.bottom,
            '}': () => cursor.jump(1, r => r.kind === 'header'),
            '{': () => cursor.jump(-1, r => r.kind === 'header'),
            'h ArrowLeft': () => switchPane(paneIndex - 1),
            'l ArrowRight Tab': () => switchPane(paneIndex + 1),
            'S-Tab': () => switchPane(paneIndex - 1),
            'x Space': () => {
              if (currentItem) update([currentItem.id], {done: !currentItem.done});
              else if (current) toggleFold(current.section.key);
            },
            'e Enter': () => {
              if (currentItem) setMode({kind: 'edit', id: currentItem.id});
              else if (current) toggleFold(current.section.key);
            },
            'o a': () => current && setMode({kind: 'add', group: current.section.key}),
            v: () => {
              if (!currentItem) return;
              toggleSelected(currentItem.id);
              cursor.move(1);
            },
            m: () => targets().length > 0 && setMode({kind: 'move', ids: targets()}),
            dd: () => targets().length > 0 && confirmDelete(targets()),
            'za zo zc': () => current && toggleFold(current.section.key),
            zM: () => setAllFolded(GROUPS, true),
            zR: () => setAllFolded(GROUPS, false),
            'gt gT': onNextTab,
            '/': () => setMode({kind: 'search', previous: filter}),
            ':': () => setMode({kind: 'command'}),
            '?': () => setMode({kind: 'help'}),
            Escape: () => {
              clearSelection();
              setFilter('');
            },
          }
        : {},
    {
      enabled: active,
      onKey: () => setMessage(null),
      onUnbound: () => {
        if (mode.kind !== 'confirm') return;
        setMode({kind: 'normal'});
        info('cancelled');
      },
    },
  );

  const runCommand = (line: string) => {
    const [cmd, ...rest] = line.trim().split(/\s+/);
    const arg = rest.join(' ');
    setMode({kind: 'normal'});
    if (cmd === 'add' && arg) {
      setItems(prev => [...prev, {id: crypto.randomUUID(), text: arg, group: 'inbox', done: false, color: null}]);
      info('added to Inbox');
    } else if (cmd === 'rename' && currentItem) {
      const id = currentItem.id;
      setMode({
        kind: 'prompt',
        label: 'new name: ',
        onSubmit: value => {
          if (value.trim()) update([id], {text: value.trim()});
          setMode({kind: 'normal'});
        },
      });
    } else if (cmd === 'clear') {
      const done = items.filter(it => it.done).map(it => it.id);
      if (done.length) confirmDelete(done);
      else info('nothing checked');
    } else if (cmd === 'theme') {
      if (onTheme(arg)) info(`theme: ${arg}`);
      else setMessage({text: `usage: :theme ${themeNames.join('|')}`, kind: 'error'});
    } else if (cmd === 'help') {
      setMode({kind: 'help'});
    } else if (cmd) {
      setMessage({text: `E492: Not an editor command: ${line}`, kind: 'error'});
    }
  };

  const onRowMouseDown = (i: number) => (row: ListRow<Item>, e: React.MouseEvent) => {
    setPaneIndex(i);
    cursors[i].setKey(row.key);
    if (row.item && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      toggleSelected(row.item.id);
    }
  };

  const editing = mode.kind === 'edit' ? items.find(it => it.id === mode.id) : undefined;
  const [badge, tone] = MODE_BADGES[mode.kind];

  return (
    <TabScreen hidden={!active}>
      <Panes wide={wide}>
        {PANES.map((p, i) => (
          <Box
            key={p.id}
            title={`${i + 1}:${p.title}`}
            active={i === paneIndex}
          >
            <SectionList
              sections={paneSections[i]}
              getKey={it => it.id}
              folded={folded}
              cursorKey={cursors[i].key}
              onToggleFold={toggleFold}
              onRowMouseDown={onRowMouseDown(i)}
              renderItem={it => ({
                children: it.text,
                done: it.done,
                color: it.color,
                selected: selected.has(it.id),
                tag: it.group === 'today' ? 'fri' : undefined,
                onToggleDone: () => update([it.id], {done: !it.done}),
                onDoubleClick: () => setMode({kind: 'edit', id: it.id}),
              })}
              onOpenAdd={s => setMode({kind: 'add', group: s.key})}
              addingTo={mode.kind === 'add' ? mode.group : null}
              onAdd={(s, text) =>
                setItems(prev => [...prev, {id: crypto.randomUUID(), text, group: s.key, done: false, color: null}])
              }
              onCloseAdd={() => setMode(m => (m.kind === 'add' ? {kind: 'normal'} : m))}
              addPlaceholder='new item · enter adds · esc done'
            />
          </Box>
        ))}
      </Panes>

      <StatusBar>
        <ModeBadge tone={tone}>{badge}</ModeBadge>
        <span>{current ? current.section.title : ''}</span>
        {selected.size > 0 && <span className='accent'>{selected.size} selected</span>}
        {filter && <span className='warn'>/{filter}</span>}
        <span className='grow' />
        <LinkButton onClick={() => setMode({kind: 'help'})}>? help</LinkButton>
        <Clock />
      </StatusBar>

      <BottomLine
        mode={mode}
        message={message}
        onCommand={runCommand}
        completeCommand={wordCompleter(['add', 'rename', 'clear', 'help'])}
        onSearchChange={setFilter}
        onSearchDone={keep => {
          if (!keep && mode.kind === 'search') setFilter(mode.previous);
          setMode({kind: 'normal'});
        }}
        onPrompt={value => mode.kind === 'prompt' && mode.onSubmit(value)}
        onCancel={() => setMode({kind: 'normal'})}
      />

      {mode.kind === 'help' && (
        <HelpDialog
          groups={HELP}
          onClose={() => setMode({kind: 'normal'})}
        />
      )}
      {mode.kind === 'move' && (
        <Picker
          title={`move ${plural(mode.ids.length, 'item')}`}
          items={GROUPS.map((g, i) => ({id: g, label: g, hotkey: String(i + 1)}))}
          onCancel={() => setMode({kind: 'normal'})}
          onPick={group => {
            update(mode.ids, {group});
            clearSelection();
            setMode({kind: 'normal'});
            info(`moved to ${group}`);
          }}
        />
      )}
      {editing && (
        <EditItem
          item={editing}
          onSave={changes => {
            update([editing.id], changes);
            setMode({kind: 'normal'});
          }}
          onCancel={() => setMode({kind: 'normal'})}
        />
      )}
    </TabScreen>
  );
};

const EditItem = ({
  item,
  onSave,
  onCancel,
}: {
  item: Item;
  onSave: (changes: Partial<Item>) => void;
  onCancel: () => void;
}) => {
  const [text, setText] = useState(item.text);
  const [group, setGroup] = useState(item.group);
  const [color, setColor] = useState(item.color);
  const [done, setDone] = useState(item.done);
  const [error, setError] = useState<string | null>(null);

  return (
    <FormDialog
      title='edit item'
      error={error}
      focus={error ? 'text' : undefined}
      onCancel={onCancel}
      onSave={() => (text.trim() ? onSave({text: text.trim(), group, color, done}) : setError('text is empty'))}
      fields={[
        {kind: 'text', name: 'text', label: 'text', value: text, onChange: setText},
        choiceField({
          name: 'list',
          label: 'list',
          value: group,
          onChange: setGroup,
          options: GROUPS.map(g => ({value: g, label: g})),
        }),
        choiceField({
          name: 'color',
          label: 'color',
          value: color,
          onChange: setColor,
          options: [{value: null, label: 'none'}, ...COLORS.map(c => ({value: c, color: c}))],
        }),
        {kind: 'toggle', name: 'done', label: 'done', value: done, onChange: setDone, on: 'done', off: 'not done'},
      ]}
    />
  );
};
