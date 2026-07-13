export default function SignaturePage({ signatures, embedded = false }) {
  const gridClass = `signatures-grid signatures-${signatures.length}`
  const sectionClass = `signature-page-content${embedded ? ' embedded-signature-content' : ''}`
  const titleClass = `signature-page-title${embedded ? ' embedded-signature-title' : ''}`

  return (
    <section className={sectionClass}>
      <h2 className={titleClass}>Responsaveis tecnicos</h2>
      <div className={gridClass}>
        {signatures.map((signature) => (
          <article className="signature-card avoid-break" key={signature.id}>
            <div className="signature-area">
              {signature.mode === 'digital' && signature.signatureImageDataUrl ? (
                <img
                  src={signature.signatureImageDataUrl}
                  alt={`Assinatura de ${signature.name || 'responsavel'}`}
                  className="signature-image"
                />
              ) : (
                <div className="signature-blank" />
              )}
            </div>
            <div className="signature-line" />
            <p className="signature-name">{signature.name || 'Nome do responsavel'}</p>
            <p className="signature-role">{signature.role || 'Cargo ou funcao'}</p>
            {signature.registrationNumber && (
              <p className="signature-registry">Registro: {signature.registrationNumber}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}