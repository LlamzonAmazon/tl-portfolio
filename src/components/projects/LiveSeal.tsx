/**
 * "Live" mark for a project with a public demo: a flat ink DISC (.seal--live).
 * The disc means a live product; the plate (PublishedSeal) means a
 * publication. Status is monotone on purpose, it is never a sheet key.
 * Decorative: the modal's "Live" link is the affordance.
 */
export function LiveSeal() {
  return (
    <span aria-hidden className="seal seal--live">
      Live
    </span>
  )
}
