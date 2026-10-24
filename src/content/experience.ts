import type { ExperienceEntry } from './types'

/**
 * Reverse chronological. Synced 2026-10-23.
 * Descriptions use the modal's inline markup: **bold**, *italic*, [label](url),
 * "- " bullet blocks and "### " section headers, blocks split on blank lines.
 */
export const experiences: ExperienceEntry[] = [
  {
    "id": 1,
    "title": "Forward Deployed Engineer",
    "organization": "Trellum",
    "time": "Aug 2026 - Present",
    "location": "Vancouver, BC",
    "links": [
      {
        "label": "TRELLUM.CA",
        "href": "https://trellum.ca"
      }
    ],
    "description": "I'm building **Trellum**, an AI agent for each business that runs inference over its live sales, stock and supplier data and returns actionable answers. The operations agent is *live in beta* with its first business, and a second agent, for bringing in customers, is in development.\n\n### What I do\n- Define the agent's analysis method: live figures dated on the POS business day, and an actionable next step in every answer.\n- Build and deploy the platform, a **5-service Docker Compose stack**, through a CI pipeline that must pass before an image is deployed.\n- Set up the first business on its own instance and connect its point-of-sale data through the 6 tool handlers I wrote for a **read-only Toast POS MCP server**.\n- Run security and infrastructure: per-user sign-in with a mandatory **TOTP** second factor, an audit row on every action, Cloudflare Access in front of the admin console, and age-encrypted backups restored by a drill in CI.\n- Restrict the agent with a least-privilege tool policy that denies write, edit, messaging and runtime tools. Its one write tool records a proposed change, which takes effect only after a person accepts it.",
    "tags": [
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "Docker",
      "MCP",
      "Cloudflare",
      "GitHub Actions"
    ]
  },
  {
    "id": 2,
    "title": "Software Engineer",
    "organization": "PlanCatalyst (Plan International Canada)",
    "time": "Sep 2025 - Apr 2026",
    "location": "Remote",
    "links": [
      {
        "label": "SCORING ENGINE",
        "href": "https://jolly-pebble-0e2f9300f.7.azurestaticapps.net/#/map"
      }
    ],
    "description": "I built the [Global Country Development Scoring Engine](https://jolly-pebble-0e2f9300f.7.azurestaticapps.net/#/map), combining **5 live international feeds** into a scoring model with 7 categories that consultants use to compare need across **216 countries**.\n\n- Ingested 35 years of indicator history in unattended runs through paginated APIs, ZIP archives and UN SDG fetches, giving each feed its own fetcher and cleaner with exponential backoff.\n- Joined feeds that mixed UN M49 codes, ISO3 and free-text country names onto one canonical key, so every country resolves to a single row.\n- Orchestrated fetch, clean, score and publish across 3 Azure services. The output is a versioned 3-file JSON contract with meta.json written last, so a failed run *never* overwrites the last good dataset.",
    "tags": [
      "Azure",
      "Python",
      "Pandas",
      "Docker",
      "React",
      "TypeScript",
      "D3"
    ]
  },
  {
    "id": 3,
    "title": "Security Analyst",
    "organization": "CYBERWELL Solutions",
    "time": "Sep 2025 - Apr 2026",
    "earlierRole": {
      "title": "Security Operations Intern",
      "time": "Apr 2025 - Sep 2025"
    },
    "location": "Remote",
    "description": "On-call incident response and detection engineering across client Microsoft 365 and Azure security stacks, promoted from Security Operations Intern to Security Analyst.\n\n- Ran on-call incident response across **7 enterprise client tenants**, resolving **8+ security incidents per day** by correlating Microsoft Entra ID sign-in and audit logs with mailbox activity, endpoint process and system logs, and device network traffic to root cause.\n- Reduced the false-positive alert rate **12%** by writing and tuning KQL detection rules in Microsoft Sentinel and Microsoft Defender for Endpoint, and documented the correlation logic in playbooks the team reuses.\n- Reviewed conditional access configurations in Microsoft Entra ID across all 7 tenants.\n- Assessed vendor security posture through third-party risk management reviews.",
    "tags": [
      "Microsoft Sentinel",
      "Microsoft Defender for Endpoint",
      "Entra ID",
      "KQL",
      "Cortex XSOAR",
      "Cortex XDR",
      "Elastic",
      "Incident Response"
    ]
  },
  {
    "id": 4,
    "title": "IT Intern",
    "organization": "WELL Health Technologies (TSX: WELL)",
    "time": "May 2023 - Sep 2023",
    "location": "Vancouver, BC",
    "description": "- Built a **Bash endpoint telemetry agent** that collects device logs and centralizes them in Azure, so the IT team can see device posture across **5 clinics**.\n- Kept ISO 27001 and SOC 2 control documentation current for a regulated healthcare IT environment.",
    "tags": [
      "Bash",
      "Azure",
      "Endpoint Management",
      "ISO 27001",
      "SOC 2"
    ]
  }
]
