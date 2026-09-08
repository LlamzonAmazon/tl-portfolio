import type { IconType } from 'react-icons'
import { SiDocker, SiNumpy, SiPandas, SiPostgresql, SiPython, SiPytorch, SiReact, SiSupabase } from 'react-icons/si'
import { TbBrandAzure } from 'react-icons/tb'

/**
 * Exact-string lookup keyed on the literal tag values in `content/projects.ts`.
 * Tags with no matching brand mark (Power BI, Flower, OAuth 2.0 — none exist
 * in Simple Icons or Tabler Icons, and Azure/AWS are absent from Simple Icons
 * entirely due to Microsoft/Amazon trademark restrictions) intentionally fall
 * through to `TechSeal`'s monogram stamp instead of a broken/generic glyph.
 */
const techIconMap: Record<string, { Icon: IconType; label: string }> = {
  Azure: { Icon: TbBrandAzure, label: 'Azure' },
  Python: { Icon: SiPython, label: 'Python' },
  Pandas: { Icon: SiPandas, label: 'Pandas' },
  NumPy: { Icon: SiNumpy, label: 'NumPy' },
  Docker: { Icon: SiDocker, label: 'Docker' },
  PyTorch: { Icon: SiPytorch, label: 'PyTorch' },
  'React.js': { Icon: SiReact, label: 'React' },
  Supabase: { Icon: SiSupabase, label: 'Supabase' },
  PostgreSQL: { Icon: SiPostgresql, label: 'PostgreSQL' },
}

export function getTechIcon(tag: string): { Icon: IconType; label: string } | null {
  return techIconMap[tag] ?? null
}
