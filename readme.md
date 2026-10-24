# console-ui

React components for terminal-style, keyboard-first web apps with the [vera-console](../vera-console) look: boxed panes, a tmux-style tab bar, a vim-style status bar and bottom line, fzf-style pickers, and a CodeMirror editor with vim keys.

Everything is plain DOM in a monospace grid, so the mouse, scrolling, text input and password managers all work normally.

```sh
pnpm install
pnpm dev                # demo app at http://localhost:1778 (any login works)
pnpm build              # builds the library into dist/
pnpm release 0.3.0      # publishes v0.3.0 to GitHub (see Releasing)
```

The demo in [src/demo](src/demo) uses every component, so it's the best place to start reading.

## Use it in a new app

1. Create a React app (`pnpm create vite my-app --template react-ts`).
2. Add console-ui to the app's `package.json` from GitHub, pinned to a release tag, and run `pnpm install`:

   ```json
   "dependencies": {
     "console-ui": "github:carlos-ivan-hernandez/console-ui#v0.1.0"
   }
   ```

   This works anywhere, including Vercel, with nothing to build. To move to a newer release, change the tag and run `pnpm install`.

3. Import the stylesheet once, in `main.tsx`:

   ```ts
   import 'console-ui/style.css';
   ```

4. Build the screen:

   ```tsx
   import {useState} from 'react';
   import {
     Box,
     BottomLine,
     Clock,
     ItemRow,
     ModeBadge,
     Panes,
     Screen,
     StatusBar,
     TabScreen,
     TopBar,
     useCursor,
     useKeymap,
     useWideLayout,
   } from 'console-ui';

   const items = [
     {key: 'a', text: 'first'},
     {key: 'b', text: 'second'},
   ];

   export const App = () => {
     const cursor = useCursor(items);
     const [mode, setMode] = useState({kind: 'normal'});
     const wide = useWideLayout();

     useKeymap(
       {
         'j ArrowDown': () => cursor.move(1),
         'k ArrowUp': () => cursor.move(-1),
         'gg Home': cursor.top,
         'G End': cursor.bottom,
         ':': () => setMode({kind: 'command'}),
       },
       {enabled: mode.kind === 'normal'},
     );

     return (
       <Screen>
         <TopBar badge='myapp' />
         <TabScreen>
           <Panes wide={wide}>
             <Box title='1:items'>
               {items.map(it => (
                 <ItemRow
                   key={it.key}
                   isCursor={cursor.key === it.key}
                 >
                   {it.text}
                 </ItemRow>
               ))}
             </Box>
           </Panes>
           <StatusBar>
             <ModeBadge>NORMAL</ModeBadge>
             <span className='grow' />
             <Clock />
           </StatusBar>
           <BottomLine
             mode={mode}
             onCommand={() => setMode({kind: 'normal'})}
             onCancel={() => setMode({kind: 'normal'})}
           />
         </TabScreen>
       </Screen>
     );
   };
   ```

## Components

### Layout

| Component                | What it is                                                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Screen`                 | The full-height app frame: top bar, then the tab screen.                                                                                                             |
| `TopBar`                 | `[badge] 1:tasks* 2:notes … right side`. Pass `tabs`, `activeTab`, `onSelectTab`; children go on the right.                                                          |
| `TabScreen`              | One tab: panes, status bar, bottom line. Keep every tab mounted and pass `hidden` to the inactive ones so they keep their state.                                     |
| `Panes`                  | Grid of boxes. `wide` puts them side by side (use `useWideLayout()`); `columns` sets the grid columns, e.g. `'minmax(28ch, 36ch) 1fr'`.                              |
| `Box`                    | A bordered panel with its title in the top edge. `active` gives it the green border.                                                                                 |
| `StatusBar`, `ModeBadge` | The bar above the bottom line. `ModeBadge tone` is `accent` (NORMAL), `blue` (INSERT/EDIT), `warn` (COMMAND/SEARCH/PROMPT), `error` (CONFIRM) or `purple`.           |
| `BottomLine`             | vim's last line. `mode.kind` of `command` (`:`), `search` (`/`), `prompt`, `confirm` or anything else (shows `message`). `wordCompleter([...])` adds Tab completion. |
| `Clock`, `LinkButton`    | `HH:MM`, and dim text buttons like `[logout]`.                                                                                                                       |

### Lists

| Component / hook                     | What it is                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `SectionList`                        | Foldable sections of items with `[+]` add rows. Give it `sections`, `getKey`, and `renderItem` returning `ItemRow` props. |
| `ItemRow`                            | `› ● ▌[ ] fri  text ¶`: cursor, selection, color bar, checkbox (`done`: true/false, `null` for `·`), `tag`, `suffix`.     |
| `SectionHeader`, `AddRow`            | The pieces `SectionList` is made of, for custom lists.                                                                    |
| `listRows(sections, getKey, folded)` | The visible rows in order. Feed it to `useCursor`.                                                                        |
| `useCursor(rows)`                    | Cursor that follows its row by key: `move`, `moveTo`, `top`, `bottom`, `setKey`, `jump(±1, test)`.                        |
| `useFolded(storageKey)`              | Folded section keys, saved in localStorage: `toggleFold`, `setAllFolded`.                                                 |
| `useSelection()`                     | A set of selected ids: `toggle`, `clear`.                                                                                 |

Rows scroll themselves into view when they get the cursor. Sections can carry extra fields of your own (e.g. `type MySection = ListSection<Todo> & {canReorder: boolean}`); `SectionList` and `listRows` hand your section type back in callbacks and rows.

### Dialogs

| Component    | What it is                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Picker`     | fzf-style: type to filter, ↑↓ or Ctrl-N/P/J/K to move, Enter picks. Items can have a `hotkey` and a color `swatch`.                   |
| `FormDialog` | Fields of kind `text`, `choice` (use `choiceField()` for typed values) or `toggle`. Tab/↑↓ move, ←→ change, Enter saves, Esc cancels. |
| `HelpDialog` | The `?` screen: groups of `[keys, description]`. Esc, q, ? or Enter closes it.                                                        |
| `Dialog`     | A boxed dialog over a dimmed screen, for anything else. `closeKeys` defaults to Esc.                                                  |
| `Overlay`    | Just the dimmed backdrop.                                                                                                             |

### Other

| Component         | What it is                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `LoginScreen`     | getty-style `login:` / `password:` with an ASCII `banner`. `onSignIn` resolves to an error message or null.              |
| `MarkdownPreview` | Colored headings and list dashes, everything else as written.                                                            |
| `ConsoleEditor`   | From `console-ui/editor`: CodeMirror 6 with vim keys. `:w` calls `onWrite`; `:q`, or Esc in normal mode, calls `onExit`. |

`ConsoleEditor` lives in its own entry point so apps that don't use it don't need CodeMirror. To use it, install CodeMirror in the app too:

```sh
pnpm add codemirror @codemirror/state @codemirror/view @codemirror/language @codemirror/lang-markdown @lezer/highlight @replit/codemirror-vim
```

Load it with `lazy(() => import('console-ui/editor').then(m => ({default: m.ConsoleEditor})))` to keep it out of the first page load.

## Keys

`useKeymap(keymap, {enabled, onKey, onUnbound})` listens on the window. List alternatives with spaces; sequences of characters just work:

```ts
useKeymap(
  {
    'j ArrowDown': down,
    'gg Home': top, // gg waits up to 1s for the second g
    dd: remove,
    'x Space': toggle, // the space bar is `Space`
    'S-Tab': previousPane, // shift+tab
  },
  {enabled: active && mode.kind === 'normal'},
);
```

It ignores keys typed in inputs, inside `.overlay` dialogs, and with ⌘/Ctrl/Alt held, so browser shortcuts keep working. For a "press y to confirm" prompt, bind `'y Y'` and cancel in `onUnbound`.

## Theme

Every color is a CSS variable, and most of them are mixed from a few base colors. A whole theme can be as small as a background, a text color and an accent.

From JS, call `applyTheme` once at startup (it also updates `<meta name="theme-color">`), or `useTheme` inside a component:

```ts
import {applyTheme, themes} from 'console-ui';

applyTheme({bg: '#1c1c1c'}); // keep the default colors, change the background
applyTheme(themes.gruvbox); // or a ready-made theme
applyTheme({...themes.nord, accent: '#a3be8c'}); // or a variation
```

Ready-made themes: `console` (the default), `gruvbox`, `nord`, `dracula`, `solarized`, `amber` and `paper` (light). The demo cycles through them with the `[theme]` button in the top bar, or `:theme <name>`.

Or in CSS, after importing the stylesheet:

```css
:root {
  --bg: #1c1c1c;
  --accent: #ffa657;
}
```

To theme only part of a page, give an element the `console-theme` class and the variables, e.g. `<div className='console-theme' style={themeStyle(themes.paper)}>`.

| Variable (`Theme` key)                                               | Used for                                                    | Default                  |
| -------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------ |
| `--bg` (`bg`), `--fg` (`fg`)                                         | Page background, text                                       | base                     |
| `--accent` (`accent`)                                                | Cursor, active borders, NORMAL badge, login banner          | base                     |
| `--blue`, `--purple`, `--warn`, `--error`                            | Section titles, selection, dates/prompts, errors            | base                     |
| `--bg-bar` (`bgBar`), `--bg-cursor` (`bgCursor`)                     | Top and status bars, the cursor line                        | `fg` mixed into `bg`     |
| `--dim` (`dim`), `--border` (`border`)                               | Secondary text, box borders                                 | `fg` mixed into `bg`     |
| `--border-active` (`borderActive`), `--bg-selection` (`bgSelection`) | Focused box border, selected text                           | `accent` mixed into `bg` |
| `--bg-search-match` (`bgSearchMatch`)                                | Search matches in the editor                                | `warn` mixed into `bg`   |
| `--backdrop` (`backdrop`)                                            | Behind dialogs                                              | `rgb(0 0 0 / 0.6)`       |
| `--font` (`font`)                                                    | JetBrains Mono (loaded from Google Fonts by the stylesheet) |                          |

Set a mixed color directly to override it. For a light theme pass `scheme: 'light'` so scrollbars and form controls match.

Helper classes: `dim`, `accent`, `blue`, `purple`, `warn`, `error`, `bold`, `grow` (fills a flex row), `hide-narrow` (hidden under 600px), `boot` (a padded loading line), `pane-scroll` (a scrolling area inside a `Box`), `status-path`.

## Releasing

Apps install console-ui from GitHub tags, so changes reach them through a release:

```sh
pnpm release 0.3.0
```

The working tree must be clean. The script sets the version in `package.json` and commits it, builds the library, commits the build to the `release` branch, tags it `v0.3.0`, and pushes master, `release` and the tag. The `release` branch only ever holds built files (`dist`, `package.json`, this readme); the source stays on master.

Then bump the tag in each app (`"console-ui": "github:carlos-ivan-hernandez/console-ui#v0.3.0"`) and run `pnpm install` there.

To try unreleased console-ui changes in an app locally, link it instead (`pnpm link ../console-ui` in the app, after `pnpm build` here), and run `pnpm install` in the app to go back to the release before committing.
