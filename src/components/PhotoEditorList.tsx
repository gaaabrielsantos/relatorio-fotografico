import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react'
import { compressImageFile } from '../utils/imageUtils'
import type { ReportPhoto } from '../types/report'

interface PhotoEditorListProps {
  photos: ReportPhoto[]
  onAddPhoto: () => void
  onUpdate: (photoId: string, patch: Partial<ReportPhoto>) => void
  onRemove: (photoId: string) => void
  onMove: (photoId: string, direction: 'up' | 'down') => void
  onError?: (message: string) => void
}

export default function PhotoEditorList({
  photos,
  onAddPhoto,
  onUpdate,
  onRemove,
  onMove,
  onError,
}: PhotoEditorListProps) {
  const handleUpload = async (photoId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onError?.('Arquivo invalido. Use uma imagem JPG, PNG ou WEBP.')
      event.target.value = ''
      return
    }

    try {
      const processed = await compressImageFile(file, { maxFileSizeMB: 12 })
      if (!processed?.dataUrl) {
        throw new Error('Nao foi possivel processar a imagem.')
      }
      onUpdate(photoId, { image: processed.dataUrl })
      onError?.('')
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Nao foi possivel adicionar esta imagem. Tente novamente.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <section className="editor-section">
      <h3>Fotos</h3>
      <div className="photo-editor-list">
        {photos.map((photo, index) => (
          <article className="photo-editor-card" key={photo.id}>
            <h4>Foto {index + 1}</h4>
            <label className="field-label" htmlFor={`photo-caption-${photo.id}`}>
              Legenda curta
            </label>
            <textarea
              id={`photo-caption-${photo.id}`}
              rows={2}
              maxLength={180}
              value={photo.caption}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                onUpdate(photo.id, { caption: event.target.value })
              }
            />

            <div className="photo-editor-actions">
              <label className="btn secondary upload-label" htmlFor={`photo-upload-${photo.id}`}>
                <ImagePlus size={16} />
                <span>{photo.image ? 'Trocar imagem' : 'Enviar imagem'}</span>
              </label>
              <input
                id={`photo-upload-${photo.id}`}
                className="file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => handleUpload(photo.id, event)}
              />

              <button
                type="button"
                className="btn secondary"
                onClick={(_event: React.MouseEvent<HTMLButtonElement>) => onError?.('')}
              >
                Preencher espaco
              </button>

              <button
                type="button"
                className="btn secondary"
                onClick={(_event: React.MouseEvent<HTMLButtonElement>) =>
                  onMove(photo.id, 'up')
                }
                disabled={index === 0}
              >
                <ArrowUp size={16} />
                <span>Subir</span>
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={(_event: React.MouseEvent<HTMLButtonElement>) =>
                  onMove(photo.id, 'down')
                }
                disabled={index === photos.length - 1}
              >
                <ArrowDown size={16} />
                <span>Descer</span>
              </button>
              <button
                type="button"
                className="btn danger"
                onClick={(_event: React.MouseEvent<HTMLButtonElement>) => onRemove(photo.id)}
              >
                <Trash2 size={16} />
                <span>Excluir</span>
              </button>
            </div>
          </article>
        ))}

        <div className="photo-list-add-action">
          <button type="button" className="btn secondary" onClick={onAddPhoto}>
            <ImagePlus size={16} />
            <span>Adicionar fotografia</span>
          </button>
        </div>
      </div>
    </section>
  )
}