import SignaturePage from './SignaturePage'
import type { ReportGeneralInfo, ReportSignature } from '../types/report'

interface PhotoPageProps {
  showGeneralInfo: boolean
  showRepeatedTitle: boolean
  generalInfo: ReportGeneralInfo
  elaborationDateText?: string
  declarationText?: string
  signatures?: ReportSignature[]
  showDateAndSignatures?: boolean
}

export default function PhotoPage({
  showGeneralInfo,
  showRepeatedTitle,
  generalInfo,
  elaborationDateText = '',
  declarationText = '',
  signatures = [],
  showDateAndSignatures = true,
}: PhotoPageProps) {
  const trimmedDeclarationText = declarationText.trim()

  const titleText = generalInfo?.title?.trim() ? generalInfo.title : 'Declaração'
  const subtitleText = generalInfo?.subtitle?.trim() ? generalInfo.subtitle : ''

  const descriptionValue = generalInfo.description.trim()

  return (
    <div className="declaration-page-content">
      {showGeneralInfo && (
        <section className="general-info-box avoid-break">
          <h2 className={generalInfo.title.trim() ? '' : 'watermark-text'}>{titleText}</h2>
          {subtitleText ? <h3>{subtitleText}</h3> : null}
          <p className="general-info-description">
            <span className={descriptionValue ? '' : 'watermark-text'}>
              {descriptionValue || 'Descricao do servico ou vistoria'}
            </span>
          </p>
        </section>
      )}

      {!showGeneralInfo && showRepeatedTitle && (
        <section className="repeated-title-box avoid-break">
          <h2>{generalInfo.title || 'Declaração'}</h2>
        </section>
      )}

      <section className="declaration-content">
        {trimmedDeclarationText ? (
          <div className="declaration-body">{trimmedDeclarationText}</div>
        ) : (
          <p className="declaration-placeholder no-print">
            Digite o conteúdo da declaração no menu lateral.
          </p>
        )}
      </section>

      {showDateAndSignatures && (
        <div className="declaration-signature-wrapper avoid-break">
          {elaborationDateText.trim() && (
            <section className="elaboration-date-section avoid-break">
              <p>{elaborationDateText}</p>
            </section>
          )}

          <SignaturePage signatures={signatures} />
        </div>
      )}
    </div>
  )
}