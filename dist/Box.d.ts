import type { ReactNode } from 'react';
export interface BoxProps {
    title?: ReactNode;
    footer?: ReactNode;
    /** Active boxes get the green border and title. Default true. */
    active?: boolean;
    className?: string;
    children: ReactNode;
}
/** A bordered panel with its title set into the top edge, like a TUI window. */
export declare const Box: ({ title, footer, active, className, children }: BoxProps) => import("react").JSX.Element;
