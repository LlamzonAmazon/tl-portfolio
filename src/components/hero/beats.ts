export interface TimeSpan {
  start: number
  end: number
}

/** Split a span into `count` equal contiguous beats — the sub-window unit for beat sequences. */
export function splitBeats(start: number, end: number, count: number): TimeSpan[] {
  if (count <= 0) return []
  const span = (end - start) / count
  return Array.from({ length: count }, (_, i) => ({
    start: start + i * span,
    end: start + (i + 1) * span,
  }))
}
