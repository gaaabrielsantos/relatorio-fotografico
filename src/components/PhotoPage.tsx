import PhotoSection from './PhotoSection'
import SignaturePage from './SignaturePage'
import type { ReportGeneralInfo, ReportPhoto, ReportSignature } from '../types/report'

interface PhotoPageProps {
  photos?: ReportPhoto[]
  allPhotos?: ReportPhoto[]
  showGeneralInfo: boolean
  showRepeatedTitle: boolean
  generalInfo: ReportGeneralInfo
  elaborationDateText?: string
  signatures?: ReportSignature[]
  embedSignature?: boolean
  watermarkPhotoPlaceholder?: boolean
}

interface InfoField {
  label: string
  value: string
  placeholder: string
}

export default function PhotoPage({
  photos = [],
  allPhotos = [],
  showGeneralInfo,
  showRepeatedTitle,
  generalInfo,
  elaborationDateText = '',
  signatures = [],
  embedSignature = false,
  watermarkPhotoPlaceholder = false,
}: PhotoPageProps) {
  const shouldEmbedSignature = embedSignature && photos.length === 1
  const shouldShowPhotoPlaceholder = watermarkPhotoPlaceholder && photos.length === 0

  const titleText = generalInfo?.title?.trim() ? generalInfo.title : 'Titulo do relatorio'
  const subtitleText = generalInfo?.subtitle?.trim() ? generalInfo.subtitle : ''

  const infoFields: InfoField[] = [
    {
      label: 'Endereco',
      value: generalInfo.address,
      placeholder: 'Endereco do local',
    },
    {
      label: 'Data da vistoria',
      value: generalInfo.surveyDate,
      placeholder: 'Data da vistoria',
    },
    {
      label: 'Responsavel',
      value: generalInfo.responsible,
      placeholder: 'Nome do responsavel',
    },
    {
      label: 'Processo/Convenio',
      value: generalInfo.processNumber,
      placeholder: 'Numero do processo ou convenio',
    },
  ]

  const descriptionValue = generalInfo.description.trim()

  return (
    <div className="photo-page-content">
      {showGeneralInfo && (
        <section className="general-info-box avoid-break">
          <h2 className={generalInfo.title.trim() ? '' : 'watermark-text'}>{titleText}</h2>
          {subtitleText ? <h3>{subtitleText}</h3> : null}
          <div className="general-info-grid">
            {infoFields.map((field) => {
              const hasValue = Boolean(field.value?.trim())
              return (
                <p key={field.label}>
                  <strong>{field.label}:</strong>{' '}
                  <span className={hasValue ? '' : 'watermark-text'}>
                    {hasValue ? field.value : field.placeholder}
                  </span>
                </p>
              )
            })}
          </div>
          <p className="general-info-description">
            <span className={descriptionValue ? '' : 'watermark-text'}>
              {descriptionValue || 'Descricao do servico ou vistoria'}
            </span>
          </p>
        </section>
      )}

      {!showGeneralInfo && showRepeatedTitle && (
        <section className="repeated-title-box avoid-break">
          <h2>{generalInfo.title || 'Titulo do relatorio'}</h2>
        </section>
      )}

      <div className={`photos-vertical ${shouldEmbedSignature ? 'photos-vertical-with-signature' : ''}`}>
        {photos.filter(Boolean).map((photo) => {
          const index = allPhotos.findIndex((item) => item.id === photo.id)
          return <PhotoSection key={photo.id} photo={photo} index={index} />
        })}

        {shouldShowPhotoPlaceholder && <PhotoSection photo={null} index={0} watermarkPlaceholder />}

        {shouldEmbedSignature && (
          <div className="embedded-signature-wrapper avoid-break">
            {elaborationDateText.trim() && (
              <section className="elaboration-date-section avoid-break">
                <p>{elaborationDateText}</p>
              </section>
            )}
            <SignaturePage signatures={signatures} embedded />
          </div>
        )}
      </div>
    </div>
  )
}