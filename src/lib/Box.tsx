import type {ReactNode} from 'react';

export interface BoxProps {
  title?: ReactNode;
  footer?: ReactNode;
  /** Active boxes get the green border and title. Default true. */
  active?: boolean;
  className?: string;
  children: ReactNode;
}

/** A bordered panel with its title set into the top edge, like a TUI window. */
export const Box = ({title, footer, active = true, className = '', children}: BoxProps) => (
  <section className={`box ${active ? 'is-active' : ''} ${className}`}>
    {title !== undefined && <header className='box-title'>{title}</header>}
    <div className='box-body'>{children}</div>
    {footer !== undefined && <footer className='box-footer'>{footer}</footer>}
  </section>
);
