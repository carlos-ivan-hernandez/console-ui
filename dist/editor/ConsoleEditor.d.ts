import { type Extension } from '@codemirror/state';
import { type DecorationSet, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { type HeadingColors } from '../markdown';
/** Markdown syntax colors: headings in `colors`, code yellow, links blue. */
export declare const markdownHighlight: (c?: HeadingColors) => Extension;
/** Colors each list dash like the heading above it. */
export declare const dashHighlight: (c?: HeadingColors) => ViewPlugin<{
    decorations: DecorationSet;
    update(update: ViewUpdate): void;
}, undefined>;
/** The console look for CodeMirror: no gutters, theme colors, block cursor in vim normal mode. */
export declare const consoleTheme: Extension;
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
export declare const ConsoleEditor: (props: ConsoleEditorProps) => import("react").JSX.Element;
