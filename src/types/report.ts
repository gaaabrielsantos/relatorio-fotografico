export type RepeatMode = 'all' | 'first'

export type Nomenclature = 'Pagina' | 'Folha'

export type SignatureMode = 'physical' | 'digital'

export type PhotoOrientation = 'portrait' | 'landscape'

export interface ReportPhoto {
  id: string
  caption: string
  image: string | null
  orientation: PhotoOrientation
}

export interface ReportSignature {
  id: string
  name: string
  role: string
  registrationNumber: string
  signatureImageDataUrl: string
  mode: SignatureMode
}

export interface ReportGeneralInfo {
  title: string
  description: string
  repeatTitle: boolean
}

export interface ReportHeaderFooter {
  imageDataUrl: string
  widthPercent: number
  repeatMode: RepeatMode
}

export interface ReportData {
  nomenclature: Nomenclature
  header: ReportHeaderFooter
  footer: ReportHeaderFooter
  elaborationDateText: string
  generalInfo: ReportGeneralInfo
  photos: ReportPhoto[]
  signatures: ReportSignature[]
}

export interface PersistedReport {
  nomenclature: Nomenclature
  elaborationDateText?: string
  headerImageRemoved?: boolean
  footerImageRemoved?: boolean
  header: Pick<ReportHeaderFooter, 'imageDataUrl' | 'widthPercent' | 'repeatMode'>
  footer: Pick<ReportHeaderFooter, 'imageDataUrl' | 'widthPercent' | 'repeatMode'>
  generalInfo: ReportGeneralInfo
  photos: Array<Pick<ReportPhoto, 'id' | 'caption' | 'orientation'>>
  signatures: Array<
    Pick<ReportSignature, 'id' | 'name' | 'role' | 'registrationNumber' | 'mode'>
  >
}

export interface CompressedImageResult {
  dataUrl: string
  contentType: string
  name: string
  originalSize: number
  compressedSize: number
  compressed: boolean
}
