/** Content model — the typed shape of everything the site renders. */

export type ProjectCategory = 'thesis' | 'pro bono' | 'websites' | 'solutions'

/** Editorial bento-grid sizing for the projects board. */
export type ProjectSize = 'lg' | 'md' | 'sm'

export interface Project {
  id: number
  title: string
  category: ProjectCategory
  description: string
  image: string
  tags: string[]
  githubUrl: string
  /** Live/demo site. Omit or leave undefined when there is no public demo. */
  demoUrl?: string
  /** Bento-grid span. Falls back to a deterministic size cycle when omitted. */
  size?: ProjectSize
}

export interface ExperienceEntry {
  id: number
  title: string
  organization: string
  time: string
  location: string
  /** May contain \n\n paragraph breaks. */
  description: string
  tags: string[]
}

export type SkillCategory = 'Languages' | 'Frameworks' | 'Tools' | 'Libraries'

export interface Skill {
  name: string
  category: SkillCategory
}

export interface ExpertiseBlock {
  title: string
  body: string
}

export interface AboutContent {
  headlineLines: string[]
  bio: string[]
  expertise: ExpertiseBlock[]
  cta: { label: string; href: string }
}

export interface SiteMeta {
  /** Hero display name, one entry per line. */
  displayName: string[]
  wordmark: string
  tagline: string[]
  footer: { name: string; builtWith: string }
}

export interface HeroContent {
  subtext: string
  title: string
  pillars: string[]
}
