/**
 * Static SVG serializer for a figure, at any point of its drawing.
 *
 * Used for still renders (reduced motion, thumbnails, tests). `progress`
 * 0..1 evaluates the schedule without GSAP: each stroke's visible length
 * follows the pen ease within its slot, so a frame here matches what the
 * live timeline shows at the same moment. Styling comes from the same
 * .ln-* classes, so `css` must be the site's stylesheet (or tokens + texture).
 */

import { n, polar } from './geometry'
import { schedule } from './schedule'
import type { Figure, Stroke } from './sketch'

const penEase = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2) // power2.inOut
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')

export function figureToSvg(fig: Figure, progress = 1, opts: { css?: string; width?: number; bg?: string } = {}): string {
  const sch = schedule(fig)
  const [bx, by, bw, bh] = fig.box
  const k = (opts.width ?? bw) / bw
  const local = (a: number, b: number) => penEase(clamp01((progress - a) / Math.max(1e-6, b - a)))
  const out: string[] = []
  const masks: string[] = []

  const strokeEl = (s: Stroke, f: number) => {
    if (f <= 0) return
    const color = s.color ? ` style="stroke:${s.color}"` : ''
    if (s.dashed) {
      masks.push(`<mask id="m-${s.id}" maskUnits="userSpaceOnUse" x="${bx}" y="${by}" width="${bw}" height="${bh}"><path d="${s.d}" pathLength="1" stroke="#fff" stroke-width="6" fill="none" stroke-dasharray="1" stroke-dashoffset="${n(1 - f)}"/></mask>`)
      out.push(`<path class="ln-${s.layer}" d="${s.d}" stroke-dasharray="${n(2 / k)} ${n(4 / k)}" mask="url(#m-${s.id})"${color}/>`)
    } else {
      out.push(`<path class="ln-${s.layer}" d="${s.d}" pathLength="1" stroke-dashoffset="${n(1 - f)}"${color}/>`)
    }
  }

  for (const t of sch.strokes) {
    const s = t.stroke
    const f = local(t.draw[0], t.draw[1])
    strokeEl(s, f)
    if (s.arm && t.open && t.close && progress > t.open[0] && progress < t.close[1]) {
      const opened = local(t.open[0], t.open[1])
      const closed = local(t.close[0], t.close[1])
      const reach = s.arm.r * opened * (1 - closed)
      const tip = polar(s.arm.c, reach, s.arm.a0 + (s.arm.a1 - s.arm.a0) * f)
      out.push(`<path class="ln-construct" d="M${n(s.arm.c[0])} ${n(s.arm.c[1])} L${n(tip[0])} ${n(tip[1])}"/>`)
    }
    for (const nd of s.nodes) {
      if (f + 1e-6 < nd.f) continue
      const cls = nd.kind === 'key' ? 'ln-node ln-node--key' : nd.kind === 'open' ? 'ln-node ln-node--open' : 'ln-node'
      out.push(`<circle class="${cls}" style="clip-path:none${nd.color ? `;fill:${nd.color}` : ''}" cx="${n(nd.at[0])}" cy="${n(nd.at[1])}" r="${n(nd.r)}"/>`)
    }
  }

  for (const l of sch.labels) {
    const f = clamp01((progress - l.t0) / Math.max(1e-6, l.t1 - l.t0))
    if (f <= 0) continue
    const cls = `ln-label${l.label.kind === 'key' ? ' ln-label--key' : l.label.kind === 'serif' ? ' ln-label--serif' : ''}`
    const rot = l.label.rotate ? ` transform="rotate(${n(l.label.rotate)} ${n(l.label.at[0])} ${n(l.label.at[1])})"` : ''
    const fill = l.label.color ? ` style="fill:${l.label.color}"` : ''
    out.push(`<text class="${cls}" x="${n(l.label.at[0])}" y="${n(l.label.at[1])}" font-size="${l.label.size}" text-anchor="${l.label.anchor}"${rot}${fill}>${esc(l.label.text)}</text>`)
  }

  const css = opts.css ? `<style>${opts.css}</style>` : ''
  const bg = opts.bg ? `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${opts.bg}"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bx} ${by} ${bw} ${bh}" width="${n(bw * k)}" height="${n(bh * k)}" style="--draw-k:${n(k)}" fill="none">${css}<defs>${masks.join('')}</defs>${bg}${out.join('')}</svg>`
}
