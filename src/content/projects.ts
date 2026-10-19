import type { Project, ProjectCategory } from './types'

/** Synced 2026-10-18. Strings use the modal's inline markup (**bold**, *italic*, [label](url)). Display order for category groups. */
export const projectCategoryOrder: ProjectCategory[] = ['research', 'pro bono', 'websites', 'personal']

export const projects: Project[] = [
  {
    "id": 1,
    "title": "Asynchronous Layer-Wise Federated Learning",
    "category": "research",
    "summary": "A federated learning system that cuts what edge clients upload by syncing shallow and deep model layers on different schedules.",
    "points": [
      "Partitions the model by state_dict prefix. The server aggregates shallow layers with weighted FedAvg every round and deep layers every *K*-th round.",
      "Between deep syncs it serves a staleness-tracked cache, so off-rounds upload about 898 KB (0.6% of the model) instead of the full 141.6 MB.",
      "Correctness is pinned by a K=1 run that has to reproduce synchronous FedAvg exactly.",
      "On a 37M-parameter ECG model over 12-lead PTB-XL data, syncing deep layers every second round **halves client upload** (49.7%, 1.78 GB to 0.90 GB) with no measurable accuracy cost against the synchronous baseline (83.2% vs 82.7%, p = 0.31 over 3 seeds).",
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
    "publishedIn": "IEEE GLOBECOM 2026"
  },
  {
    "id": 2,
    "title": "Global Country Development Scoring Engine",
    "category": "pro bono",
    "summary": "An Azure pipeline that turns five incompatible international data feeds into one comparable country-level view.",
    "points": [
      "Runs on 3 Azure services (Blob Storage, Static Web Apps, Container Registry): a containerized Python job fetches, cleans, scores, aggregates, and publishes in one command.",
      "Factory-pattern fetchers absorb a paginated REST API, a ZIP archive, and an unattended crawl behind one interface with exponential backoff.",
      "Pluggable scorers normalize 28 indicators to a 0-100 scale, rolled up through YAML-defined subdomains into seven scoring pillars.",
      "The React frontend reads nothing but a versioned three-file JSON contract. **114,627 of 211,680** missing values are published as explicit nulls, so a gap is never scored as a zero.",
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
    "githubUrl": "https://github.com/PlanCatalyst/TSI-Data-Dashboard"
  },
  {
    "id": 3,
    "title": "westernsalesclub.ca",
    "category": "websites",
    "summary": "A production site for Western's student-run sales club, with a CMS that lets its executives edit every page without a developer in the loop.",
    "points": [
      "Every query runs client-side against a public anon key, so the entire authorization burden sits in Postgres: SQL grants as a hard ceiling, row-level security, and one SECURITY DEFINER check with search_path pinned.",
      "Every admin write requires a **TOTP second factor**. Row-level security checks the session's aal2 claim on all 11 tables and 5 storage buckets, across 15 SQL migrations.",
      "Admin access is invite-only through 14-day links, every non-owner admin expires after ten months with self-renewal blocked, and each change lands in an append-only audit log.",
      "The whole site is editable from /admin, text and photos alike. Each field is capped by a database CHECK sized to the layout it renders in, so a limit cannot be lifted from the browser.",
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
    "githubUrl": "https://github.com/UWO-TSI/wsc-website"
  },
  {
    "id": 4,
    "title": "StackWatch",
    "category": "personal",
    "summary": "A business's threat intelligence agent: an autonomous threat intelligence team, custom-built for one business.",
    "points": [
      "Matches each resolved package version against OSV and NVD advisories with deterministic version ranges, parsing npm lockfiles v1 to v3, with a source link on every finding.",
      "Gates every match behind a **four-rung evidence ladder** (present, reachable, exploitable, confirmed), promoting a finding only when a Semgrep reachability rule or a scoped runtime check on an authorized target supports it.",
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
    "githubUrl": "https://github.com/LlamzonAmazon/StackWatch"
  }
]
