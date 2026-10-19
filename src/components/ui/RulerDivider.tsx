import type { SheetKey } from '@/theme/spectrum'
import { SheetIndex } from './SheetIndex'

type RulerDividerProps = { className?: string } & (
  | {
      /** The sheet this section is: its Roman numeral and name come from SHEETS (theme/spectrum.ts), never typed by hand. */
      sheet: SheetKey
    }
  | {
      /** A plate letter or other marker that is not a sheet (the specimen's section heads). */
      index: string
      label: string
    }
)

/**
 * "IV · Label" section marker + a drafting scale rule, for document-flow
 * sections (the pinned stage letters its own headings). The numeral is the
 * display face and the label the body face, so the two families meet on
 * one line; the label is keyed to the sheet hue. For a sheet, the text is
 * SheetIndex, the same as on the stage.
 */
export function RulerDivider({ className = '', ...mark }: RulerDividerProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-label text-label--key whitespace-nowrap">
        {'sheet' in mark ? (
          <SheetIndex sheet={mark.sheet} />
        ) : (
          <>
            <span className="numeral">{mark.index}</span> · {mark.label}
          </>
        )}
      </span>
      <div className="ruler-divider-line flex-1" />
    </div>
  )
}
