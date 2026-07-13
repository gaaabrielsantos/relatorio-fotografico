import ImageUpload from './ImageUpload'

export default function FooterUpload({ footer, onUpdate, onError }) {
  return (
    <section className="editor-section">
      <h3>Rodape</h3>
      <ImageUpload
        label="Rodape"
        value={footer.imageDataUrl}
        onChange={(imageDataUrl) => onUpdate({ imageDataUrl })}
        onError={onError}
        onRemove={() => onUpdate({ imageDataUrl: '' })}
      />

      <label className="field-label" htmlFor="footer-width">
        Largura do rodape: {footer.widthPercent}%
      </label>
      <input
        id="footer-width"
        type="range"
        min="10"
        max="100"
        value={footer.widthPercent}
        onChange={(event) => onUpdate({ widthPercent: Number(event.target.value) })}
      />

      <div className="footer-quick-actions">
        <button
          type="button"
          className="btn secondary"
          onClick={() => onUpdate({ widthPercent: 100 })}
          disabled={footer.widthPercent === 100}
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
        onChange={(event) => onUpdate({ repeatMode: event.target.value })}
      >
        <option value="all">Em todas as paginas</option>
        <option value="first">Somente na primeira pagina</option>
      </select>
    </section>
  )
}
