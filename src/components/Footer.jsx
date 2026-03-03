export const Footer = () => (
  <footer
    style={{
      padding: '2rem var(--section-padding-x)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <p className="text-label" style={{ color: 'var(--color-muted)' }}>
      © {new Date().getFullYear()} Thomas Llamzon
    </p>
    <p className="text-label" style={{ color: 'var(--color-muted)' }}>
      Built with React &amp; Vite
    </p>
  </footer>
)
