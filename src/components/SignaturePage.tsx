import type { ReportSignature } from '../types/report'
import { hasSignatureContent } from '../utils/signatureUtils'

interface SignaturePageProps {
  signatures?: ReportSignature[]
  embedded?: boolean
}

export default function SignaturePage({
  signatures = [],
  embedded = false,
}: SignaturePageProps) {
  const filledSignatures = signatures.filter(hasSignatureContent)
  if (filledSignatures.length === 0) return null

  const gridClass = `signatures-grid signatures-${filledSignatures.length}`
  const sectionClass = `signature-page-content${embedded ? ' embedded-signature-content' : ''}`

  return (
    <section className={sectionClass}>
      <div className={gridClass}>
        {filledSignatures.map((signature) => (
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
            <div className="signature-details">
              <p className="signature-name">{signature.name || 'Nome do responsável'}</p>
              {signature.role && <p className="signature-role">{signature.role}</p>}
              {signature.registrationNumber && (
                <p className="signature-registry">{signature.registrationNumber}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}