import type { ExperienceEntry } from '@/content/types'
import { SheetModal } from '@/components/ui/SheetModal'
import { SheetHeading, SheetRule } from '@/components/ui/SheetSection'
import { RichBlocks } from '@/components/ui/RichText'
import { TechSeal } from '@/components/projects/TechSeal'
import { Colophon } from '@/components/ui/Colophon'
import { arcus } from '@/lib/draft/figures/arcus'

/** Sheet IV's detail plate: the pointed arch, its keystone lettered clavis. */
const ARCUS = arcus()

interface ExperienceDetailModalProps {
  entry: ExperienceEntry
  onClose: () => void
}

/** A role's detail sheet: who, when, where, what was done (set from its markup), and with what. */
export function ExperienceDetailModal({ entry, onClose }: ExperienceDetailModalProps) {
  const titleId = `experience-modal-title-${entry.id}`

  return (
    <SheetModal labelledBy={titleId} sheet="04" onClose={onClose}>
      <header className="pr-20">
        <span className="text-label text-label--key">{entry.organization}</span>
        <h3 id={titleId} className="sheet-title mt-2">
          {entry.title}
        </h3>
        <p className="text-label-sm mt-2">
          {entry.time} · {entry.location}
        </p>
        {entry.earlierRole && (
          <p className="text-label-sm mt-1" style={{ color: 'var(--color-graphite-hb)' }}>
            {entry.earlierRole.title} · {entry.earlierRole.time}
          </p>
        )}
      </header>

      <div className="my-5">
        <SheetRule />
      </div>

      <div className="sheet-flow">
        <RichBlocks>{entry.description}</RichBlocks>

        {entry.tags.length > 0 && (
          <>
            <SheetHeading>Stack</SheetHeading>
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {entry.tags.map((tag) => (
                <TechSeal key={tag} tag={tag} showLabel />
              ))}
            </div>
          </>
        )}

        {entry.links && entry.links.length > 0 && (
          <>
            <SheetHeading>Links</SheetHeading>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {entry.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="sheet-link text-label">
                  {link.label} ↗
                </a>
              ))}
            </div>
          </>
        )}
      </div>

      <Colophon figure={ARCUS} sheet="04" />
    </SheetModal>
  )
}
