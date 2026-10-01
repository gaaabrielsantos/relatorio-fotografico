import { ImagePlus, Trash2 } from 'lucide-react'
import { compressImageFile } from '../utils/imageUtils'
import type { ReportPhoto } from '../types/report'

interface SingleImageUploadProps {
  mode?: 'single'
  label: string
  value: string
  onChange: (imageDataUrl: string) => void
  onError?: (message: string) => void
  onRemove?: () => void
  maxFileSizeMB?: number
}

interface MultiplePhotoUploadProps {
  mode: 'multiple-photos'
  currentCount: number
  onAddPhotos: (photos: ReportPhoto[]) => void
  onError?: (message: string) => void
  maxFileSizeMB?: number
}

type ImageUploadProps = SingleImageUploadProps | MultiplePhotoUploadProps

function getOrientation(imageUrl: string): Promise<ReportPhoto['orientation']> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      resolve(image.naturalHeight >= image.naturalWidth ? 'portrait' : 'landscape')
    }
    image.onerror = () => resolve('portrait')
    image.src = imageUrl
  })
}

export default function ImageUpload(props: ImageUploadProps) {
  if (props.mode === 'multiple-photos') {
    const { currentCount, onAddPhotos, onError, maxFileSizeMB = 12 } = props

    const handleFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget
      const files = Array.from(input.files ?? [])
      if (files.length === 0) return

      try {
        const newPhotos: ReportPhoto[] = []
        const date = new Date().toISOString().split('T')[0]

        for (const [index, file] of files.entries()) {
          const processed = await compressImageFile(file, { maxFileSizeMB })
          const rawName = file.name.replace(/\.[^/.]+$/, '')
          newPhotos.push({
            id: crypto.randomUUID(),
            caption: `Foto ${currentCount + index + 1} - ${rawName}`,
            date,
            image: processed.dataUrl,
            orientation: await getOrientation(processed.dataUrl),
          })
        }

        onAddPhotos(newPhotos)
        onError?.('')
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel adicionar as imagens. Tente novamente.',
        )
      } finally {
        input.value = ''
      }
    }

    return (
      <div className="bulk-image-upload">
        <label className="btn secondary upload-label" htmlFor="bulk-photo-upload">
          <ImagePlus size={16} />
          <span>Selecionar fotos (múltiplas)</span>
        </label>
        <input
          id="bulk-photo-upload"
          className="file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFilesChange}
        />
        <small>Você pode selecionar várias fotos de uma vez.</small>
      </div>
    )
  }

  const {
    label,
    value,
    onChange,
    onError,
    onRemove,
    maxFileSizeMB = 12,
  } = props

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const processed = await compressImageFile(file, { maxFileSizeMB })
      onChange(processed.dataUrl)
      onError?.('')
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Falha ao processar imagem.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="image-upload-control">
      <label className="field-label">{label}</label>
      <div className="image-upload-actions no-print">
        <label className="btn secondary upload-label" htmlFor={`upload-${label}`}>
          <ImagePlus size={16} />
          <span>{value ? 'Substituir imagem' : 'Enviar imagem'}</span>
        </label>
        <input
          id={`upload-${label}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="file-input"
        />
        {value && (
          <button
            type="button"
            className="btn danger"
            onClick={(_event: React.MouseEvent<HTMLButtonElement>) => onRemove?.()}
          >
            <Trash2 size={16} />
            <span>Remover</span>
          </button>
        )}
      </div>
      {value && (
        <div className="upload-preview-box">
          <img src={value} alt={label} className="upload-preview" />
        </div>
      )}
    </div>
  )
}
