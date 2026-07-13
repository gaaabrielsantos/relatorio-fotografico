import { ImagePlus, Trash2 } from 'lucide-react'
import { compressImageFile } from '../utils/imageUtils'

export default function SignatureSection({
  signatures,
  onAdd,
  onUpdate,
  onRemove,
  onError,
  editable = true,
}) {
  const canAdd = signatures.length < 4
  const gridClass = `signatures-grid signatures-${signatures.length}`

  const handleUpload = async (signatureId, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const processed = await compressImageFile(file, { maxFileSizeMB: 8 })
      onUpdate(signatureId, { signatureImageDataUrl: processed.dataUrl, mode: 'digital' })
      onError?.('')
    } catch (error) {
      onError?.(error.message)
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
                <div className="signature-modes no-print">
                  <label className="checkbox-field" htmlFor={`physical-${signature.id}`}>
                    <input
                      id={`physical-${signature.id}`}
                      type="radio"
                      name={`mode-${signature.id}`}
                      checked={signature.mode === 'physical'}
                      onChange={() => onUpdate(signature.id, { mode: 'physical' })}
                    />
                    <span>Assinatura fisica</span>
                  </label>
                  <label className="checkbox-field" htmlFor={`digital-${signature.id}`}>
                    <input
                      id={`digital-${signature.id}`}
                      type="radio"
                      name={`mode-${signature.id}`}
                      checked={signature.mode === 'digital'}
                      onChange={() => onUpdate(signature.id, { mode: 'digital' })}
                    />
                    <span>Assinatura digital</span>
                  </label>
                </div>

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
                    placeholder="Nome *"
                    value={signature.name}
                    onChange={(event) => onUpdate(signature.id, { name: event.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Cargo ou funcao *"
                    value={signature.role}
                    onChange={(event) => onUpdate(signature.id, { role: event.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Numero de registro"
                    value={signature.registrationNumber}
                    onChange={(event) =>
                      onUpdate(signature.id, { registrationNumber: event.target.value })
                    }
                  />
                </div>
              </>
            )}

            <div className="signature-area">
              {signature.mode === 'digital' && signature.signatureImageDataUrl ? (
                <img
                  src={signature.signatureImageDataUrl}
                  alt={`Assinatura de ${signature.name || 'responsavel'}`}
                  className="signature-image"
                />
              ) : (
                <div className="signature-blank" />
              )}
            </div>
            <div className="signature-line" />
            <p className="signature-name">{signature.name || 'Nome do responsavel'}</p>
            <p className="signature-role">{signature.role || 'Cargo ou funcao'}</p>
            {signature.registrationNumber && (
              <p className="signature-registry">Registro: {signature.registrationNumber}</p>
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