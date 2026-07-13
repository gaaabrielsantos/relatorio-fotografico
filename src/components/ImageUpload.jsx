import { ImagePlus, Trash2 } from 'lucide-react'
import { compressImageFile } from '../utils/imageUtils'

export default function ImageUpload({
  label,
  value,
  onChange,
  onError,
  onRemove,
  maxFileSizeMB = 12,
}) {
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const processed = await compressImageFile(file, { maxFileSizeMB })
      onChange(processed.dataUrl)
      onError?.('')
    } catch (error) {
      onError?.(error.message)
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
          <button type="button" className="btn danger" onClick={onRemove}>
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
