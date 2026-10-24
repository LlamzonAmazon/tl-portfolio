import type { Project, ProjectCategory } from './types'

/** Synced 2026-10-23. Strings use the modal's inline markup (**bold**, *italic*, [label](url)). Display order for category groups. */
export const projectCategoryOrder: ProjectCategory[] = ['product', 'research', 'pro bono', 'websites', 'personal']

export const projects: Project[] = [
  {
    "id": 5,
    "title": "Trellum",
    "category": "product",
    "summary": "An AI agent for each business that runs inference over its live sales, stock and supplier data and returns actionable answers.",
    "points": [
      "The agent pulls live figures, infers what the POS does not report (such as daily ingredient usage), and ends every answer with an actionable next step it proposes proactively.",
      "The agent reads live sales, orders, menu and labor data through a **read-only Toast POS MCP server** with 6 tools. The two Toast scopes that return customer names, contact details and delivery addresses are never requested.",
      "A tool policy denies the agent write, edit, messaging and runtime tools. Its one write tool records a proposed change, and the change takes effect only after a person accepts it.",
      "Each person signs in with a password and a mandatory **TOTP** code that cannot be reused, and every change writes an audit row naming that person. Cloudflare Access protects the admin console, and CI restores the age-encrypted backups in a drill.",
      "The operations agent is **live in beta** with its first business. A second agent, for bringing in customers, is in development."
    ],
    "tags": [
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "Docker",
      "MCP",
      "Cloudflare"
    ],
    "demoUrl": "https://trellum.ca",
    "size": "lg"
  },
  {
    "id": 1,
    "title": "Asynchronous Layer-Wise Federated Learning",
    "category": "research",
    "summary": "A federated learning system that reduces how much data edge clients upload by syncing shallow and deep model layers on different schedules.",
    "points": [
      "Partitions the model by state_dict prefix. The server aggregates shallow layers with weighted FedAvg every round and deep layers every *K*-th round.",
      "Between deep syncs it serves a staleness-tracked cache, so off-rounds upload about 898 KB (0.6% of the model) instead of the full 141.6 MB.",
      "Correctness is verified by a K=1 run, which must reproduce synchronous FedAvg exactly.",
      "On a 37M-parameter ECG model over 12-lead PTB-XL data, syncing deep layers every second round **halves client upload** (49.7%, 1.78 GB to 0.90 GB) with no measurable loss in accuracy against the synchronous baseline (83.2% vs 82.7%, p = 0.31 over 3 seeds).",
      "Published as a first-author paper at **IEEE GLOBECOM 2026**: *Asynchronous Layer-Wise Weight Updating for Communication-Efficient Federated Learning in IoT Health Devices*."
    ],
    "image": "/preview-async.png",
    "tags": [
      "Python",
      "PyTorch",
      "Flower",
      "NumPy",
      "Distributed Systems"
    ],
    "githubUrl": "https://github.com/LlamzonAmazon/asynchronous-fl",
    "publishedIn": "IEEE GLOBECOM 2026",
    "size": "md"
  },
  {
    "id": 2,
    "title": "Global Country Development Scoring Engine",
    "category": "pro bono",
    "summary": "An Azure pipeline that turns five incompatible international data feeds into one comparable country-level view.",
    "points": [
      "Runs on 3 Azure services (Blob Storage, Static Web Apps, Container Registry): a containerized Python job fetches, cleans, scores, aggregates, and publishes in one command.",
      "Factory-pattern fetchers handle a paginated REST API, a ZIP archive, and an unattended crawl through one interface with exponential backoff.",
      "Pluggable scorers normalize 28 indicators to a 0-100 scale, aggregated through YAML-defined subdomains into seven scoring categories.",
      "The React frontend reads only a versioned three-file JSON contract. **114,627 of 211,680** missing values are published as explicit nulls, so a missing value is never scored as zero.",
      "An atomic publish that writes meta.json last means a failed run *cannot* overwrite the last known-good snapshot. 216 countries, 28 indicators, 35 years."
    ],
    "tags": [
      "Azure",
      "Python",
      "Pandas",
      "Docker",
      "React",
      "TypeScript",
      "D3"
    ],
    "demoUrl": "https://jolly-pebble-0e2f9300f.7.azurestaticapps.net/#/map",
    "githubUrl": "https://github.com/PlanCatalyst/TSI-Data-Dashboard",
    "size": "md"
  },
  {
    "id": 3,
    "title": "westernsalesclub.ca",
    "category": "websites",
    "summary": "A production site for Western's student-run sales club, with a CMS that lets its executives edit every page without a developer.",
    "points": [
      "Every query runs client-side against a public anon key, so Postgres enforces all authorization: SQL grants that set the maximum access, row-level security, and one SECURITY DEFINER check with a fixed search_path.",
      "Every admin write requires a **TOTP second factor**. Row-level security checks the session's aal2 claim on all 11 tables and 5 storage buckets, across 15 SQL migrations.",
      "Admin access is invite-only through 14-day links, every non-owner admin expires after ten months with self-renewal blocked, and each change is written to an append-only audit log.",
      "The whole site is editable from /admin, text and photos alike. Each field is capped by a database CHECK sized to the layout it renders in, so the browser cannot raise a limit.",
      "Image deletes remove the stored file first and retry the database delete up to 3 times, so a partial failure leaves a retryable row instead of an untracked orphaned file."
    ],
    "tags": [
      "Next.js",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "OAuth 2.0",
      "TOTP",
      "Row-Level Security"
    ],
    "demoUrl": "https://westernsalesclub.ca",
    "githubUrl": "https://github.com/UWO-TSI/wsc-website",
    "size": "md"
  },
  {
    "id": 4,
    "title": "StackWatch",
    "category": "personal",
    "summary": "A threat intelligence agent that matches one business's dependencies against public vulnerability advisories and checks which findings affect it.",
    "points": [
      "Matches each resolved package version against OSV and NVD advisories with deterministic version ranges, parsing npm lockfiles v1 to v3, with a source link on every finding.",
      "Assigns every match one of **four evidence levels** (present, reachable, exploitable, confirmed), and raises a finding to a higher level only when a Semgrep reachability rule or a scoped runtime check on an authorized target supports it.",
      "Raises severity for advisories listed in CISA KEV or scoring EPSS 0.5 or higher, joining both feeds to OSV on CVE aliases and applying the raise only to packages the business actually loads.",
      "Its research agent runs on a local model and must back every extracted fact with a *verbatim quote* from a fetched page, or the fact is rejected.",
      "API-key authentication on every route by default, failing closed when no key is configured, with per-IP rate limits on routes that trigger outbound fetches and outbound requests restricted to public addresses. 1,294 tests run in CI."
    ],
    "tags": [
      "Python",
      "FastAPI",
      "Pydantic",
      "ClickHouse",
      "Docker",
      "Semgrep",
      "Ollama",
      "GitHub Actions"
    ],
    "githubUrl": "https://github.com/LlamzonAmazon/StackWatch",
    "size": "md"
  }
]
