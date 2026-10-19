import type { SkillCategory } from './types'

export interface SkillGroup {
  category: SkillCategory
  items: string[]
}

/** Synced 2026-10-18; every item has project or role evidence. Display order: Languages · Frameworks · Tools · Libraries. */
export const skillGroups: SkillGroup[] = [
  {
    "category": "Languages",
    "items": [
      "Python",
      "TypeScript",
      "JavaScript",
      "Java",
      "C/C++",
      "SQL",
      "Bash",
      "KQL",
      "R",
      "HTML/CSS"
    ]
  },
  {
    "category": "Frameworks",
    "items": [
      "React",
      "Next.js",
      "Node.js",
      "FastAPI",
      "Fastify",
      "Flask",
      "RESTful APIs",
      "PostgreSQL",
      "MySQL",
      "MongoDB"
    ]
  },
  {
    "category": "Tools",
    "items": [
      "Microsoft Azure",
      "AWS",
      "GCP",
      "Cloudflare Workers",
      "Docker",
      "Terraform",
      "GitHub Actions",
      "Git",
      "Supabase",
      "Microsoft Sentinel",
      "Atlassian Software"
    ]
  },
  {
    "category": "Libraries",
    "items": [
      "Pandas",
      "NumPy",
      "PyTorch",
      "Flower",
      "scikit-learn",
      "Pydantic",
      "Matplotlib",
      "Seaborn",
      "Qt"
    ]
  }
]
