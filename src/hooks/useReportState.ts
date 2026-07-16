import { useEffect, useMemo, useState } from 'react'
import { readStorageJson, writeStorageJson } from '../utils/storageUtils'
import defaultHeaderImage from '../assets/cabecalho.jpg'
import defaultFooterImage from '../assets/rodape.png'
import type {
  Nomenclature,
  PersistedReport,
  ReportData,
  ReportGeneralInfo,
  ReportSignature,
  ReportHeaderFooter,
} from '../types/report'

const STORAGE_KEY = 'declaracoes-v1'

type ReportErrors = string[]

function createEmptySignature(): ReportSignature {
  return {
    id: crypto.randomUUID(),
    name: '',
    role: '',
    registrationNumber: '',
    signatureImageDataUrl: '',
    mode: 'physical',
  }
}

function getInitialState(): ReportData {
  return {
    nomenclature: 'Pagina',
    header: {
      imageDataUrl: defaultHeaderImage,
      widthPercent: 100,
      repeatMode: 'all',
    },
    footer: {
      imageDataUrl: defaultFooterImage,
      widthPercent: 100,
      repeatMode: 'all',
    },
    elaborationDateText: '',
    declarationText: '',
    generalInfo: {
      title: 'Declaração',
      subtitle: '',
      address: '',
      description: '',
      surveyDate: '',
      responsible: '',
      processNumber: '',
      repeatTitle: false,
    },
    photos: [],
    signatures: [createEmptySignature()],
  }
}

function createPersistedReport(report: ReportData): PersistedReport {
  return {
    nomenclature: report.nomenclature,
    elaborationDateText: report.elaborationDateText,
    declarationText: report.declarationText,
    headerImageRemoved: !report.header.imageDataUrl,
    footerImageRemoved: !report.footer.imageDataUrl,
    header: {
      imageDataUrl: report.header.imageDataUrl,
      widthPercent: report.header.widthPercent,
      repeatMode: report.header.repeatMode,
    },
    footer: {
      imageDataUrl: report.footer.imageDataUrl,
      widthPercent: report.footer.widthPercent,
      repeatMode: report.footer.repeatMode,
    },
    generalInfo: {
      ...report.generalInfo,
    },
    photos: report.photos.map(({ id, caption }) => ({ id, caption })),
    signatures: report.signatures.map(({ id, name, role, registrationNumber, mode }) => ({
      id,
      name,
      role,
      registrationNumber,
      mode,
    })),
  }
}

type UpdateGeneralInfoField = keyof ReportGeneralInfo
type HeaderFooterPatch = Partial<ReportHeaderFooter>
type UpdatePhotoPatch = Partial<ReportPhoto>
type UpdateSignaturePatch = Partial<ReportSignature>

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>
  }
  return {}
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function hasOwnKey(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key)
}

function loadReportData(): ReportData {
  const parsed = readStorageJson(STORAGE_KEY)
  if (!parsed) {
    return getInitialState()
  }

  const initial = getInitialState()
  const root = asRecord(parsed)
  const header = asRecord(root.header)
  const footer = asRecord(root.footer)
  const generalInfo = asRecord(root.generalInfo)

  const hasStoredHeaderImage = hasOwnKey(header, 'imageDataUrl')
  const hasStoredFooterImage = hasOwnKey(footer, 'imageDataUrl')
  const headerImageRemoved = asBoolean(root.headerImageRemoved, false)
  const footerImageRemoved = asBoolean(root.footerImageRemoved, false)

  const normalizedHeaderImage = headerImageRemoved
    ? ''
    : hasStoredHeaderImage
      ? asString(header.imageDataUrl, '')
      : defaultHeaderImage

  const normalizedFooterImage = footerImageRemoved
    ? ''
    : hasStoredFooterImage
      ? asString(footer.imageDataUrl, '')
      : defaultFooterImage

  const loadedPhotos = Array.isArray(root.photos) ? root.photos : []
  const loadedSignatures = Array.isArray(root.signatures) ? root.signatures : []

  const normalizedHeaderWidth = Math.max(
    20,
    Math.min(100, asNumber(header.widthPercent ?? header.height, 100)),
  )

  const normalizedFooterWidth = Math.max(
    20,
    Math.min(100, asNumber(footer.widthPercent, 100)),
  )

  const nextPhotos = loadedPhotos.length > 0
    ? loadedPhotos.map((photoValue) => {
        const photo = asRecord(photoValue)
        return {
          id: asString(photo.id, crypto.randomUUID()),
          caption: asString(photo.caption),
          image: null,
        }
      })
    : []

  const slicedSignatures = loadedSignatures.slice(0, 4)
  const nextSignatures = slicedSignatures.length > 0
    ? slicedSignatures.map((signatureValue) => {
      const signature = asRecord(signatureValue)
      return {
        id: asString(signature.id, crypto.randomUUID()),
        name: asString(signature.name),
        role: asString(signature.role),
        registrationNumber: asString(signature.registrationNumber),
        signatureImageDataUrl: asString(signature.signatureImageDataUrl),
        mode: signature.mode === 'digital' ? 'digital' : 'physical',
      }
    })
    : [createEmptySignature()]

  return {
    nomenclature: root.nomenclature === 'Folha' ? 'Folha' : initial.nomenclature,
    header: {
      imageDataUrl: normalizedHeaderImage,
      widthPercent: normalizedHeaderWidth,
      repeatMode: header.repeatMode === 'first' ? 'first' : 'all',
    },
    footer: {
      imageDataUrl: normalizedFooterImage,
      widthPercent: normalizedFooterWidth,
      repeatMode: footer.repeatMode === 'first' ? 'first' : 'all',
    },
    elaborationDateText: asString(root.elaborationDateText),
    declarationText: asString(root.declarationText ?? root.declarationTextLegacy),
    generalInfo: {
      title: asString(generalInfo.title),
      subtitle: asString(generalInfo.subtitle),
      address: asString(generalInfo.address),
      description: asString(generalInfo.description),
      surveyDate: asString(generalInfo.surveyDate),
      responsible: asString(generalInfo.responsible),
      processNumber: asString(generalInfo.processNumber),
      repeatTitle: asBoolean(generalInfo.repeatTitle),
    },
    photos: nextPhotos,
    signatures: nextSignatures,
  }
}

export function useReportState() {
  const [report, setReport] = useState<ReportData>(() => loadReportData())

  const [errors, setErrors] = useState<ReportErrors>([])

  useEffect(() => {
    const dataToSave = createPersistedReport(report)
    writeStorageJson(STORAGE_KEY, dataToSave)
  }, [report])

  const totalPages = 1

  const updateGeneralInfo = (field: UpdateGeneralInfoField, value: string | boolean) => {
    setReport((prev) => ({
      ...prev,
      generalInfo: {
        ...prev.generalInfo,
        [field]: value,
      },
    }))
  }

  const updateElaborationDateText = (value: string) => {
    setReport((prev) => ({
      ...prev,
      elaborationDateText: value,
    }))
  }

  const updateDeclarationText = (value: string) => {
    setReport((prev) => ({
      ...prev,
      declarationText: value,
    }))
  }

  const updateHeader = (patch: HeaderFooterPatch) => {
    setReport((prev) => ({ ...prev, header: { ...prev.header, ...patch } }))
  }

  const updateFooter = (patch: HeaderFooterPatch) => {
    setReport((prev) => ({ ...prev, footer: { ...prev.footer, ...patch } }))
  }

  const updateNomenclature = (value: Nomenclature) => {
    setReport((prev) => ({
      ...prev,
      nomenclature: value === 'Folha' ? 'Folha' : 'Pagina',
    }))
  }

  const addSignature = () => {
    setReport((prev) => {
      if (prev.signatures.length >= 4) return prev
      return { ...prev, signatures: [...prev.signatures, createEmptySignature()] }
    })
  }

  const updateSignature = (signatureId: string, patch: UpdateSignaturePatch) => {
    setReport((prev) => ({
      ...prev,
      signatures: prev.signatures.map((item) =>
        item.id === signatureId ? { ...item, ...patch } : item,
      ),
    }))
  }

  const removeSignature = (signatureId: string) => {
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
      nextErrors.push('Preencha o titulo da declaracao.')
    }
    if (!report.generalInfo.address.trim()) {
      nextErrors.push('Preencha o endereco.')
    }
    if (!report.declarationText.trim()) {
      nextErrors.push('Preencha o texto da declaracao.')
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
    totalPages,
    setErrors,
    updateElaborationDateText,
    updateDeclarationText,
    updateGeneralInfo,
    updateHeader,
    updateFooter,
    updateNomenclature,
    addSignature,
    updateSignature,
    removeSignature,
    resetReport,
    validateBeforeExport,
  }
}
