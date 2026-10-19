interface PublishedSealProps {
  /** Publication venue, set under the status line. */
  venue: string
}

/**
 * "Published" mark for a peer-reviewed project: a flat ink PLATE
 * (.seal--published), square to the sheet. The plate means a publication; the
 * disc (LiveSeal) means a live product. Decorative; the modal states the venue
 * in text.
 */
export function PublishedSeal({ venue }: PublishedSealProps) {
  return (
    <span aria-hidden className="seal seal--published">
      <span>Published</span>
      <span className="seal__venue">{venue}</span>
    </span>
  )
}
