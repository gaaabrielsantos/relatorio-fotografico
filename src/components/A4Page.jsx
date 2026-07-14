export default function A4Page({
  children,
  headerImage,
  headerWidthPercent,
  showHeader,
  footerImage,
  footerWidthPercent,
  showFooter,
  pageLabel,
  previewScale = 1,
}) {
  const normalizedHeaderWidth = Math.max(20, Math.min(100, Number(headerWidthPercent ?? 100)))
  const normalizedFooterWidth = Math.max(20, Math.min(100, Number(footerWidthPercent ?? 100)))

  return (
    <article
      className="a4-page report-page avoid-break"
      style={{
        transform: `scale(${previewScale})`,
        transformOrigin: 'top left',
      }}
    >
      {showHeader && (
        <header className="page-header report-header-full-width">
          {headerImage ? (
            <img
              src={headerImage}
              alt="Cabecalho"
              className="page-header-image"
              style={{
                width: `${normalizedHeaderWidth}%`,
                height: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <div className="header-placeholder" aria-hidden="true" />
          )}
        </header>
      )}

      <div className="page-body">{children}</div>

      {showFooter && (
        <footer className="page-footer report-footer-full-width">
          <div className="footer-slot page-footer-image-wrapper">
            {footerImage ? (
              <img
                src={footerImage}
                alt="Rodape"
                className="page-footer-image"
                style={{
                  width: `${normalizedFooterWidth}%`,
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <div className="footer-placeholder" />
            )}
          </div>
          <div className="page-number">{pageLabel}</div>
        </footer>
      )}
    </article>
  )
}