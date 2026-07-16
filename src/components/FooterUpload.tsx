import ImageUpload from './ImageUpload'
import type { ReportHeaderFooter } from '../types/report'

interface FooterUploadProps {
  footer: ReportHeaderFooter
  onUpdate: (patch: Partial<ReportHeaderFooter>) => void
  onError?: (message: string) => void
}

export default function FooterUpload({ footer, onUpdate, onError }: FooterUploadProps) {
  const widthPercent = Number.isFinite(Number(footer?.widthPercent))
    ? Number(footer.widthPercent)
    : 100

  return (
    <section className="editor-section">
      <h3>Rodape</h3>
      <ImageUpload
        value={footer.imageDataUrl}
        onChange={(imageDataUrl) => onUpdate({ imageDataUrl })}
        onError={onError}
        onRemove={() => onUpdate({ imageDataUrl: '' })}
      />

      <label className="field-label" htmlFor="footer-width">
        Largura do rodape: {widthPercent}%
      </label>
      <input
        id="footer-width"
        type="range"
        min="20"
        max="100"
        value={widthPercent}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onUpdate({ widthPercent: Number(event.target.value) })
        }
      />

      <div className="footer-quick-actions">
        <button
          type="button"
          className="btn secondary"
          onClick={(_event: React.MouseEvent<HTMLButtonElement>) => onUpdate({ widthPercent: 100 })}
          disabled={widthPercent === 100}
        >
          Usar largura total
        </button>
      </div>

      <label className="field-label" htmlFor="footer-repeat">
        Exibicao do rodape
      </label>
      <select
        id="footer-repeat"
        value={footer.repeatMode}
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
