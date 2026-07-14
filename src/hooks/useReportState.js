import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'relatorio-fotografico-v1'

function createPhoto() {
  return {
    id: crypto.randomUUID(),
    caption: '',
    image: null,
  }
}

function createEmptySignature() {
  return {
    id: crypto.randomUUID(),
    name: '',
    registrationNumber: '',
    signatureImageDataUrl: '',
    mode: 'physical',
  }
}

function getInitialState() {
  return {
    nomenclature: 'Pagina',
    header: {
      imageDataUrl: '',
      widthPercent: 100,
      repeatMode: 'all',
    },
    footer: {
      imageDataUrl: '',
      widthPercent: 100,
      repeatMode: 'all',
    },
    generalInfo: {
      title: '',
      subtitle: '',
      address: '',
      description: '',
      surveyDate: '',
      responsible: '',
      processNumber: '',
      repeatTitle: false,
    },
    photos: [createPhoto(), createPhoto()],
    signatures: [createEmptySignature()],
  }
}

function createPersistedReport(report) {
  return {
    nomenclature: report.nomenclature,
    header: {
      widthPercent: report.header.widthPercent,
      repeatMode: report.header.repeatMode,
    },
    footer: {
      widthPercent: report.footer.widthPercent,
      repeatMode: report.footer.repeatMode,
    },
    generalInfo: {
      ...report.generalInfo,
    },
    photos: report.photos.map(({ id, caption }) => ({ id, caption })),
    signatures: report.signatures.map(({ id, name, registrationNumber, mode }) => ({
      id,
      name,
      registrationNumber,
      mode,
    })),
  }
}

export function useReportState() {
  const [report, setReport] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return getInitialState()
      const parsed = JSON.parse(raw)
      const initial = getInitialState()
      const merged = {
        ...initial,
        ...parsed,
        header: { ...initial.header, ...(parsed.header || {}) },
        footer: { ...initial.footer, ...(parsed.footer || {}) },
        generalInfo: { ...initial.generalInfo, ...(parsed.generalInfo || {}) },
      }

      merged.header.widthPercent = Math.max(
        20,
        Math.min(
          100,
          Number(
            merged.header?.widthPercent
              ?? merged.header?.height
              ?? 100,
          ),
        ),
      )

      merged.footer.widthPercent = Math.max(
        20,
        Math.min(100, Number(merged.footer?.widthPercent ?? 100)),
      )

      if (!Array.isArray(merged.photos) || merged.photos.length === 0) {
        merged.photos = [createPhoto(), createPhoto()]
      }
      merged.photos = merged.photos.map((photo) => ({
        id: photo.id || crypto.randomUUID(),
        caption: photo.caption || '',
        image: null,
      }))
      if (!Array.isArray(merged.signatures) || merged.signatures.length === 0) {
        merged.signatures = [createEmptySignature()]
      }
      if (merged.signatures.length > 4) {
        merged.signatures = merged.signatures.slice(0, 4)
      }
      merged.signatures = merged.signatures.map((signature) => ({
        id: signature.id || crypto.randomUUID(),
        name: signature.name || '',
        registrationNumber: signature.registrationNumber || '',
        signatureImageDataUrl: signature.signatureImageDataUrl || '',
        mode: signature.mode === 'digital' ? 'digital' : 'physical',
      }))
      return merged
    } catch {
      return getInitialState()
    }
  })

  const [errors, setErrors] = useState([])

  useEffect(() => {
    const dataToSave = createPersistedReport(report)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    } catch (error) {
      console.error('Erro ao salvar dados:', error)
    }
  }, [report])

  const filledPhotos = useMemo(
    () => report.photos.filter((photo) => Boolean(photo?.image)),
    [report.photos],
  )

  const pagesForPhotos = Math.ceil(filledPhotos.length / 2)
  const lastPhotoPageSize = filledPhotos.length % 2
  const hasPhotos = filledPhotos.length > 0
  const hasEmbeddedSignaturePage = hasPhotos && lastPhotoPageSize === 1
  const totalPages = pagesForPhotos + (hasEmbeddedSignaturePage ? 0 : 1)

  const updateGeneralInfo = (field, value) => {
    setReport((prev) => ({
      ...prev,
      generalInfo: {
        ...prev.generalInfo,
        [field]: value,
      },
    }))
  }

  const updateHeader = (patch) => {
    setReport((prev) => ({ ...prev, header: { ...prev.header, ...patch } }))
  }

  const updateFooter = (patch) => {
    setReport((prev) => ({ ...prev, footer: { ...prev.footer, ...patch } }))
  }

  const updateNomenclature = (value) => {
    setReport((prev) => ({
      ...prev,
      nomenclature: value === 'Folha' ? 'Folha' : 'Pagina',
    }))
  }

  const addPhoto = () => {
    setReport((prev) => ({
      ...prev,
      photos: [...prev.photos, createPhoto()],
    }))
  }

  const updatePhoto = (photoId, patch) => {
    setReport((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) =>
        photo.id === photoId ? { ...photo, ...patch } : photo,
      ),
    }))
  }

  const removePhoto = (photoId) => {
    setReport((prev) => {
      const next = prev.photos.filter((photo) => photo.id !== photoId)
      return { ...prev, photos: next }
    })
  }

  const movePhoto = (photoId, direction) => {
    setReport((prev) => {
      const idx = prev.photos.findIndex((photo) => photo.id === photoId)
      if (idx < 0) return prev
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= prev.photos.length) return prev
      const photos = [...prev.photos]
      const [item] = photos.splice(idx, 1)
      photos.splice(targetIdx, 0, item)
      return { ...prev, photos }
    })
  }

  const addSignature = () => {
    setReport((prev) => {
      if (prev.signatures.length >= 4) return prev
      return { ...prev, signatures: [...prev.signatures, createEmptySignature()] }
    })
  }

  const updateSignature = (signatureId, patch) => {
    setReport((prev) => ({
      ...prev,
      signatures: prev.signatures.map((item) =>
        item.id === signatureId ? { ...item, ...patch } : item,
      ),
    }))
  }

  const removeSignature = (signatureId) => {
    setReport((prev) => {
      if (prev.signatures.length <= 1) return prev
      return {
        ...prev,
        signatures: prev.signatures.filter((item) => item.id !== signatureId),
      }
    })
  }

  const resetReport = () => {
    setReport(getInitialState())
    setErrors([])
  }

  const validateBeforeExport = () => {
    const nextErrors = []

    if (!report.generalInfo.title.trim()) {
      nextErrors.push('Preencha o titulo do relatorio.')
    }
    if (!report.generalInfo.address.trim()) {
      nextErrors.push('Preencha o endereco.')
    }
    if (filledPhotos.length === 0) {
      nextErrors.push('Insira ao menos uma fotografia com imagem.')
    }
    if (report.signatures.length === 0) {
      nextErrors.push('Insira ao menos um responsavel para assinatura.')
    }

    report.signatures.forEach((signature, index) => {
      if (!signature.name.trim()) {
        nextErrors.push(`Preencha o nome do responsavel ${index + 1}.`)
      }
    })

    setErrors(nextErrors)
    return nextErrors.length === 0
  }

  return {
    report,
    errors,
    pagesForPhotos,
    totalPages,
    filledPhotos,
    setErrors,
    updateGeneralInfo,
    updateHeader,
    updateFooter,
    updateNomenclature,
    addPhoto,
    updatePhoto,
    removePhoto,
    movePhoto,
    addSignature,
    updateSignature,
    removeSignature,
    resetReport,
    validateBeforeExport,
  }
}
