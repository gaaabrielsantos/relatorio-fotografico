import { useMemo } from 'react'
import PhotoSection from './PhotoSection'
import SignaturePage from './SignaturePage'
import { buildPhotoRows } from '../utils/reportLayout'
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
  const descriptionValue = generalInfo.description.trim()
  const photoRows = useMemo(() => buildPhotoRows(photos), [photos])

  return (
    <div className="photo-page-content">
      {showGeneralInfo && (
        <section className="general-info-box avoid-break">
          <h2 className={generalInfo.title.trim() ? '' : 'watermark-text'}>{titleText}</h2>
          <p className="general-info-description description-preview-text">
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
        {photoRows.map((row, rowIndex) => {
          const isPortraitPair = row.length === 2 && row.every((photo) => photo.orientation !== 'landscape')
          const isLandscapeRow = row.length === 1 && row[0]?.orientation === 'landscape'
          const isSinglePortraitRow = row.length === 1 && row[0]?.orientation !== 'landscape'
          const isStackedPair = photoRows.length === 2 && photoRows.every((entry) => entry.length === 1)
          const isLandscapeStack = isStackedPair && row.every((photo) => photo.orientation === 'landscape')

          return (
            <div
              key={`photo-row-${row.map((photo) => photo.id).join('-') || rowIndex}`}
              className={[
                'photo-row',
                isPortraitPair ? 'photo-row--portrait-pair' : '',
                isLandscapeRow ? 'photo-row--landscape' : '',
                isSinglePortraitRow ? 'photo-row--single-portrait' : '',
                isStackedPair ? 'photo-row--stacked' : '',
                isLandscapeStack ? 'photo-row--stacked-landscape' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {row.map((photo) => {
                const index = allPhotos.findIndex((item) => item.id === photo.id)
                return <PhotoSection key={photo.id} photo={photo} index={index} />
              })}
            </div>
          )
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