import { type ReactNode } from 'react';
export interface ChoiceOption<V> {
    value: V;
    /** Text to show; with `color` and no label, a colored `■` is shown. */
    label?: ReactNode;
    color?: string;
}
/** One line of a form. Values are controlled by you; the dialog only handles focus and keys. */
export type FormField = {
    kind: 'text';
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Shown dim after the input, e.g. `→ fri 31 oct` for a parsed date. Use `.error` for problems. */
    hint?: ReactNode;
} | {
    kind: 'choice';
    name: string;
    label: string;
    options: ChoiceOption<unknown>[];
    value: unknown;
    onChange: (value: unknown) => void;
} | {
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
export declare const choiceField: <V>(field: {
    name: string;
    label: string;
    options: ChoiceOption<V>[];
    value: V;
    onChange: (value: V) => void;
}) => FormField;
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
export declare const FormDialog: ({ title, fields, onSave, onCancel, error, note, focus, footer, }: FormDialogProps) => import("react").JSX.Element;
