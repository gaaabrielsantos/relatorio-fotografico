import ImageUpload from './ImageUpload'
import type { ReportHeaderFooter } from '../types/report'

interface HeaderUploadProps {
  header: ReportHeaderFooter
  onUpdate: (patch: Partial<ReportHeaderFooter>) => void
  onError?: (message: string) => void
}

export default function HeaderUpload({ header, onUpdate, onError }: HeaderUploadProps) {
  const widthPercent = Number.isFinite(Number(header?.widthPercent))
    ? Number(header.widthPercent)
    : 100

  return (
    <section className="editor-section">
      <h3>Cabecalho</h3>
      <ImageUpload
        label=""
        value={header.imageDataUrl}
        onChange={(imageDataUrl: string) => onUpdate({ imageDataUrl })}
        onError={onError}
        onRemove={() => onUpdate({ imageDataUrl: '' })}
      />

      <label className="field-label" htmlFor="header-width">
        Largura do cabecalho: {widthPercent}%
      </label>
      <input
        id="header-width"
        type="range"
        min="20"
        max="100"
        value={widthPercent}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onUpdate({ widthPercent: Number(event.target.value) })
        }
      />

      <label className="field-label" htmlFor="header-repeat">
        Exibicao do cabecalho
      </label>
      <select
        id="header-repeat"
        value={header.repeatMode}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
          onUpdate({ repeatMode: event.target.value as ReportHeaderFooter['repeatMode'] })
        }
      >
        <option value="all">Em todas as paginas</option>
        <option value="first">Somente na primeira pagina</option>
      </select>
    </section>
  )
}
