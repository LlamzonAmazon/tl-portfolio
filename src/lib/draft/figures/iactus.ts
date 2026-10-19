import { motusFlight, type FlightOpts } from './motus'

/** The plate's own sheet when drawn alone (the folio and the mobile hero). */
const BOX = { w: 640, h: 300 }

/**
 * Iactus Iridis, "the cast of the rainbow": the hero's projectile.
 *
 * Galileo's flight (Motus Proiectorum) thrown over the name: launched from
 * beyond the left edge so it enters already in flight, it climbs to an apex
 * just above the type and lands in an impact mark. The ground is ticked
 * into seven equal times, and the seven instants on the path take the
 * spectrum in flight order, R to V, so the whole palette is struck in one
 * throw. The construction stays monotone (quiet): only the instants carry
 * colour.
 *
 * Passes (from motusFlight): ground chord, line of the shot and the cross at
 * its end, protractor and its ticks, equal-time ticks, trajectory with its
 * seven keyed instants, impact, falls 1 4 9.
 *
 * `opts` places it in a scene's own coordinates (the desktop hero measures
 * the name and passes the plane); without them it is drawn on its own box.
 */
export function iactus(opts?: Pick<FlightOpts, 'w' | 'h' | 'from' | 'to' | 'apexY'>) {
  const { w, h } = opts ?? BOX
  return motusFlight({
    w,
    h,
    from: opts?.from ?? [-w * 0.04, h * 0.86],
    to: opts?.to ?? [w * 0.94, h * 0.2],
    apexY: opts?.apexY ?? h * 0.08,
    spectrum: true,
    impact: true,
    quiet: true,
    shotFlow: true,
  })
}
