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

      <label className="field-label description-field-label" htmlFor="report-description">
        Descricao
      </label>
      <textarea
        id="report-description"
        className="description-textarea"
        rows={6}
        value={generalInfo.description}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange('description', event.target.value)}
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