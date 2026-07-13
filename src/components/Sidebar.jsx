import {
  Eraser,
  FilePlus2,
  FileText,
  Printer,
} from 'lucide-react'
import FooterUpload from './FooterUpload'
import GeneralInfoForm from './GeneralInfoForm'
import HeaderUpload from './HeaderUpload'
import PhotoEditorList from './PhotoEditorList'
import SignatureSection from './SignatureSection'

export default function Sidebar({
  report,
  errors,
  onGeneralInfoChange,
  onHeaderUpdate,
  onFooterUpdate,
  onAddPhoto,
  onUpdatePhoto,
  onRemovePhoto,
  onMovePhoto,
  onAddSignature,
  onUpdateSignature,
  onRemoveSignature,
  onNomenclatureChange,
  onReset,
  onExport,
  onError,
}) {
  const hasErrors = errors.length > 0

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-topbar">
        <h1>Relatorio Fotografico</h1>
      </div>

      {hasErrors && (
        <div className="validation-box">
          <h4>Validacoes pendentes</h4>
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <HeaderUpload header={report.header} onUpdate={onHeaderUpdate} onError={onError} />
      <GeneralInfoForm generalInfo={report.generalInfo} onChange={onGeneralInfoChange} />

      <section className="editor-section">
        <h3>Fotografias</h3>
        <p className="section-help-text">As paginas sao organizadas automaticamente com 2 fotos por folha.</p>
      </section>

      <PhotoEditorList
        photos={report.photos}
        onAddPhoto={onAddPhoto}
        onUpdate={onUpdatePhoto}
        onRemove={onRemovePhoto}
        onMove={onMovePhoto}
        onError={onError}
      />

      <FooterUpload footer={report.footer} onUpdate={onFooterUpdate} onError={onError} />

      <SignatureSection
        signatures={report.signatures}
        onAdd={onAddSignature}
        onUpdate={onUpdateSignature}
        onRemove={onRemoveSignature}
        onError={onError}
        editable
      />

      <section className="editor-section">
        <h3>Configuracoes</h3>
        <label className="field-label" htmlFor="nomenclature">
          Nomenclatura da pagina
        </label>
        <select
          id="nomenclature"
          value={report.nomenclature}
          onChange={(event) => onNomenclatureChange(event.target.value)}
        >
          <option value="Pagina">Pagina</option>
          <option value="Folha">Folha</option>
        </select>
      </section>

      <div className="sidebar-actions">
        <button type="button" className="btn warning" onClick={onReset}>
          <Eraser size={16} />
          <span>Novo relatorio</span>
        </button>
        <button type="button" className="btn primary" onClick={onExport}>
          <Printer size={16} />
          <span>Exportar relatorio em PDF</span>
        </button>
        <button type="button" className="btn ghost" disabled>
          <FilePlus2 size={16} />
          <span>Salvamento local automatico ativo</span>
        </button>
        <button type="button" className="btn ghost" disabled>
          <FileText size={16} />
          <span>Pronto para impressao A4</span>
        </button>
      </div>
    </aside>
  )
}