export type HeadingColors = Record<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', string>;

/** Theme colors by default; vera uses its users' own colors here. */
export const DEFAULT_HEADING_COLORS: HeadingColors = {
  h1: 'var(--blue)',
  h2: 'var(--blue)',
  h3: 'var(--purple)',
  h4: 'var(--purple)',
  h5: 'var(--fg)',
  h6: 'var(--fg)',
};

const HEADING = /^(#{1,6})\s+(.*)/;
const DASH = /^(\s*)(-)(.*)$/;

interface Line {
  text: string;
  heading: {hashes: string; text: string} | null;
  /** Color for a list dash: the color of the nearest heading above. */
  color: string;
}

const parse = (content: string, colors: HeadingColors): Line[] => {
  const levels = [colors.h1, colors.h2, colors.h3, colors.h4, colors.h5, colors.h6];
  let color = colors.h1;
  return content.split('\n').map(text => {
    const match = HEADING.exec(text);
    if (match) color = levels[match[1].length - 1] ?? colors.h1;
    return {text, heading: match ? {hashes: match[1], text: match[2]} : null, color};
  });
};

/**
 * A lightweight markdown view: colored headings (with their `#`s kept, dim),
 * and list dashes in the color of the heading above them. Everything else
 * shows as written, in the monospace grid.
 */
export const MarkdownPreview = ({
  content,
  colors = DEFAULT_HEADING_COLORS,
  empty = '(empty)',
}: {
  content: string;
  colors?: HeadingColors;
  empty?: string;
}) => {
  if (!content.trim()) return <p className='dim'>{empty}</p>;
  return (
    <div className='md'>
      {parse(content, colors).map((line, i) => {
        if (line.heading) {
          return (
            <p
              // Lines have no identity beyond their position.
              // oxlint-disable-next-line react/no-array-index-key
              key={i}
              className={`md-h md-h${line.heading.hashes.length}`}
              style={{color: line.color}}
            >
              <span className='dim'>{line.heading.hashes} </span>
              {line.heading.text}
            </p>
          );
        }
        const dash = DASH.exec(line.text);
        return (
          <p
            // oxlint-disable-next-line react/no-array-index-key
            key={i}
            className='md-line'
          >
            {dash ? (
              <>
                {dash[1]}
                <span style={{color: line.color}}>{dash[2]}</span>
                {dash[3]}
              </>
            ) : (
              line.text || ' '
            )}
          </p>
        );
      })}
    </div>
  );
};
