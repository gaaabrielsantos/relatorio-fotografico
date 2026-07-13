import PhotoSection from './PhotoSection'
import SignaturePage from './SignaturePage'

export default function PhotoPage({
  photos,
  allPhotos,
  showGeneralInfo,
  showRepeatedTitle,
  generalInfo,
  signatures,
  embedSignature = false,
}) {
  const shouldEmbedSignature = embedSignature && photos.length === 1

  return (
    <div className="photo-page-content">
      {showGeneralInfo && (
        <section className="general-info-box avoid-break">
          <h2>{generalInfo.title || 'Titulo do relatorio'}</h2>
          {generalInfo.subtitle && <h3>{generalInfo.subtitle}</h3>}
          <div className="general-info-grid">
            <p>
              <strong>Endereco:</strong> {generalInfo.address || '-'}
            </p>
            <p>
              <strong>Data da vistoria:</strong> {generalInfo.surveyDate || '-'}
            </p>
            <p>
              <strong>Responsavel:</strong> {generalInfo.responsible || '-'}
            </p>
            <p>
              <strong>Processo/Convenio:</strong> {generalInfo.processNumber || '-'}
            </p>
          </div>
          <p className="general-info-description">{generalInfo.description || '-'}</p>
        </section>
      )}

      {!showGeneralInfo && showRepeatedTitle && (
        <section className="repeated-title-box avoid-break">
          <h2>{generalInfo.title || 'Titulo do relatorio'}</h2>
        </section>
      )}

      <div className={`photos-vertical ${shouldEmbedSignature ? 'photos-vertical-with-signature' : ''}`}>
        {photos.map((photo) => {
          const index = allPhotos.findIndex((item) => item.id === photo.id)
          return <PhotoSection key={photo.id} photo={photo} index={index} />
        })}

        {shouldEmbedSignature && (
          <div className="embedded-signature-wrapper avoid-break">
            <SignaturePage signatures={signatures} embedded />
          </div>
        )}
      </div>
    </div>
  )
}