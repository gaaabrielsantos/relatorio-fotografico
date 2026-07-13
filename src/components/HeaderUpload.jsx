import ImageUpload from './ImageUpload'

export default function HeaderUpload({ header, onUpdate, onError }) {
  return (
    <section className="editor-section">
      <h3>Cabecalho</h3>
      <ImageUpload
        label="Cabecalho"
        value={header.imageDataUrl}
        onChange={(imageDataUrl) => onUpdate({ imageDataUrl })}
        onError={onError}
        onRemove={() => onUpdate({ imageDataUrl: '' })}
      />

      <label className="field-label" htmlFor="header-height">
        Altura do cabecalho ({header.height} px)
      </label>
      <input
        id="header-height"
        type="range"
        min="48"
        max="140"
        value={header.height}
        onChange={(event) => onUpdate({ height: Number(event.target.value) })}
      />

      <label className="field-label" htmlFor="header-repeat">
        Exibicao do cabecalho
      </label>
      <select
        id="header-repeat"
        value={header.repeatMode}
        onChange={(event) => onUpdate({ repeatMode: event.target.value })}
      >
        <option value="all">Em todas as paginas</option>
        <option value="first">Somente na primeira pagina</option>
      </select>
    </section>
  )
}
