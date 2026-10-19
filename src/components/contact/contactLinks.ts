import { site } from '@/content/site'

/** The closing sheet's outbound links, shared by the stage and the fallback. */
export const CONTACT_LINKS = [
  { key: 'github', label: 'GitHub', href: site.links.github },
  { key: 'linkedin', label: 'LinkedIn', href: site.links.linkedin },
] as const
