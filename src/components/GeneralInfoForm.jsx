export default function GeneralInfoForm({ generalInfo, onChange }) {
  return (
    <section className="editor-section">
      <h3>Informacoes gerais</h3>

      <label className="field-label" htmlFor="report-title">
        Titulo do relatorio *
      </label>
      <input
        id="report-title"
        type="text"
        value={generalInfo.title}
        onChange={(event) => onChange('title', event.target.value)}
      />

      <label className="field-label" htmlFor="report-subtitle">
        Subtitulo
      </label>
      <input
        id="report-subtitle"
        type="text"
        value={generalInfo.subtitle}
        onChange={(event) => onChange('subtitle', event.target.value)}
      />

      <label className="field-label" htmlFor="report-address">
        Endereco *
      </label>
      <input
        id="report-address"
        type="text"
        value={generalInfo.address}
        onChange={(event) => onChange('address', event.target.value)}
      />

      <label className="field-label" htmlFor="report-description">
        Descricao
      </label>
      <textarea
        id="report-description"
        rows="3"
        value={generalInfo.description}
        onChange={(event) => onChange('description', event.target.value)}
      />

      <label className="field-label" htmlFor="report-date">
        Data da vistoria
      </label>
      <input
        id="report-date"
        type="date"
        value={generalInfo.surveyDate}
        onChange={(event) => onChange('surveyDate', event.target.value)}
      />

      <label className="field-label" htmlFor="report-responsible">
        Responsavel
      </label>
      <input
        id="report-responsible"
        type="text"
        value={generalInfo.responsible}
        onChange={(event) => onChange('responsible', event.target.value)}
      />

      <label className="field-label" htmlFor="report-process-number">
        Processo / Convenio / Memorando
      </label>
      <input
        id="report-process-number"
        type="text"
        value={generalInfo.processNumber}
        onChange={(event) => onChange('processNumber', event.target.value)}
      />

      <label className="checkbox-field" htmlFor="repeat-title">
        <input
          id="repeat-title"
          type="checkbox"
          checked={generalInfo.repeatTitle}
          onChange={(event) => onChange('repeatTitle', event.target.checked)}
        />
        <span>Repetir titulo nas demais paginas</span>
      </label>
    </section>
  )
}