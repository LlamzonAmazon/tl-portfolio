/**
 * The stage's ruled paper, drawn by the board camera at any zoom.
 *
 * The static texture (public/texture-grid.svg) is one 140px tile with a rule
 * every 28px: scale it and the rules just spread apart until the paper is
 * blank. Here the paper is ruled at EVERY power of 5 instead. A rule's class
 * is the spacing of its family on screen; its weight is a function of that
 * spacing only. So as the camera zooms in, each family spreads apart and
 * darkens while the next finer family resolves out of the paper between them,
 * the way finer print resolves under a loupe: detail is tied to magnification,
 * never to time. Rules are placed in paper space, so each one keeps its
 * identity (and its hand-drafted irregularity) through the whole zoom.
 */

/** Finest rule spacing at the hero's 1:1, in px (the texture's 28px minor). */
const MINOR = 28
const RATIO = 5
/** On-screen spacing at which a family is invisible / at full weight. */
const S_FAINT = 7
const S_FULL = 140
/** Full rule weight, as alpha of the grid ink. */
const ALPHA = 0.16
/** Fallback grid ink if the token is missing: graphite HB. */
const GRAPHITE = '94, 94, 94'

/** Stable per-rule irregularity in [0, 1), from its paper-space identity. */
const jitter = (n: number, j: number) => {
  const v = Math.sin(n * 12.9898 + j * 78.233) * 43758.5453
  return v - Math.floor(v)
}

export function createPaperGrid(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  // The grid's ink comes from the token layer (--graphite-rgb), read once:
  // a canvas cannot resolve CSS variables per stroke.
  const ink = getComputedStyle(canvas).getPropertyValue('--graphite-rgb').trim() || GRAPHITE

  /**
   * @param k   zoom relative to the hero sheet (1 = the texture's 1:1)
   * @param ox  origin x on screen, px (rules always run through it)
   * @param oy  origin y on screen, px
   */
  const draw = (k: number, ox: number, oy: number) => {
    if (!ctx) return
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    const dpr = window.devicePixelRatio || 1
    const bw = Math.round(W * dpr)
    const bh = Math.round(H * dpr)
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw
      canvas.height = bh
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, bw, bh)

    const weight = (s: number) => Math.min(1, Math.max(0, Math.log(s / S_FAINT) / Math.log(S_FULL / S_FAINT)))
    // Device-pixel aligned hairline at screen position `p` along one axis.
    const rule = (vertical: boolean, p: number, a: number, w: number) => {
      ctx.strokeStyle = `rgba(${ink}, ${a})`
      ctx.lineWidth = w * dpr
      const d = Math.round(p * dpr) + 0.5
      ctx.beginPath()
      if (vertical) {
        ctx.moveTo(d, 0)
        ctx.lineTo(d, bh)
      } else {
        ctx.moveTo(0, d)
        ctx.lineTo(bw, d)
      }
      ctx.stroke()
    }

    // Family j rules every MINOR * RATIO^j paper px; a rule on a multiple of
    // RATIO belongs to a coarser family and is drawn there, once.
    const reach = Math.max(W, H) * 4 + Math.abs(ox) + Math.abs(oy)
    const j0 = Math.ceil(Math.log(S_FAINT / (MINOR * k)) / Math.log(RATIO))
    for (let j = j0; j < j0 + 12; j++) {
      const s = MINOR * RATIO ** j * k
      if (s > reach) break
      const a = weight(s)
      if (a < 0.03) continue // still unresolved: not worth a stroke
      const width = 1 + 0.2 * a
      for (const [vertical, o, len] of [[true, ox, W], [false, oy, H]] as const) {
        for (let n = Math.ceil(-o / s); n <= Math.floor((len - o) / s); n++) {
          if (n % RATIO === 0) continue
          // Fine families vary like the hand-ruled texture; strong ones settle to even.
          const m = 1 - 0.45 * jitter(n, j) * (1 - a)
          rule(vertical, o + n * s, ALPHA * a * m, width)
        }
      }
    }
    // The rules through the origin belong to every family: always full weight.
    rule(true, ox, ALPHA, 1.2)
    rule(false, oy, ALPHA, 1.2)
  }

  return { draw }
}

export type PaperGrid = ReturnType<typeof createPaperGrid>
