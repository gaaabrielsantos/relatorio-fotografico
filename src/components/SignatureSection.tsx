import { ImagePlus, Trash2 } from 'lucide-react'
import { compressImageFile } from '../utils/imageUtils'
import type { ReportSignature } from '../types/report'

interface SignatureSectionProps {
  signatures: ReportSignature[]
  onAdd: () => void
  onUpdate: (signatureId: string, patch: Partial<ReportSignature>) => void
  onRemove: (signatureId: string) => void
  onError?: (message: string) => void
  editable?: boolean
}

export default function SignatureSection({
  signatures,
  onAdd,
  onUpdate,
  onRemove,
  onError,
  editable = true,
}: SignatureSectionProps) {
  const canAdd = signatures.length < 4
  const gridClass = `signatures-grid signatures-${signatures.length}`

  const handleUpload = async (
    signatureId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const processed = await compressImageFile(file, { maxFileSizeMB: 8 })
      onUpdate(signatureId, { signatureImageDataUrl: processed.dataUrl, mode: 'digital' })
      onError?.('')
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Falha ao processar assinatura.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <section className="editor-section">
      <h3>Assinaturas</h3>

      <div className={gridClass}>
        {signatures.map((signature) => (
          <article className="signature-card avoid-break" key={signature.id}>
            {editable && (
              <>

                <div className="signature-upload no-print">
                  <label className="btn secondary upload-label" htmlFor={`sig-upload-${signature.id}`}>
                    <ImagePlus size={16} />
                    <span>{signature.signatureImageDataUrl ? 'Trocar assinatura' : 'Enviar assinatura'}</span>
                  </label>
                  <input
                    id={`sig-upload-${signature.id}`}
                    className="file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => handleUpload(signature.id, event)}
                  />
                  <button
                    type="button"
                    className="btn danger"
                    onClick={() => onRemove(signature.id)}
                    disabled={signatures.length === 1}
                  >
                    <Trash2 size={16} />
                    <span>Remover</span>
                  </button>
                </div>

                <div className="signature-fields no-print">
                  <input
                    type="text"
                    placeholder="Nome do responsável"
                    value={signature.name}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdate(signature.id, { name: event.target.value })
                      }
                  />
                  <input
                    type="text"
                    placeholder="Cargo/Função"
                    value={signature.role}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdate(signature.id, { role: event.target.value })
                      }
                  />
                  <input
                    type="text"
                    placeholder="Número de registro"
                    value={signature.registrationNumber}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      onUpdate(signature.id, { registrationNumber: event.target.value })
                    }
                  />
                </div>
              </>
            )}

          </article>
        ))}
      </div>

      {editable && (
        <div className="signature-toolbar no-print add-signature-toolbar">
          <button type="button" className="btn secondary" onClick={onAdd} disabled={!canAdd}>
            Adicionar assinatura
          </button>
          {!canAdd && <small>Limite maximo de 4 assinaturas atingido.</small>}
        </div>
      )}
    </section>
  )
}