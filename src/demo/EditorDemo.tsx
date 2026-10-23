import {lazy, Suspense, useState} from 'react';
import {
  Box,
  BottomLine,
  Clock,
  LinkButton,
  MarkdownPreview,
  type Message,
  ModeBadge,
  Panes,
  StatusBar,
  TabScreen,
  useKeymap,
  useStoredState,
  useWideLayout,
} from '../lib';

// The editor pulls in CodeMirror, so load it only when this tab is opened.
const ConsoleEditor = lazy(() => import('../lib/editor').then(m => ({default: m.ConsoleEditor})));

const SAMPLE = `# console-ui
Markdown with colored headings.

## Lists
- dashes take the color of the heading above
- \`code\` is yellow, [links](https://example.com) are blue

### Vim
- i to insert, esc for normal mode
- :w writes, :q (or esc in normal mode) leaves the editor
`;

/** The CodeMirror editor with vim keys next to a live markdown preview. */
export const EditorDemo = ({active, onNextTab}: {active: boolean; onNextTab: () => void}) => {
  const [text, setText] = useState(SAMPLE);
  const [editing, setEditing] = useState(false);
  const [vimEnabled, setVimEnabled] = useStoredState('console-ui-demo-vim', true);
  const [vimMode, setVimMode] = useState('normal');
  const [message, setMessage] = useState<Message | null>(null);
  const [command, setCommand] = useState(false);
  const wide = useWideLayout();

  useKeymap(
    {
      'i e Enter': () => setEditing(true),
      'gt gT': onNextTab,
      ':': () => setCommand(true),
    },
    {enabled: active && !editing && !command, onKey: () => setMessage(null)},
  );

  return (
    <TabScreen hidden={!active}>
      <Panes
        wide={wide}
        columns='1fr 1fr'
      >
        <Box
          title='1:edit'
          active={editing}
        >
          {editing ? (
            <Suspense fallback={<p className='dim'>loading editor…</p>}>
              <ConsoleEditor
                value={text}
                onChange={setText}
                vimEnabled={vimEnabled}
                focused={editing}
                onModeChange={setVimMode}
                onWrite={() => setMessage({text: '"sample.md" written', kind: 'info'})}
                onExit={() => setEditing(false)}
              />
            </Suspense>
          ) : (
            <div
              className='pane-scroll'
              onDoubleClick={() => setEditing(true)}
            >
              <MarkdownPreview content={text} />
            </div>
          )}
        </Box>
        <Box
          title='2:preview'
          active={!editing}
        >
          <div className='pane-scroll'>
            <MarkdownPreview content={text} />
          </div>
        </Box>
      </Panes>

      <StatusBar>
        <ModeBadge tone={editing ? 'blue' : command ? 'warn' : 'accent'}>
          {editing ? 'EDIT' : command ? 'COMMAND' : 'NORMAL'}
        </ModeBadge>
        {editing && vimEnabled && <span className='accent'>-- {vimMode.toUpperCase()} --</span>}
        <span className='status-path'>~/sample.md</span>
        <span className='grow' />
        <LinkButton
          onClick={() => setVimEnabled(!vimEnabled)}
          title='Toggle vim keys (:vim / :novim)'
        >
          {vimEnabled ? 'vim' : 'novim'}
        </LinkButton>
        <Clock />
      </StatusBar>

      <BottomLine
        mode={{kind: command ? 'command' : editing ? 'edit' : 'normal'}}
        message={message ?? (editing ? null : {text: 'i or enter edits · :vim / :novim · gt next tab', kind: 'info'})}
        onCommand={line => {
          setCommand(false);
          if (line === 'vim' || line === 'novim') setVimEnabled(line === 'vim');
          else if (line) setMessage({text: `E492: Not an editor command: ${line}`, kind: 'error'});
        }}
        onCancel={() => setCommand(false)}
      />
    </TabScreen>
  );
};
