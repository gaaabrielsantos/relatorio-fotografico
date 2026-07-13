function buildPhotoIdentifier(photo, index) {
  if (index === null || index === undefined || index < 0) {
    return ''
  }

  const parts = [`Foto ${index + 1}`]
  if (photo.caption) parts.push(photo.caption)
  return parts.join(' - ')
}

export default function PhotoSection({
  photo,
  index,
}) {
  const identifier = buildPhotoIdentifier(photo, index)
  const altText = identifier || 'Fotografia'

  return (
    <article className="photo-section avoid-break">
      <header className="photo-header">
        <h4>{identifier}</h4>
      </header>

      <div className="photo-frame">
        <img
          src={photo.imageDataUrl}
          alt={altText}
          className={`photo-image fit-${photo.imageFit || 'contain'}`}
        />
      </div>
    </article>
  )
}