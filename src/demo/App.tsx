import {useState} from 'react';
import {LinkButton, LoginScreen, Screen, type TabDef, TopBar, useStoredState} from '../lib';
import {EditorDemo} from './EditorDemo';
import {ListDemo} from './ListDemo';

const BANNER = [
  String.raw`                            _`,
  String.raw`  ___ ___  _ __  ___  ___ | | ___`,
  // A raw string can't end in a backslash.
  " / __/ _ \\| '_ \\/ __|/ _ \\| |/ _ \\",
  String.raw`| (_| (_) | | | \__ \ (_) | |  __/`,
  String.raw` \___\___/|_| |_|___/\___/|_|\___|  ui`,
].join('\n');

type Tab = 'list' | 'editor';
const TABS: TabDef<Tab>[] = [
  {id: 'list', label: 'list', title: 'Lists, dialogs and keys (gt)'},
  {id: 'editor', label: 'editor', title: 'Vim editor and markdown (gt)'},
];

export const App = () => {
  const [user, setUser] = useState<string | null>(null);
  const [tab, setTab] = useStoredState<Tab>('console-ui-demo-tab', 'list');
  const nextTab = () => setTab(tab === 'list' ? 'editor' : 'list');

  if (!user) {
    return (
      <LoginScreen
        banner={BANNER}
        intro={['console-ui 0.1.0 · demo', 'Any login works; the password "wrong" shows the error state.']}
        userType='text'
        onSignIn={async (name, password) => {
          await new Promise(resolve => setTimeout(resolve, 400));
          if (password === 'wrong') return 'bad password';
          setUser(name);
          return null;
        }}
      />
    );
  }

  return (
    <Screen>
      <TopBar
        badge='console-ui'
        tabs={TABS}
        activeTab={tab}
        onSelectTab={setTab}
      >
        <span className='dim hide-narrow'>{user}</span>
        <LinkButton onClick={() => setUser(null)}>[logout]</LinkButton>
      </TopBar>
      <ListDemo
        active={tab === 'list'}
        onNextTab={nextTab}
      />
      <EditorDemo
        active={tab === 'editor'}
        onNextTab={nextTab}
      />
    </Screen>
  );
};
