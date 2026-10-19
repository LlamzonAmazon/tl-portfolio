/** Content model: the typed shape of everything the site renders. */

export type ProjectCategory = 'research' | 'pro bono' | 'websites' | 'personal' | 'solutions'

/** Editorial bento-grid sizing for the projects board. */
export type ProjectSize = 'lg' | 'md' | 'sm'

export interface Project {
  id: number
  title: string
  category: ProjectCategory
  /** One-sentence summary shown on the card's sheet and atop the modal. */
  summary: string
  /** Technical points, one per bullet in the modal. */
  points: string[]
  /** Preview image. Omitted when there is none; the modal shows a hatched plate instead. */
  image?: string
  tags: string[]
  /** Omitted for private projects. */
  githubUrl?: string
  /** Live/demo site. Omit or leave undefined when there is no public demo. */
  demoUrl?: string
  /** Venue of a peer-reviewed publication. Shows the PUBLISHED seal in place of LIVE. */
  publishedIn?: string
  /** Link to the publication itself. Shown in the modal's links when present. */
  publishedUrl?: string
  /** Bento-grid span. Falls back to a deterministic size cycle when omitted. */
  size?: ProjectSize
}

export interface ExperienceEntry {
  id: number
  title: string
  organization: string
  time: string
  location: string
  /** The role held before a promotion at the same organization, shown stacked under the title. */
  earlierRole?: { title: string; time: string }
  /** Optional public links for the role (e.g. a client site). `live: false` marks a link that is not a live product (it earns no LIVE seal). */
  links?: { label: string; href: string; live?: boolean }[]
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
  links: { github: string; linkedin: string }
  tagline: string[]
  footer: { name: string; builtWith: string }
}

export interface HeroContent {
  title: string
  pillars: string[]
}
