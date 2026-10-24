import {useState} from 'react';
import {
  LinkButton,
  LoginScreen,
  Screen,
  type TabDef,
  type ThemeName,
  themes,
  TopBar,
  useStoredState,
  useTheme,
} from '../lib';
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
const isThemeName = (name: string): name is ThemeName => Object.hasOwn(themes, name);
const THEME_NAMES = Object.keys(themes).filter(isThemeName);
const TABS: TabDef<Tab>[] = [
  {id: 'list', label: 'list', title: 'Lists, dialogs and keys (gt)'},
  {id: 'editor', label: 'editor', title: 'Vim editor and markdown (gt)'},
];

export const App = () => {
  const [user, setUser] = useState<string | null>(null);
  const [tab, setTab] = useStoredState<Tab>('console-ui-demo-tab', 'list');
  const nextTab = () => setTab(tab === 'list' ? 'editor' : 'list');
  const [themeName, setThemeName] = useStoredState<ThemeName>('console-ui-demo-theme', 'console');
  useTheme(themes[isThemeName(themeName) ? themeName : 'console']);
  const nextTheme = () => setThemeName(THEME_NAMES[(THEME_NAMES.indexOf(themeName) + 1) % THEME_NAMES.length]);
  /** For `:theme <name>`; returns false for an unknown name. */
  const chooseTheme = (name: string) => {
    if (!isThemeName(name)) return false;
    setThemeName(name);
    return true;
  };

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
        <LinkButton
          onClick={nextTheme}
          title='Next theme (:theme <name>)'
        >
          [theme: {themeName}]
        </LinkButton>
        <span className='dim hide-narrow'>{user}</span>
        <LinkButton onClick={() => setUser(null)}>[logout]</LinkButton>
      </TopBar>
      <ListDemo
        active={tab === 'list'}
        onNextTab={nextTab}
        themeNames={THEME_NAMES}
        onTheme={chooseTheme}
      />
      <EditorDemo
        active={tab === 'editor'}
        onNextTab={nextTab}
      />
    </Screen>
  );
};
