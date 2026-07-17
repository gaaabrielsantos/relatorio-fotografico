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
  onElaborationDateChange: (value: string) => void
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
  onElaborationDateChange,
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
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Edicao de pagina">
        <HeaderUpload header={report.header} onUpdate={onHeaderUpdate} onError={onError} />
        <FooterUpload footer={report.footer} onUpdate={onFooterUpdate} onError={onError} />
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Informacoes gerais">
        <h2 className="sidebar-group-title">INFORMAÇÕES GERAIS</h2>
        <GeneralInfoForm generalInfo={report.generalInfo} onChange={onGeneralInfoChange} />
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Fotos">
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

      <section className="sidebar-group" aria-label="Data da elaboracao">
        <section className="editor-section">
          <h3>Data da elaboracao</h3>
          <label className="field-label" htmlFor="elaboration-date-text">
            Data da elaboracao do relatorio
          </label>
          <input
            id="elaboration-date-text"
            type="text"
            value={report.elaborationDateText}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onElaborationDateChange(event.target.value)
            }
            placeholder="Mairinque, 16 de Julho de 2026"
          />
        </section>
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="">
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
            className="btn primary"
            onClick={(_event: React.MouseEvent<HTMLButtonElement>) => {
              void onExport()
            }}
            disabled={isExporting}
          >
            <Printer size={16} />
            <span>{isExporting ? 'Gerando PDF...' : 'Exportar relatorio em PDF'}</span>
          </button>
          <button
            type="button"
            className="btn warning"
            onClick={(_event: React.MouseEvent<HTMLButtonElement>) => onReset()}
          >
            <Eraser size={16} />
            <span>Novo relatorio</span>
          </button>
        </div>
      </section>
    </aside>
  )
}