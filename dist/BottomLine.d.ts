export interface Message {
    text: string;
    kind: 'info' | 'error';
}
/** Given the text so far, returns it with the last word completed, or null. */
export type Completer = (value: string) => string | null;
/**
 * What the bottom line is doing. Any other `kind` (e.g. your app's `normal`)
 * shows the current message.
 */
export type LineMode = {
    kind: 'command';
} | {
    kind: 'search';
} | {
    kind: 'prompt';
    label: string;
    initial?: string;
    complete?: Completer;
} | {
    kind: 'confirm';
    question: string;
} | {
    kind: string;
};
export interface BottomLineProps {
    mode: LineMode;
    message?: Message | null;
    /** Enter on the `:` line. */
    onCommand?: (line: string) => void;
    /** Tab completion for the `:` line. */
    completeCommand?: Completer;
    /** Every keystroke on the `/` line, for live filtering. */
    onSearchChange?: (text: string) => void;
    /** `keep` is false when the search was abandoned with Esc. */
    onSearchDone?: (keep: boolean) => void;
    onPrompt?: (value: string) => void;
    /** Esc, or Backspace on an empty line. */
    onCancel: () => void;
}
/** The last screen line, as in vim: messages, the `:` command line, `/` search and prompts. */
export declare const BottomLine: (props: BottomLineProps) => import("react").JSX.Element;
/** A Tab completer for a fixed word list: completes the last word to the first word that starts with it. */
export declare const wordCompleter: (words: string[]) => Completer;
