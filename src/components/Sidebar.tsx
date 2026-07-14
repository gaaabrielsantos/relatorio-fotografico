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
import type {
  Nomenclature,
  ReportData,
  ReportGeneralInfo,
  ReportHeaderFooter,
  ReportPhoto,
  ReportSignature,
} from '../types/report'

interface SidebarProps {
  report: ReportData
  errors: string[]
  onGeneralInfoChange: (field: keyof ReportGeneralInfo, value: string | boolean) => void
  onHeaderUpdate: (patch: Partial<ReportHeaderFooter>) => void
  onFooterUpdate: (patch: Partial<ReportHeaderFooter>) => void
  onAddPhoto: () => void
  onUpdatePhoto: (photoId: string, patch: Partial<ReportPhoto>) => void
  onRemovePhoto: (photoId: string) => void
  onMovePhoto: (photoId: string, direction: 'up' | 'down') => void
  onAddSignature: () => void
  onUpdateSignature: (signatureId: string, patch: Partial<ReportSignature>) => void
  onRemoveSignature: (signatureId: string) => void
  onNomenclatureChange: (value: Nomenclature) => void
  onReset: () => void
  onExport: () => void | Promise<void>
  isExporting?: boolean
  onError?: (message: string) => void
}

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
  isExporting = false,
  onError,
}: SidebarProps) {
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
            {errors.map((error: string) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="sidebar-group" aria-label="Relatorio">
        <h2 className="sidebar-group-title">Relatorio</h2>
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Edicao de pagina">
        <h2 className="sidebar-group-title">Edicao de pagina</h2>
        <HeaderUpload header={report.header} onUpdate={onHeaderUpdate} onError={onError} />
        <FooterUpload footer={report.footer} onUpdate={onFooterUpdate} onError={onError} />
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Informacoes gerais">
        <h2 className="sidebar-group-title">Informacoes gerais</h2>
        <GeneralInfoForm generalInfo={report.generalInfo} onChange={onGeneralInfoChange} />
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Fotos">
        <h2 className="sidebar-group-title">Fotos</h2>
        <PhotoEditorList
          photos={report.photos}
          onAddPhoto={onAddPhoto}
          onUpdate={onUpdatePhoto}
          onRemove={onRemovePhoto}
          onMove={onMovePhoto}
          onError={onError}
        />
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Assinaturas">
        <h2 className="sidebar-group-title">Assinaturas</h2>
        <SignatureSection
          signatures={report.signatures}
          onAdd={onAddSignature}
          onUpdate={onUpdateSignature}
          onRemove={onRemoveSignature}
          onError={onError}
          editable
        />
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Configuracoes e exportacoes">
        <h2 className="sidebar-group-title">Configuracoes e exportacoes</h2>
        <section className="editor-section">
          <h3>Configuracoes</h3>
          <label className="field-label" htmlFor="nomenclature">
            Nomenclatura da pagina
          </label>
          <select
            id="nomenclature"
            value={report.nomenclature}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              onNomenclatureChange(event.target.value as Nomenclature)
            }
          >
            <option value="Pagina">Pagina</option>
            <option value="Folha">Folha</option>
          </select>
        </section>

        <div className="sidebar-actions">
          <button
            type="button"
            className="btn warning"
            onClick={(_event: React.MouseEvent<HTMLButtonElement>) => onReset()}
          >
            <Eraser size={16} />
            <span>Novo relatorio</span>
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={(_event: React.MouseEvent<HTMLButtonElement>) => {
              void onExport()
            }}
            disabled={isExporting}
          >
            <Printer size={16} />
            <span>{isExporting ? 'Gerando PDF...' : 'Exportar relatorio em PDF'}</span>
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
      </section>
    </aside>
  )
}