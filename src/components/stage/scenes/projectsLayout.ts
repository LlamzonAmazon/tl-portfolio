/**
 * The Projects sheet: an asymmetric, hand-placed composition around the
 * heading at the exact center of the screen. Sheets vary in size and none
 * share an edge line, so the board reads as pinned up by a person, not
 * snapped to a grid; there is open paper around the heading, and the
 * bottom-right stays clear for the title block. Projects take the larger,
 * nearer positions (hierarchy); hatched placeholders fill the gaps.
 *
 * The board zoom-out (one camera value `z`, D-06) scales only the paper's
 * grid tile. Sheets never ride it: each one is DRAFTED in place once its
 * construction line lands (stage/sequences/projects.ts), so nothing is ever
 * drawn while it is moving or scaling.
 */
export const BOARD_ZOOM_SCALE = 2.7 // tunable 2.2-3.0; larger = cards start further out and shrink more

/**
 * The hero to thesis dive: once the name has left the viewport, the camera
 * zooms this much further in about the same origin, and the thesis (inked at
 * 1/THESIS_GROW at the center) grows to full size under it (camera.ts ZOOM).
 */
export const THESIS_GROW = 8 // tunable 5-12; larger = the thesis starts as a smaller speck

/** Zoom origin and radial origin: the exact center of the screen (%). */
export const BOARD_ORIGIN_X = 50
export const BOARD_ORIGIN_Y = 50

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/** The heading's box, centered on the origin. */
export const HEADING_RECT: Rect = { left: 35, top: 38, width: 30, height: 24 }

export interface CollageSlot {
  key: string
  kind: 'project' | 'placeholder'
  projectId?: number
  rect: Rect // % of stage
}

/**
 * Draft order: projects first, swept clockwise from top-left, then the
 * placeholders. Each sheet is drafted on its own step in this order.
 */
export const COLLAGE_LAYOUT: CollageSlot[] = [
  { key: 'async-fl', kind: 'project',     projectId: 1, rect: { left: 7,  top: 8,  width: 27, height: 30 } },
  { key: 'wsc',      kind: 'project',     projectId: 3, rect: { left: 70, top: 24, width: 25, height: 27 } },
  { key: 'agentops', kind: 'project',     projectId: 4, rect: { left: 35, top: 70, width: 23, height: 22 } },
  { key: 'dash',     kind: 'project',     projectId: 2, rect: { left: 4,  top: 56, width: 24, height: 26 } },
  { key: 'ph-top',   kind: 'placeholder',               rect: { left: 44, top: 5,  width: 18, height: 20 } },
  { key: 'ph-right', kind: 'placeholder',               rect: { left: 60, top: 63, width: 18, height: 21 } },
]
