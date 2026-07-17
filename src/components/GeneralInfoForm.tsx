import type { ReportGeneralInfo } from '../types/report'

interface GeneralInfoFormProps {
  generalInfo: ReportGeneralInfo
  onChange: (field: keyof ReportGeneralInfo, value: string | boolean) => void
}

export default function GeneralInfoForm({ generalInfo, onChange }: GeneralInfoFormProps) {
  return (
    <section className="editor-section">

      <label className="field-label" htmlFor="report-title">
        Titulo do relatorio *
      </label>
      <input
        id="report-title"
        type="text"
        value={generalInfo.title}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange('title', event.target.value)}
      />

      <label className="field-label" htmlFor="report-subtitle">
        Subtitulo
      </label>
      <input
        id="report-subtitle"
        type="text"
        value={generalInfo.subtitle}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange('subtitle', event.target.value)}
      />

      <label className="field-label" htmlFor="report-address">
        Endereco *
      </label>
      <input
        id="report-address"
        type="text"
        value={generalInfo.address}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange('address', event.target.value)}
      />

      <label className="field-label" htmlFor="report-description">
        Descricao
      </label>
      <textarea
        id="report-description"
        rows={3}
        value={generalInfo.description}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange('description', event.target.value)}
      />

      <label className="field-label" htmlFor="report-date">
        Data da vistoria
      </label>
      <input
        id="report-date"
        type="date"
        value={generalInfo.surveyDate}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange('surveyDate', event.target.value)}
      />

      <label className="field-label" htmlFor="report-responsible">
        Responsavel
      </label>
      <input
        id="report-responsible"
        type="text"
        value={generalInfo.responsible}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange('responsible', event.target.value)
        }
      />

      <label className="field-label" htmlFor="report-process-number">
        Processo / Convenio / Memorando
      </label>
      <input
        id="report-process-number"
        type="text"
        value={generalInfo.processNumber}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange('processNumber', event.target.value)
        }
      />

      <label className="checkbox-field" htmlFor="repeat-title">
        <input
          id="repeat-title"
          type="checkbox"
          checked={generalInfo.repeatTitle}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onChange('repeatTitle', event.target.checked)
          }
        />
        <span>Repetir titulo nas demais paginas</span>
      </label>
    </section>
  )
}