import type { ExperienceEntry } from './types'

/**
 * Reverse chronological. Synced 2026-10-18.
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
    "description": "I build and deploy **Trellum**, an agent platform for restaurants with two pillars: restaurant operations and growth through go-to-market. The operations side is *live in beta*; the go-to-market agent is planned.\n\n### What it does\nEach restaurant gets its own isolated agent, grounded in the business's live sales, orders, menu and labor data. The agent drafts the work and a person approves it. Nothing is sent or written outward on its own.\n\n### What I own\n- A **5-service Docker Compose stack**: a Node backend-for-frontend serving a React client over an authenticated WebSocket, a Cloudflare tunnel, and 2 PostgreSQL databases.\n- The 6 tool handlers of a **read-only Toast POS MCP server**, which ground the agent in live point-of-sale data.\n- Per-user sign-in with a mandatory **TOTP** second factor and an audit row on every action.\n- Cloudflare Access in front of the admin console, age-encrypted backups verified by a round-trip test in CI, and deploys through scoped credentials.",
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
    "description": "I built the [Global Country Development Scoring Engine](https://jolly-pebble-0e2f9300f.7.azurestaticapps.net/#/map), turning **5 live international feeds** into a 7-pillar model that consultants use to compare need across **216 countries**.\n\n- Ingested 35 years of indicator history in unattended runs through paginated APIs, ZIP archives and UN SDG fetches, giving each feed its own fetcher and cleaner with exponential backoff.\n- Joined feeds that mixed UN M49 codes, ISO3 and free-text country names onto one canonical key, so every country resolves to a single row.\n- Orchestrated fetch, clean, score and publish across 3 Azure services behind a versioned 3-file JSON contract that publishes meta.json last, so a failed run *never* overwrites the last good dataset.",
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
    "description": "On-call incident response and detection engineering across client Microsoft 365 and Azure security stacks, promoted from Security Operations Intern to Security Analyst.\n\n- Ran on-call incident response across **7 enterprise client tenants**, resolving **8+ security incidents per day** by correlating Microsoft Entra ID sign-in and audit logs with mailbox activity, endpoint process and system logs, and device network traffic to root cause.\n- Cut the false-positive alert rate **12%** by writing and tuning KQL detection rules in Microsoft Sentinel and Microsoft Defender for Endpoint, and documented the correlation logic in playbooks the team reuses.\n- Reviewed conditional access configurations in Microsoft Entra ID across all 7 tenants.\n- Assessed vendor security posture through third-party risk management reviews.",
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
    "description": "- Built a **Bash endpoint telemetry agent** that collects device logs and centralizes them in Azure, giving the IT team device-posture visibility across **5 clinic environments**.\n- Kept ISO 27001 and SOC 2 control documentation current for a regulated healthcare IT environment.",
    "tags": [
      "Bash",
      "Azure",
      "Endpoint Management",
      "ISO 27001",
      "SOC 2"
    ]
  }
]
