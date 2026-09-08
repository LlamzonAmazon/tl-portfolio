import type { SkillCategory } from './types'

export interface SkillGroup {
  category: SkillCategory
  items: string[]
}

/** Grouped in display order: Languages · Frameworks · Tools · Libraries. */
export const skillGroups: SkillGroup[] = [
  {
    category: 'Languages',
    items: ['Java', 'Python', 'C/C++', 'SQL', 'NoSQL', 'JavaScript', 'HTML/CSS', 'Bash', 'R', 'KQL'],
  },
  {
    category: 'Frameworks',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'TerraForm', 'Flask', 'FastAPI', 'React', 'Node.js', 'RESTful APIs'],
  },
  {
    category: 'Tools',
    items: ['AWS', 'GCP', 'Microsoft Azure', 'Docker', 'Git', 'Kubernetes', 'Atlassian Software', 'Supabase'],
  },
  {
    category: 'Libraries',
    items: ['Pandas', 'NumPy', 'PyTorch', 'scikit-learn', 'Pydantic', 'Matplotlib', 'Seaborn', 'Qt'],
  },
]
