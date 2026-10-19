import { SHEETS, type SheetKey } from '@/theme/spectrum'

/** "III · Projects": the sheet's Roman numeral (display face) and its name (label face). */
export function SheetIndex({ sheet }: { sheet: SheetKey }) {
  const s = SHEETS[sheet]
  return (
    <>
      <span className="numeral">{s.numeral}</span> · {s.title}
    </>
  )
}
