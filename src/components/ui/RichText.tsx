import type { ReactNode } from 'react'
import { SheetHeading } from './SheetSection'

/* Inline markup for any string a detail sheet renders:
     **bold**   *italic*   [label](https://url)
   Parsed into React nodes (never dangerouslySetInnerHTML). Links must be
   http(s); anything else stays literal text. Plain strings pass through
   untouched. */
const INLINE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|(?<![\w*])\*(?![\s*])([^*]*[^\s*])\*(?!\*)/g

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0
    if (at > last) nodes.push(text.slice(last, at))
    const key = `${keyPrefix}-${at}`
    if (m[2] !== undefined) {
      nodes.push(
        <a key={key} href={m[2]} target="_blank" rel="noopener noreferrer" className="sheet-link">
          {parseInline(m[1], key)}
        </a>,
      )
    } else if (m[3] !== undefined) {
      nodes.push(<strong key={key}>{parseInline(m[3], key)}</strong>)
    } else {
      nodes.push(<em key={key}>{parseInline(m[4], key)}</em>)
    }
    last = at + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

interface RichTextProps {
  children: string
}

/** One string with inline markup, rendered as nodes. */
export function RichText({ children }: RichTextProps) {
  return <>{parseInline(children, 'i')}</>
}

/**
 * One block of a description: a "### " line is a section header (the rest of
 * the block, if any, follows it), a block of "- " lines is a bullet list,
 * anything else is a paragraph.
 */
function renderBlock(block: string, key: string): ReactNode[] {
  if (block.startsWith('### ')) {
    const nl = block.indexOf('\n')
    const heading = (nl === -1 ? block : block.slice(0, nl)).slice(4).trim()
    const rest = nl === -1 ? '' : block.slice(nl + 1).trim()
    return [
      <SheetHeading key={`${key}-h`}>{parseInline(heading, `${key}-h`)}</SheetHeading>,
      ...(rest ? renderBlock(rest, `${key}-r`) : []),
    ]
  }

  const lines = block.split('\n').map((l) => l.trim())
  if (lines.every((l) => l.startsWith('- '))) {
    return [
      <ul key={key} className="sheet-points">
        {lines.map((l, i) => (
          <li key={i}>{parseInline(l.slice(2), `${key}-${i}`)}</li>
        ))}
      </ul>,
    ]
  }
  return [<p key={key}>{parseInline(lines.join(' '), key)}</p>]
}

interface RichBlocksProps {
  /** Blocks separated by a blank line (\n\n). */
  children: string
}

/** A multi-block description: section headers, bullet lists and paragraphs, with inline markup throughout. */
export function RichBlocks({ children }: RichBlocksProps) {
  const blocks = children
    .split('\n\n')
    .map((b) => b.trim())
    .filter(Boolean)
  return <div className="sheet-flow sheet-prose">{blocks.flatMap((b, i) => renderBlock(b, `b${i}`))}</div>
}
