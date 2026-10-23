import {type KeyboardEvent, type ReactNode, useEffect, useRef, useState} from 'react';
import {Dialog} from './Overlays';

export interface ChoiceOption<V> {
  value: V;
  /** Text to show; with `color` and no label, a colored `■` is shown. */
  label?: ReactNode;
  color?: string;
}

/** One line of a form. Values are controlled by you; the dialog only handles focus and keys. */
export type FormField =
  | {
      kind: 'text';
      name: string;
      label: string;
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
      /** Shown dim after the input, e.g. `→ fri 31 oct` for a parsed date. Use `.error` for problems. */
      hint?: ReactNode;
    }
  | {
      kind: 'choice';
      name: string;
      label: string;
      options: ChoiceOption<unknown>[];
      value: unknown;
      onChange: (value: unknown) => void;
    }
  | {
      kind: 'toggle';
      name: string;
      label: string;
      value: boolean;
      onChange: (value: boolean) => void;
      /** What `[x]` and `[ ]` mean, e.g. `can be checked off` / `reference only`. */
      on: string;
      off: string;
    };

/** Builds a typed choice field without casts. */
export const choiceField = <V,>(field: {
  name: string;
  label: string;
  options: ChoiceOption<V>[];
  value: V;
  onChange: (value: V) => void;
}): FormField => ({
  kind: 'choice',
  ...field,
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  onChange: value => field.onChange(value as V),
});

export interface FormDialogProps {
  title: ReactNode;
  fields: FormField[];
  onSave: () => void;
  onCancel: () => void;
  /** Shown in red under the fields as `E: …`. Move the user to a field with `focus`. */
  error?: string | null;
  /** Dim note under the fields. */
  note?: ReactNode;
  /** Name of a field to move to, e.g. the one with an error. */
  focus?: string;
  footer?: ReactNode;
}

/**
 * vera-console's edit dialog. Tab / ↑↓ move between fields, ←→ (or h l) change
 * a choice, Space toggles, Enter saves from anywhere, Esc cancels.
 */
export const FormDialog = ({
  title,
  fields,
  onSave,
  onCancel,
  error,
  note,
  focus,
  footer = 'tab/↑↓ field · ←→ change · space toggle · enter save · esc cancel',
}: FormDialogProps) => {
  const [current, setCurrent] = useState(fields[0]?.name ?? '');
  const refs = useRef<Record<string, HTMLElement | null>>({});

  // Jump to `focus` whenever it changes (adjusting state during render, not in an effect).
  const [lastFocus, setLastFocus] = useState(focus);
  if (focus !== lastFocus) {
    setLastFocus(focus);
    if (focus) setCurrent(focus);
  }

  useEffect(() => {
    refs.current[current]?.focus();
  }, [current]);

  const index = Math.max(
    0,
    fields.findIndex(f => f.name === current),
  );
  const field = fields[index];

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const back = e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey);
      setCurrent(fields[(index + (back ? -1 : 1) + fields.length) % fields.length].name);
    } else if (['ArrowLeft', 'ArrowRight', 'h', 'l'].includes(e.key) && field.kind !== 'text') {
      e.preventDefault();
      const step = e.key === 'ArrowLeft' || e.key === 'h' ? -1 : 1;
      if (field.kind === 'toggle') field.onChange(!field.value);
      else field.onChange(cycle(field.options, field.value, step));
    } else if (e.key === ' ' && field.kind === 'toggle') {
      e.preventDefault();
      field.onChange(!field.value);
    }
  };

  const setRef = (name: string) => (el: HTMLElement | null) => {
    refs.current[name] = el;
  };

  return (
    <Dialog
      title={title}
      footer={footer}
      onClose={onCancel}
      onKeyDown={onKeyDown}
    >
      {fields.map(f => (
        <div
          key={f.name}
          className={`form-row ${f.name === field.name ? 'is-current' : ''}`}
          onMouseDown={() => setCurrent(f.name)}
        >
          <span className='cursor-mark'>{f.name === field.name ? '›' : ' '}</span>
          <span className='form-label'>{f.label}</span>
          <div className='grow'>
            {f.kind === 'text' ? (
              <div className='text-field'>
                <input
                  ref={setRef(f.name)}
                  className='prompt-input field-input'
                  value={f.value}
                  placeholder={f.placeholder}
                  onChange={e => f.onChange(e.target.value)}
                  spellCheck={false}
                  aria-label={f.label}
                />
                {f.hint !== undefined && <span className='dim'>{f.hint}</span>}
              </div>
            ) : (
              <div
                ref={setRef(f.name)}
                tabIndex={-1}
                className='choice'
              >
                {f.kind === 'toggle' ? (
                  <span
                    className='option is-on'
                    onMouseDown={() => f.onChange(!f.value)}
                  >
                    {f.value ? `[x] ${f.on}` : `[ ] ${f.off}`}
                  </span>
                ) : (
                  f.options.map((o, i) => (
                    <span
                      // Option values can be null or objects; position identifies them.
                      // oxlint-disable-next-line react/no-array-index-key
                      key={i}
                      className={`option ${Object.is(o.value, f.value) ? 'is-on' : ''}`}
                      style={o.color ? {color: o.color} : undefined}
                      onMouseDown={() => f.onChange(o.value)}
                    >
                      {o.label ?? (o.color ? '■' : String(o.value))}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      {note && <p className='dim form-note'>{note}</p>}
      {error && <p className='error form-note'>E: {error}</p>}
    </Dialog>
  );
};

const cycle = <T,>(options: ChoiceOption<T>[], value: T, step: number) => {
  const at = options.findIndex(o => Object.is(o.value, value));
  return options[(at + step + options.length) % options.length].value;
};
