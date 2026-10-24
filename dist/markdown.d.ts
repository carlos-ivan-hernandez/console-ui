export type HeadingColors = Record<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', string>;
/** Theme colors by default; vera uses its users' own colors here. */
export declare const DEFAULT_HEADING_COLORS: HeadingColors;
/**
 * A lightweight markdown view: colored headings (with their `#`s kept, dim),
 * and list dashes in the color of the heading above them. Everything else
 * shows as written, in the monospace grid.
 */
export declare const MarkdownPreview: ({ content, colors, empty, }: {
    content: string;
    colors?: HeadingColors;
    empty?: string;
}) => import("react").JSX.Element;
