import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'relatorio-fotografico-v1'

function createEmptyPhoto() {
  return {
    id: crypto.randomUUID(),
    caption: '',
    imageDataUrl: '',
    imageFit: 'contain',
  }
}

function createEmptySignature() {
  return {
    id: crypto.randomUUID(),
    name: '',
    role: '',
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
      height: 72,
      repeatMode: 'all',
    },
    footer: {
      imageDataUrl: '',
      widthPercent: 80,
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
    photos: [createEmptyPhoto(), createEmptyPhoto()],
    signatures: [createEmptySignature()],
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

      if (!Array.isArray(merged.photos) || merged.photos.length === 0) {
        merged.photos = [createEmptyPhoto(), createEmptyPhoto()]
      }
      merged.photos = merged.photos.map((photo) => ({
        id: photo.id || crypto.randomUUID(),
        caption: photo.caption || '',
        imageDataUrl: photo.imageDataUrl || '',
        imageFit: photo.imageFit === 'cover' ? 'cover' : 'contain',
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
        role: signature.role || '',
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(report))
  }, [report])

  const filledPhotos = useMemo(
    () => report.photos.filter((photo) => Boolean(photo.imageDataUrl)),
    [report.photos],
  )

  const pagesForPhotos = Math.ceil(filledPhotos.length / 2)
  const totalPages = pagesForPhotos + 1

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
      photos: [...prev.photos, createEmptyPhoto()],
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
      if (!signature.role.trim()) {
        nextErrors.push(`Preencha o cargo ou funcao do responsavel ${index + 1}.`)
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
