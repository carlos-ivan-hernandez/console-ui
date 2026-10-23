import {useState} from 'react';

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
export type LineMode =
  | {kind: 'command'}
  | {kind: 'search'}
  | {kind: 'prompt'; label: string; initial?: string; complete?: Completer}
  | {kind: 'confirm'; question: string}
  | {kind: string};

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
export const BottomLine = (props: BottomLineProps) => {
  const {mode, message} = props;
  if (mode.kind === 'command') {
    return (
      <LineInput
        prefix=':'
        complete={props.completeCommand}
        onSubmit={line => props.onCommand?.(line)}
        onCancel={props.onCancel}
      />
    );
  }
  if (mode.kind === 'search') {
    return (
      <LineInput
        prefix='/'
        onChange={props.onSearchChange}
        onSubmit={() => props.onSearchDone?.(true)}
        onCancel={() => props.onSearchDone?.(false)}
        onBlur={() => props.onSearchDone?.(true)}
      />
    );
  }
  if (mode.kind === 'prompt' && 'label' in mode) {
    return (
      <LineInput
        prefix={mode.label}
        initial={'initial' in mode ? mode.initial : undefined}
        complete={'complete' in mode ? mode.complete : undefined}
        onSubmit={value => props.onPrompt?.(value)}
        onCancel={props.onCancel}
      />
    );
  }
  if (mode.kind === 'confirm' && 'question' in mode) {
    return <div className='bottomline warn'>{mode.question}</div>;
  }
  return (
    <div className={`bottomline ${message?.kind === 'error' ? 'error' : ''}`}>
      {message ? (message.kind === 'error' && !message.text.startsWith('E') ? `E: ${message.text}` : message.text) : ''}
    </div>
  );
};

interface LineInputProps {
  prefix: string;
  onChange?: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  /** Defaults to cancelling. */
  onBlur?: () => void;
  initial?: string;
  complete?: Completer;
}

const LineInput = ({
  prefix,
  onChange,
  onSubmit,
  onCancel,
  onBlur = onCancel,
  initial = '',
  complete,
}: LineInputProps) => {
  const [value, setValue] = useState(initial);
  return (
    <div className='bottomline'>
      <span>{prefix}</span>
      <input
        autoFocus
        className='prompt-input'
        value={value}
        spellCheck={false}
        onChange={e => {
          setValue(e.target.value);
          onChange?.(e.target.value);
        }}
        onBlur={onBlur}
        onFocus={e => e.currentTarget.setSelectionRange(value.length, value.length)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit(value);
          } else if (e.key === 'Tab' && complete) {
            e.preventDefault();
            const completed = complete(value);
            if (completed !== null) setValue(completed);
          } else if (e.key === 'Escape' || (e.key === 'Backspace' && value === '')) {
            e.preventDefault();
            onCancel();
          }
        }}
        aria-label={prefix}
      />
    </div>
  );
};

/** A Tab completer for a fixed word list: completes the last word to the first word that starts with it. */
export const wordCompleter =
  (words: string[]): Completer =>
  value => {
    const at = value.lastIndexOf(' ') + 1;
    const word = value.slice(at);
    const match = words.find(w => w.startsWith(word) && w !== word);
    return match === undefined ? null : value.slice(0, at) + match;
  };
