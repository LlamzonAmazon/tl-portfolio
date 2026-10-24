# Thomas Llamzon: Portfolio Content

> Human-readable mirror of the site copy. The app renders from the typed modules in
> `src/content/*.ts`; keep this file in sync when copy changes. Nothing here is loaded at build time.
> Inline markup (**bold**, *italic*, [label](url)) renders in the detail modals.

---

## Site

- **Wordmark:** Thomas Llamzon
- **Hero display name:** THOMAS / LLAMZON
- **Hero title:** SECURITY-FIRST SOFTWARE ENGINEER, BUILDING SCALABLE SYSTEMS
- **Pillars:** Security · Agents · Full-Stack
- **Tagline:** Software Engineering · Cybersecurity · Cloud Computing
- GitHub: https://github.com/LlamzonAmazon
- LinkedIn: https://linkedin.com/in/thomasllamzon
- **Footer:** © {year} Thomas Llamzon · Built with React & Vite

---

## Projects

Category order: product · research · pro bono · websites · personal.

### Trellum (product)
An AI agent for each business that runs inference over its live sales, stock and supplier data and returns actionable answers.

- The agent pulls live figures, infers what the POS does not report (such as daily ingredient usage), and ends every answer with an actionable next step it proposes proactively.
- The agent reads live sales, orders, menu and labor data through a **read-only Toast POS MCP server** with 6 tools. The two Toast scopes that return customer names, contact details and delivery addresses are never requested.
- A tool policy denies the agent write, edit, messaging and runtime tools. Its one write tool records a proposed change, and the change takes effect only after a person accepts it.
- Each person signs in with a password and a mandatory **TOTP** code that cannot be reused, and every change writes an audit row naming that person. Cloudflare Access protects the admin console, and CI restores the age-encrypted backups in a drill.
- The operations agent is **live in beta** with its first business. A second agent, for bringing in customers, is in development.

- Tags: TypeScript, React, Node.js, PostgreSQL, Docker, MCP, Cloudflare
- Live: https://trellum.ca

### Asynchronous Layer-Wise Federated Learning (research)

A federated learning system that reduces how much data edge clients upload by syncing shallow and deep model layers on different schedules.

- Partitions the model by state_dict prefix. The server aggregates shallow layers with weighted FedAvg every round and deep layers every *K*-th round.
- Between deep syncs it serves a staleness-tracked cache, so off-rounds upload about 898 KB (0.6% of the model) instead of the full 141.6 MB.
- Correctness is verified by a K=1 run, which must reproduce synchronous FedAvg exactly.
- On a 37M-parameter ECG model over 12-lead PTB-XL data, syncing deep layers every second round **halves client upload** (49.7%, 1.78 GB to 0.90 GB) with no measurable loss in accuracy against the synchronous baseline (83.2% vs 82.7%, p = 0.31 over 3 seeds).
- Published as a first-author paper at **IEEE GLOBECOM 2026**: *Asynchronous Layer-Wise Weight Updating for Communication-Efficient Federated Learning in IoT Health Devices*.

- Tags: Python, PyTorch, Flower, NumPy, Distributed Systems
- GitHub: https://github.com/LlamzonAmazon/asynchronous-fl
- Published: IEEE GLOBECOM 2026
- Image: `/preview-async.png`

### Global Country Development Scoring Engine (pro bono)

An Azure pipeline that turns five incompatible international data feeds into one comparable country-level view.

- Runs on 3 Azure services (Blob Storage, Static Web Apps, Container Registry): a containerized Python job fetches, cleans, scores, aggregates, and publishes in one command.
- Factory-pattern fetchers handle a paginated REST API, a ZIP archive, and an unattended crawl through one interface with exponential backoff.
- Pluggable scorers normalize 28 indicators to a 0-100 scale, aggregated through YAML-defined subdomains into seven scoring categories.
- The React frontend reads only a versioned three-file JSON contract. **114,627 of 211,680** missing values are published as explicit nulls, so a missing value is never scored as zero.
- An atomic publish that writes meta.json last means a failed run *cannot* overwrite the last known-good snapshot. 216 countries, 28 indicators, 35 years.

- Tags: Azure, Python, Pandas, Docker, React, TypeScript, D3
- Live: https://jolly-pebble-0e2f9300f.7.azurestaticapps.net/#/map
- GitHub: https://github.com/PlanCatalyst/TSI-Data-Dashboard

### westernsalesclub.ca (websites)

A production site for Western's student-run sales club, with a CMS that lets its executives edit every page without a developer.

- Every query runs client-side against a public anon key, so Postgres enforces all authorization: SQL grants that set the maximum access, row-level security, and one SECURITY DEFINER check with a fixed search_path.
- Every admin write requires a **TOTP second factor**. Row-level security checks the session's aal2 claim on all 11 tables and 5 storage buckets, across 15 SQL migrations.
- Admin access is invite-only through 14-day links, every non-owner admin expires after ten months with self-renewal blocked, and each change is written to an append-only audit log.
- The whole site is editable from /admin, text and photos alike. Each field is capped by a database CHECK sized to the layout it renders in, so the browser cannot raise a limit.
- Image deletes remove the stored file first and retry the database delete up to 3 times, so a partial failure leaves a retryable row instead of an untracked orphaned file.

- Tags: Next.js, TypeScript, Supabase, PostgreSQL, OAuth 2.0, TOTP, Row-Level Security
- Live: https://westernsalesclub.ca
- GitHub: https://github.com/UWO-TSI/wsc-website

### StackWatch (personal)

A threat intelligence agent that matches one business's dependencies against public vulnerability advisories and checks which findings affect it.

- Matches each resolved package version against OSV and NVD advisories with deterministic version ranges, parsing npm lockfiles v1 to v3, with a source link on every finding.
- Assigns every match one of **four evidence levels** (present, reachable, exploitable, confirmed), and raises a finding to a higher level only when a Semgrep reachability rule or a scoped runtime check on an authorized target supports it.
- Raises severity for advisories listed in CISA KEV or scoring EPSS 0.5 or higher, joining both feeds to OSV on CVE aliases and applying the raise only to packages the business actually loads.
- Its research agent runs on a local model and must back every extracted fact with a *verbatim quote* from a fetched page, or the fact is rejected.
- API-key authentication on every route by default, failing closed when no key is configured, with per-IP rate limits on routes that trigger outbound fetches and outbound requests restricted to public addresses. 1,294 tests run in CI.

- Tags: Python, FastAPI, Pydantic, ClickHouse, Docker, Semgrep, Ollama, GitHub Actions
- GitHub: https://github.com/LlamzonAmazon/StackWatch

---

## Experience

### Forward Deployed Engineer, Trellum
_Aug 2026 - Present · Vancouver, BC_

I'm building **Trellum**, an AI agent for each business that runs inference over its live sales, stock and supplier data and returns actionable answers. The operations agent is *live in beta* with its first business, and a second agent, for bringing in customers, is in development.

#### What I do
- Define the agent's analysis method: live figures dated on the POS business day, and an actionable next step in every answer.
- Build and deploy the platform, a **5-service Docker Compose stack**, through a CI pipeline that must pass before an image is deployed.
- Set up the first business on its own instance and connect its point-of-sale data through the 6 tool handlers I wrote for a **read-only Toast POS MCP server**.
- Run security and infrastructure: per-user sign-in with a mandatory **TOTP** second factor, an audit row on every action, Cloudflare Access in front of the admin console, and age-encrypted backups restored by a drill in CI.
- Restrict the agent with a least-privilege tool policy that denies write, edit, messaging and runtime tools. Its one write tool records a proposed change, which takes effect only after a person accepts it.

- Tags: TypeScript, React, Node.js, PostgreSQL, Docker, MCP, Cloudflare, GitHub Actions
- Link: TRELLUM.CA https://trellum.ca

### Software Engineer, PlanCatalyst (Plan International Canada)
_Sep 2025 - Apr 2026 · Remote_

I built the [Global Country Development Scoring Engine](https://jolly-pebble-0e2f9300f.7.azurestaticapps.net/#/map), combining **5 live international feeds** into a scoring model with 7 categories that consultants use to compare need across **216 countries**.

- Ingested 35 years of indicator history in unattended runs through paginated APIs, ZIP archives and UN SDG fetches, giving each feed its own fetcher and cleaner with exponential backoff.
- Joined feeds that mixed UN M49 codes, ISO3 and free-text country names onto one canonical key, so every country resolves to a single row.
- Orchestrated fetch, clean, score and publish across 3 Azure services. The output is a versioned 3-file JSON contract with meta.json written last, so a failed run *never* overwrites the last good dataset.

- Tags: Azure, Python, Pandas, Docker, React, TypeScript, D3
- Link: SCORING ENGINE https://jolly-pebble-0e2f9300f.7.azurestaticapps.net/#/map

### Security Analyst, CYBERWELL Solutions
_Sep 2025 - Apr 2026 · Remote_
_Promoted from Security Operations Intern, Apr 2025 - Sep 2025_

On-call incident response and detection engineering across client Microsoft 365 and Azure security stacks, promoted from Security Operations Intern to Security Analyst.

- Ran on-call incident response across **7 enterprise client tenants**, resolving **8+ security incidents per day** by correlating Microsoft Entra ID sign-in and audit logs with mailbox activity, endpoint process and system logs, and device network traffic to root cause.
- Reduced the false-positive alert rate **12%** by writing and tuning KQL detection rules in Microsoft Sentinel and Microsoft Defender for Endpoint, and documented the correlation logic in playbooks the team reuses.
- Reviewed conditional access configurations in Microsoft Entra ID across all 7 tenants.
- Assessed vendor security posture through third-party risk management reviews.

- Tags: Microsoft Sentinel, Microsoft Defender for Endpoint, Entra ID, KQL, Cortex XSOAR, Cortex XDR, Elastic, Incident Response

### IT Intern, WELL Health Technologies (TSX: WELL)
_May 2023 - Sep 2023 · Vancouver, BC_

- Built a **Bash endpoint telemetry agent** that collects device logs and centralizes them in Azure, so the IT team can see device posture across **5 clinics**.
- Kept ISO 27001 and SOC 2 control documentation current for a regulated healthcare IT environment.

- Tags: Bash, Azure, Endpoint Management, ISO 27001, SOC 2

---

## Skills

- **Languages:** Python, TypeScript, JavaScript, Java, C/C++, SQL, Bash, KQL, R, HTML/CSS
- **Frameworks:** React, Next.js, Node.js, FastAPI, Fastify, Flask, RESTful APIs, PostgreSQL, MySQL, MongoDB
- **Tools:** Microsoft Azure, AWS, GCP, Cloudflare Workers, Docker, Terraform, GitHub Actions, Git, Supabase, Microsoft Sentinel, Atlassian Software
- **Libraries:** Pandas, NumPy, PyTorch, Flower, scikit-learn, Pydantic, Matplotlib, Seaborn, Qt

---

## Contact

- GitHub: https://github.com/LlamzonAmazon
- LinkedIn: https://linkedin.com/in/thomasllamzon

