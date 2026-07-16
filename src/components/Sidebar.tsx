import {
  Eraser,
  FilePlus2,
  FileText,
  Printer,
} from 'lucide-react'
import FooterUpload from './FooterUpload'
import GeneralInfoForm from './GeneralInfoForm'
import HeaderUpload from './HeaderUpload'
import SignatureSection from './SignatureSection'
import type {
  Nomenclature,
  ReportData,
  ReportGeneralInfo,
  ReportHeaderFooter,
  ReportSignature,
} from '../types/report'

interface SidebarProps {
  report: ReportData
  errors: string[]
  onElaborationDateChange: (value: string) => void
  onDeclarationTextChange: (value: string) => void
  onGeneralInfoChange: (field: keyof ReportGeneralInfo, value: string | boolean) => void
  onHeaderUpdate: (patch: Partial<ReportHeaderFooter>) => void
  onFooterUpdate: (patch: Partial<ReportHeaderFooter>) => void
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
  onDeclarationTextChange,
  onGeneralInfoChange,
  onHeaderUpdate,
  onFooterUpdate,
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
        <h1>Declarações</h1>
      </div>

      {hasErrors && (
        <div className="validation-box">
          <ul>
            {errors.map((error: string) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Edicao de pagina">
        <HeaderUpload header={report.header} onUpdate={onHeaderUpdate} onError={onError} />
        <FooterUpload footer={report.footer} onUpdate={onFooterUpdate} onError={onError} />
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Informacoes gerais">
        <GeneralInfoForm generalInfo={report.generalInfo} onChange={onGeneralInfoChange} />
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Texto">
        <section className="editor-section">
          <h3>Texto da declaração</h3>
          <textarea
            id="declaration-text"
            className="declaration-textarea"
            rows={18}
            value={report.declarationText}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              onDeclarationTextChange(event.target.value)
            }
            placeholder="Digite aqui o texto da declaração ou do termo de responsabilidade..."
          />
        </section>
      </section>

      <div className="sidebar-divider" aria-hidden="true" />

      <section className="sidebar-group" aria-label="Data da elaboracao">
        <section className="editor-section">
          <h3>Data da elaboracao</h3>
          <label className="field-label" htmlFor="elaboration-date-text">
            Data da elaboracao da declaracao
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


      <section className="sidebar-group" aria-label="Assinaturas">
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
          <h3>Exportar para pdf</h3>
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
            <span>{isExporting ? 'Gerando PDF...' : 'Exportar declaração em PDF'}</span>
          </button>
          <button
            type="button"
            className="btn warning"
            onClick={(_event: React.MouseEvent<HTMLButtonElement>) => onReset()}
          >
            <Eraser size={16} />
            <span>Nova declaração</span>
          </button>
        </div>
      </section>
    </aside>
  )
}