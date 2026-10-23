import {markdown} from '@codemirror/lang-markdown';
import {HighlightStyle, syntaxHighlighting} from '@codemirror/language';
import {Compartment, type Extension} from '@codemirror/state';
import {Decoration, type DecorationSet, EditorView, keymap, ViewPlugin, type ViewUpdate} from '@codemirror/view';
import {tags} from '@lezer/highlight';
import {getCM, Vim, vim} from '@replit/codemirror-vim';
import {basicSetup} from 'codemirror';
import {useEffect, useRef} from 'react';
import {DEFAULT_HEADING_COLORS, type HeadingColors} from '../markdown';

// ── Vim ex commands ───────────────────────────────────────────────────────────
// Vim's ex commands are global, so they call the most recently mounted editor.

const exHandlers: {write: () => void; quit: () => void} = {write: () => {}, quit: () => {}};

Vim.defineEx('write', 'w', () => exHandlers.write());
Vim.defineEx('quit', 'q', () => exHandlers.quit());
Vim.defineEx('wq', 'wq', () => {
  exHandlers.write();
  exHandlers.quit();
});
Vim.defineEx('xit', 'x', () => {
  exHandlers.write();
  exHandlers.quit();
});

// ── Styling ───────────────────────────────────────────────────────────────────

/** Markdown syntax colors: headings in `colors`, code yellow, links blue. */
export const markdownHighlight = (c: HeadingColors = DEFAULT_HEADING_COLORS) =>
  syntaxHighlighting(
    HighlightStyle.define([
      {tag: tags.heading1, color: c.h1, fontWeight: 'bold'},
      {tag: tags.heading2, color: c.h2, fontWeight: 'bold'},
      {tag: tags.heading3, color: c.h3},
      {tag: tags.heading4, color: c.h4},
      {tag: tags.heading5, color: c.h5},
      {tag: tags.heading6, color: c.h6},
      {tag: tags.emphasis, fontStyle: 'italic'},
      {tag: tags.strong, fontWeight: 'bold'},
      {tag: tags.monospace, color: 'var(--warn)'},
      {tag: tags.link, color: 'var(--blue)'},
      {tag: tags.processingInstruction, color: 'var(--dim)'},
    ]),
  );

/** Colors each list dash like the heading above it. */
export const dashHighlight = (c: HeadingColors = DEFAULT_HEADING_COLORS) => {
  const levels = [c.h1, c.h2, c.h3, c.h4, c.h5, c.h6];
  const build = (view: EditorView): DecorationSet => {
    const ranges = [];
    let color = c.h1;
    for (let n = 1; n <= view.state.doc.lines; n++) {
      const line = view.state.doc.line(n);
      const heading = /^(#{1,6})\s+/.exec(line.text);
      if (heading) color = levels[heading[1].length - 1] ?? c.h1;
      const dash = /^(\s*)-/.exec(line.text);
      if (dash) {
        const from = line.from + dash[1].length;
        ranges.push(Decoration.mark({attributes: {style: `color: ${color}`}}).range(from, from + 1));
      }
    }
    return Decoration.set(ranges, true);
  };
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = build(view);
      }
      update(update: ViewUpdate) {
        if (update.docChanged) this.decorations = build(update.view);
      }
    },
    {decorations: plugin => plugin.decorations},
  );
};

/** The console look for CodeMirror: no gutters, theme colors, block cursor in vim normal mode. */
export const consoleTheme = EditorView.theme(
  {
    '&': {height: '100%', backgroundColor: 'transparent', color: 'var(--fg)', fontSize: 'inherit'},
    '&.cm-focused': {outline: 'none'},
    '.cm-scroller': {fontFamily: 'var(--font)', lineHeight: '1.5', overflow: 'auto'},
    '.cm-content': {padding: '0', caretColor: 'var(--accent)'},
    '.cm-line': {padding: '0'},
    '.cm-gutters': {display: 'none'},
    '.cm-activeLine': {backgroundColor: 'var(--bg-cursor)'},
    '&:not(.cm-focused) .cm-activeLine': {backgroundColor: 'transparent'},
    '.cm-cursor': {borderLeftColor: 'var(--accent)', borderLeftWidth: '2px'},
    '.cm-fat-cursor': {background: 'var(--accent) !important', color: 'var(--bg) !important'},
    '&:not(.cm-focused) .cm-fat-cursor': {background: 'none !important', outline: '1px solid var(--dim)'},
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'var(--bg-selection) !important',
    },
    '.cm-panels': {backgroundColor: 'var(--bg-bar)', color: 'var(--fg)'},
    '.cm-panels-bottom': {borderTop: '1px solid var(--border)'},
    '.cm-vim-panel input': {fontFamily: 'var(--font)', color: 'var(--fg)'},
    '.cm-searchMatch': {backgroundColor: 'var(--bg-search-match)'},
  },
  {dark: true},
);

/** Tab inserts spaces up to the next multiple of `width`. */
const softTab = (width: number) =>
  keymap.of([
    {
      key: 'Tab',
      run: v => {
        const pos = v.state.selection.main.head;
        const col = pos - v.state.doc.lineAt(pos).from;
        v.dispatch(v.state.replaceSelection(' '.repeat(width - (col % width))));
        return true;
      },
    },
  ]);

const markdownStyle = (colors: HeadingColors | false) =>
  colors === false ? [] : [markdown({addKeymap: false}), markdownHighlight(colors), dashHighlight(colors)];

// ── Component ─────────────────────────────────────────────────────────────────

export interface ConsoleEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Vim keys. Default true. */
  vimEnabled?: boolean;
  /** Markdown highlighting with these heading colors. Pass `false` for plain text. */
  markdownColors?: HeadingColors | false;
  /** Whether keyboard focus belongs in the editor. */
  focused?: boolean;
  /** `:w` (and `:wq`, `:x`). */
  onWrite?: () => void;
  /** Leave the editor: `:q`, or Esc when there's nothing left for Esc to do. */
  onExit?: () => void;
  onFocus?: () => void;
  /** Vim's mode ("normal", "insert", "visual", "replace"), or "insert" without vim. */
  onModeChange?: (mode: string) => void;
  /** Spaces per Tab. Default 2. */
  tabWidth?: number;
  /** More CodeMirror extensions (set once, when the editor is created). */
  extensions?: Extension[];
  className?: string;
}

/**
 * CodeMirror 6 with vim keys, themed to match. Text changed from outside
 * (e.g. a reload) is taken in without losing the cursor. Remount it with a
 * `key` to edit a different document.
 */
export const ConsoleEditor = (props: ConsoleEditorProps) => {
  const {vimEnabled = true, markdownColors = DEFAULT_HEADING_COLORS, focused, value} = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const vimConf = useRef(new Compartment());
  const styleConf = useRef(new Compartment());
  const vimMode = useRef('normal');
  // Long-lived editor callbacks read the newest props through this ref.
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  // Build the editor once; later prop changes reconfigure it in place so the
  // cursor, scroll position and vim mode survive.
  useEffect(() => {
    const p = propsRef.current;
    const startVim = p.vimEnabled ?? true;
    const view = new EditorView({
      doc: p.value,
      parent: containerRef.current!,
      extensions: [
        vimConf.current.of(startVim ? vim() : []),
        basicSetup,
        softTab(p.tabWidth ?? 2),
        consoleTheme,
        styleConf.current.of(markdownStyle(p.markdownColors ?? DEFAULT_HEADING_COLORS)),
        EditorView.lineWrapping,
        EditorView.updateListener.of(update => {
          if (update.docChanged) propsRef.current.onChange(update.state.doc.toString());
          if (update.focusChanged && update.view.hasFocus) propsRef.current.onFocus?.();
        }),
        ...(p.extensions ?? []),
      ],
    });
    viewRef.current = view;

    const cm = getCM(view);
    const onVimMode = (e: {mode: string}) => {
      vimMode.current = e.mode;
      propsRef.current.onModeChange?.(e.mode);
    };
    cm?.on('vim-mode-change', onVimMode);

    exHandlers.write = () => propsRef.current.onWrite?.();
    exHandlers.quit = () => propsRef.current.onExit?.();

    return () => {
      cm?.off('vim-mode-change', onVimMode);
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    vimMode.current = 'normal';
    propsRef.current.onModeChange?.(vimEnabled ? 'normal' : 'insert');
    viewRef.current?.dispatch({effects: vimConf.current.reconfigure(vimEnabled ? vim() : [])});
  }, [vimEnabled]);

  useEffect(() => {
    viewRef.current?.dispatch({effects: styleConf.current.reconfigure(markdownStyle(markdownColors))});
  }, [markdownColors]);

  // Text changed elsewhere: take it without losing the cursor.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      const head = Math.min(view.state.selection.main.head, value.length);
      view.dispatch({changes: {from: 0, to: current.length, insert: value}, selection: {anchor: head}});
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || focused === undefined) return;
    if (focused && !view.hasFocus) view.focus();
    if (!focused && view.hasFocus) view.contentDOM.blur();
  }, [focused]);

  return (
    <div
      ref={containerRef}
      className={`console-editor ${props.className ?? ''}`}
      onKeyDownCapture={e => {
        // Esc with nothing to cancel (vim already in normal mode) leaves the editor.
        // Vim's own `:` and `/` prompts are inputs; Esc there just closes the prompt.
        if (e.key !== 'Escape' || e.target instanceof HTMLInputElement) return;
        const p = propsRef.current;
        if (p.onExit && (!(p.vimEnabled ?? true) || vimMode.current === 'normal')) {
          e.preventDefault();
          e.stopPropagation();
          p.onExit();
        }
      }}
    />
  );
};
