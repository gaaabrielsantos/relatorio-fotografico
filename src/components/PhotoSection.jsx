function buildPhotoIdentifier(photo, index) {
  if (index === null || index === undefined || index < 0) {
    return ''
  }

  const parts = [`Foto ${index + 1}`]
  if (photo?.caption) parts.push(photo.caption)
  return parts.join(' - ')
}

export default function PhotoSection({
  photo,
  index,
  watermarkPlaceholder = false,
}) {
  const identifier = buildPhotoIdentifier(photo, index)
  const altText = identifier || 'Fotografia'

  if (watermarkPlaceholder) {
    return (
      <article className="photo-section avoid-break no-print-placeholder-page">
        <header className="photo-header">
          <h4 className="watermark-text">Foto 1 - Legenda da fotografia</h4>
        </header>

        <div className="photo-frame photo-placeholder watermark-photo-placeholder">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
            <circle cx="9" cy="10" r="2" />
            <path d="m21 15-4-4L7 21" />
          </svg>
          <p className="watermark-text">Adicionar Foto 1</p>
          <small className="watermark-text">Legenda da fotografia</small>
        </div>
      </article>
    )
  }

  return (
    <article className="photo-section avoid-break">
      <header className="photo-header">
        <h4>{identifier}</h4>
      </header>

      <div className="photo-frame">
        <img
          src={photo?.image || ''}
          alt={altText}
          className="photo-image fit-contain"
        />
      </div>
    </article>
  )
}