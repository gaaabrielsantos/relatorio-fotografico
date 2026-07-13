export default function A4Page({
  children,
  headerImage,
  headerHeight,
  showHeader,
  footerImage,
  footerWidthPercent,
  showFooter,
  pageLabel,
  previewScale = 1,
}) {
  return (
    <article
      className="a4-page report-page avoid-break"
      style={{
        transform: `scale(${previewScale})`,
        transformOrigin: 'top left',
      }}
    >
      {showHeader && (
        <header className="page-header" style={{ height: `${headerHeight}px` }}>
          {headerImage ? (
            <img src={headerImage} alt="Cabecalho" className="page-header-image" />
          ) : (
            <div className="header-placeholder">Relatorio Fotografico</div>
          )}
        </header>
      )}

      <div className="page-body">{children}</div>

      {showFooter && (
        <footer className="page-footer">
          <div className="footer-slot">
            {footerImage ? (
              <img
                src={footerImage}
                alt="Rodape"
                className="page-footer-image"
                style={{ width: `${footerWidthPercent || 80}%` }}
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