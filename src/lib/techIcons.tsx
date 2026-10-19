import type { IconType } from 'react-icons'
import { FaAws, FaJava, FaMicrosoft } from 'react-icons/fa'
import {
  SiApple,
  SiAtlassian,
  SiCloudflare,
  SiClickhouse,
  SiCloudflareworkers,
  SiCplusplus,
  SiD3,
  SiDocker,
  SiElastic,
  SiFastapi,
  SiFastify,
  SiFlask,
  SiFlower,
  SiGit,
  SiGithubactions,
  SiGnubash,
  SiGooglecloud,
  SiHtml5,
  SiJavascript,
  SiKubernetes,
  SiModelcontextprotocol,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiNumpy,
  SiOllama,
  SiPaloaltonetworks,
  SiPandas,
  SiPostgresql,
  SiPydantic,
  SiPython,
  SiPytorch,
  SiQt,
  SiR,
  SiReact,
  SiScikitlearn,
  SiSupabase,
  SiTailscale,
  SiTerraform,
  SiTypescript,
} from 'react-icons/si'
import {
  TbAlertTriangle,
  TbApi,
  TbBox,
  TbBrandOauth,
  TbCertificate,
  TbChartDots3,
  TbChartLine,
  TbDatabase,
  TbDatabaseSearch,
  TbDeviceDesktopCog,
  TbPassword,
  TbPlugConnected,
  TbShieldCheck,
  TbShieldLock,
  TbShieldSearch,
  TbTopologyStar3,
} from 'react-icons/tb'
import { VscAzure } from 'react-icons/vsc'

interface TechIcon {
  Icon: IconType
  label: string
}

/**
 * Every tech tag on the site resolves to a mark, never to a monogram.
 *   brands      their own logo (Simple Icons first; Font Awesome or VS Code
 *               icons where Simple Icons dropped a trademark: AWS, Azure,
 *               Java, Microsoft)
 *   products    with no mark of their own take their vendor's (Sentinel,
 *               Defender, Entra ID: Microsoft; Cortex XSOAR: Palo Alto)
 *   concepts    (SQL, SOC 2, incident response) take a Tabler glyph for
 *               what they are
 *   anything else falls back to one generic mark (FALLBACK)
 * Keys are the literal tag strings in content/*.ts.
 */
const MAP: Record<string, TechIcon> = {
  AWS: { Icon: FaAws, label: 'AWS' },
  'Atlassian Software': { Icon: SiAtlassian, label: 'Atlassian' },
  Azure: { Icon: VscAzure, label: 'Azure' },
  'Microsoft Azure': { Icon: VscAzure, label: 'Microsoft Azure' },
  Bash: { Icon: SiGnubash, label: 'Bash' },
  'C/C++': { Icon: SiCplusplus, label: 'C/C++' },
  Cloudflare: { Icon: SiCloudflare, label: 'Cloudflare' },
  'Cloudflare Workers': { Icon: SiCloudflareworkers, label: 'Cloudflare Workers' },
  ClickHouse: { Icon: SiClickhouse, label: 'ClickHouse' },
  'Cortex XDR': { Icon: SiPaloaltonetworks, label: 'Cortex XDR' },
  'Cortex XSOAR': { Icon: SiPaloaltonetworks, label: 'Cortex XSOAR' },
  D3: { Icon: SiD3, label: 'D3' },
  'Defender for Endpoint': { Icon: FaMicrosoft, label: 'Defender for Endpoint' },
  'Microsoft Defender for Endpoint': { Icon: FaMicrosoft, label: 'Microsoft Defender for Endpoint' },
  'Distributed Systems': { Icon: TbTopologyStar3, label: 'Distributed Systems' },
  Docker: { Icon: SiDocker, label: 'Docker' },
  Elastic: { Icon: SiElastic, label: 'Elastic' },
  'Endpoint Management': { Icon: TbDeviceDesktopCog, label: 'Endpoint Management' },
  'Entra ID': { Icon: FaMicrosoft, label: 'Entra ID' },
  FastAPI: { Icon: SiFastapi, label: 'FastAPI' },
  Fastify: { Icon: SiFastify, label: 'Fastify' },
  Flask: { Icon: SiFlask, label: 'Flask' },
  Flower: { Icon: SiFlower, label: 'Flower' },
  GCP: { Icon: SiGooglecloud, label: 'Google Cloud' },
  Git: { Icon: SiGit, label: 'Git' },
  'GitHub Actions': { Icon: SiGithubactions, label: 'GitHub Actions' },
  'HTML/CSS': { Icon: SiHtml5, label: 'HTML/CSS' },
  'ISO 27001': { Icon: TbCertificate, label: 'ISO 27001' },
  'Incident Response': { Icon: TbAlertTriangle, label: 'Incident Response' },
  Java: { Icon: FaJava, label: 'Java' },
  JavaScript: { Icon: SiJavascript, label: 'JavaScript' },
  KQL: { Icon: TbDatabaseSearch, label: 'KQL' },
  Kubernetes: { Icon: SiKubernetes, label: 'Kubernetes' },
  MCP: { Icon: SiModelcontextprotocol, label: 'MCP' },
  Matplotlib: { Icon: TbChartLine, label: 'Matplotlib' },
  'Microsoft Sentinel': { Icon: FaMicrosoft, label: 'Microsoft Sentinel' },
  MongoDB: { Icon: SiMongodb, label: 'MongoDB' },
  MySQL: { Icon: SiMysql, label: 'MySQL' },
  'Next.js': { Icon: SiNextdotjs, label: 'Next.js' },
  'Node.js': { Icon: SiNodedotjs, label: 'Node.js' },
  NumPy: { Icon: SiNumpy, label: 'NumPy' },
  'OAuth 2.0': { Icon: TbBrandOauth, label: 'OAuth 2.0' },
  Pandas: { Icon: SiPandas, label: 'Pandas' },
  PostgreSQL: { Icon: SiPostgresql, label: 'PostgreSQL' },
  PyTorch: { Icon: SiPytorch, label: 'PyTorch' },
  Ollama: { Icon: SiOllama, label: 'Ollama' },
  Pydantic: { Icon: SiPydantic, label: 'Pydantic' },
  Python: { Icon: SiPython, label: 'Python' },
  Qt: { Icon: SiQt, label: 'Qt' },
  R: { Icon: SiR, label: 'R' },
  React: { Icon: SiReact, label: 'React' },
  'React.js': { Icon: SiReact, label: 'React' },
  'RESTful APIs': { Icon: TbApi, label: 'RESTful APIs' },
  'Row-Level Security': { Icon: TbShieldLock, label: 'Row-Level Security' },
  'SOC 2': { Icon: TbShieldCheck, label: 'SOC 2' },
  SQL: { Icon: TbDatabase, label: 'SQL' },
  Semgrep: { Icon: TbShieldSearch, label: 'Semgrep' },
  Seaborn: { Icon: TbChartDots3, label: 'Seaborn' },
  Supabase: { Icon: SiSupabase, label: 'Supabase' },
  TOTP: { Icon: TbPassword, label: 'TOTP' },
  Tailscale: { Icon: SiTailscale, label: 'Tailscale' },
  Terraform: { Icon: SiTerraform, label: 'Terraform' },
  TypeScript: { Icon: SiTypescript, label: 'TypeScript' },
  WebSockets: { Icon: TbPlugConnected, label: 'WebSockets' },
  launchd: { Icon: SiApple, label: 'launchd' },
  'scikit-learn': { Icon: SiScikitlearn, label: 'scikit-learn' },
}

/** The one generic mark, for a tag nothing above covers. */
const FALLBACK = TbBox

export function getTechIcon(tag: string): TechIcon {
  return MAP[tag] ?? { Icon: FALLBACK, label: tag }
}
