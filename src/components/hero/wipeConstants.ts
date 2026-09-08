/**
 * Reveal = tween WIPE_HIDDEN -> WIPE_SHOWN (visible boundary sweeps left -> right).
 * Close  = tween WIPE_SHOWN -> WIPE_HIDDEN (visible boundary sweeps right -> left).
 * Same two values both ways — no separate translateX mechanism needed.
 */
export const WIPE_HIDDEN = 'inset(0% 100% 0% 0%)'
export const WIPE_SHOWN = 'inset(0% 0% 0% 0%)'
