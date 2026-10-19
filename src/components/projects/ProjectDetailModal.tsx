import type { Project } from '@/content/types'
import { SheetModal } from '@/components/ui/SheetModal'
import { SheetHeading, SheetRule } from '@/components/ui/SheetSection'
import { RichText } from '@/components/ui/RichText'
import { TechSeal } from './TechSeal'

interface ProjectDetailModalProps {
  project: Project
  onClose: () => void
}

/** A project's detail sheet: preview (when there is one), lede, highlights, stack, links. */
export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const titleId = `project-modal-title-${project.id}`
  const hasLinks = project.githubUrl || project.demoUrl || project.publishedUrl

  return (
    <SheetModal labelledBy={titleId} sheet="03" onClose={onClose}>
      {project.image && (
        <div className="mb-6 overflow-hidden">
          <img src={project.image} alt="" className="h-48 w-full object-cover sm:h-64" />
        </div>
      )}

      <header className="pr-20">
        <span className="text-label text-label--key">{project.category}</span>
        <h3 id={titleId} className="sheet-title mt-2">
          {project.title}
        </h3>
        {project.publishedIn && <p className="text-label-sm mt-2">Published, {project.publishedIn}</p>}
      </header>

      <div className="my-5">
        <SheetRule />
      </div>

      <div className="sheet-flow">
        <p className="sheet-lede">
          <RichText>{project.summary}</RichText>
        </p>

        {project.points.length > 0 && (
          <>
            <SheetHeading>Highlights</SheetHeading>
            <ul className="sheet-points sheet-prose">
              {project.points.map((point) => (
                <li key={point}>
                  <RichText>{point}</RichText>
                </li>
              ))}
            </ul>
          </>
        )}

        {project.tags.length > 0 && (
          <>
            <SheetHeading>Stack</SheetHeading>
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {project.tags.map((tag) => (
                <TechSeal key={tag} tag={tag} showLabel />
              ))}
            </div>
          </>
        )}

        {hasLinks && (
          <>
            <SheetHeading>Links</SheetHeading>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="sheet-link text-label">
                  GitHub ↗
                </a>
              )}
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="sheet-link text-label">
                  Live ↗
                </a>
              )}
              {project.publishedUrl && (
                <a href={project.publishedUrl} target="_blank" rel="noopener noreferrer" className="sheet-link text-label">
                  Publication ↗
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </SheetModal>
  )
}
