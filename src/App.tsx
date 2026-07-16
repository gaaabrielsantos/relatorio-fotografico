import { useEffect, useMemo, useRef, useState } from 'react'
import A4Page from './components/A4Page'
import PhotoPage from './components/PhotoPage'
import Sidebar from './components/Sidebar'
import SignaturePage from './components/SignaturePage'
import { useReportState } from './hooks/useReportState'
import { createPdfFilename } from './utils/filenameUtils'
import { exportReportToPdf } from './utils/exportPdf'
import type { ReportPhoto } from './types/report'
import './styles/report.css'
import './styles/print.css'
import './styles/pdf.css'

const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

type ReportPage =
  | { type: 'draft-photo-placeholder' }
  | {
      type: 'photos'
      items: ReportPhoto[]
      photoPageIndex: number
      embedSignature: boolean
    }
  | { type: 'signatures' }

function chunkPhotos(photos: ReportPhoto[]): ReportPhoto[][] {
  const chunks: ReportPhoto[][] = []
  for (let i = 0; i < photos.length; i += 2) {
    chunks.push(photos.slice(i, i + 2))
  }
  return chunks
}

function App() {
  const {
    report,
    errors,
    totalPages,
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
  } = useReportState()

  const [uiError, setUiError] = useState<string>('')
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [previewScale, setPreviewScale] = useState(1)
  const previewPanelRef = useRef<HTMLElement | null>(null)
  const previewPagesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!report.generalInfo.title.trim()) {
      document.title = 'Relatorio Fotografico'
      return
    }
    document.title = `Relatorio Fotografico - ${report.generalInfo.title}`
  }, [report.generalInfo.title])

  useEffect(() => {
    const panel = previewPanelRef.current
    if (!panel) return

    const recalculateScale = () => {
      const availableWidth = panel.clientWidth - 64
      const safeWidth = Math.max(availableWidth, 240)
      const nextScale = Math.min(1, safeWidth / A4_WIDTH_PX)
      const normalizedScale = Number(nextScale.toFixed(4))
      setPreviewScale((prev) => (Math.abs(prev - normalizedScale) > 0.0001 ? normalizedScale : prev))
    }

    recalculateScale()

    const observer = new ResizeObserver(recalculateScale)
    observer.observe(panel)
    window.addEventListener('resize', recalculateScale)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', recalculateScale)
    }
  }, [])

  const validPhotos = useMemo(
    () => report.photos.filter((photo) => Boolean(photo?.image)),
    [report.photos],
  )

  const photoPages = useMemo(() => chunkPhotos(validPhotos), [validPhotos])
  const shouldShowDraftPhotoPage = useMemo(() => validPhotos.length === 0, [validPhotos.length])

  const reportPages = useMemo(() => {
    const pages: ReportPage[] = []
    const hasPhotos = photoPages.length > 0
    const lastPhotoPage = photoPages.at(-1)
    const shouldEmbedSignatureInLastPhotoPage = Boolean(hasPhotos && lastPhotoPage?.length === 1)

    if (!hasPhotos && shouldShowDraftPhotoPage) {
      pages.push({ type: 'draft-photo-placeholder' })
    }

    photoPages.forEach((items = [], index) => {
      const isLastPhotoPage = index === photoPages.length - 1
      pages.push({
        type: 'photos',
        items,
        photoPageIndex: index,
        embedSignature: shouldEmbedSignatureInLastPhotoPage && isLastPhotoPage,
      })
    })

    if (!hasPhotos || !shouldEmbedSignatureInLastPhotoPage) {
      pages.push({ type: 'signatures' })
    }

    return pages
  }, [photoPages, shouldShowDraftPhotoPage])

  const numberedPages = useMemo(
    () => reportPages.filter((page) => page.type !== 'draft-photo-placeholder'),
    [reportPages],
  )

  const getPageLabel = (page: ReportPage, pageIndex: number) => {
    if (page.type === 'draft-photo-placeholder') {
      return ''
    }

    const numberedIndex = reportPages
      .slice(0, pageIndex + 1)
      .filter((item) => item.type !== 'draft-photo-placeholder').length

    const totalRenderedPages = numberedPages.length || totalPages
    return `${report.nomenclature} ${numberedIndex}/${totalRenderedPages}`
  }

  const handleReset = () => {
    const confirmed = window.confirm('Deseja iniciar um novo relatorio? Os dados atuais serao apagados.')
    if (!confirmed) return
    resetReport()
    setUiError('')
  }

  const handleExportPdf = async () => {
    if (isExporting) return

    validateBeforeExport()

    const previewElement = previewPagesRef.current
    if (!previewElement) {
      setUiError('Nao foi possivel localizar o relatorio para exportacao.')
      return
    }

    setUiError('')
    setIsExporting(true)
    const fileName = createPdfFilename(report.generalInfo.title)

    try {
      await exportReportToPdf({
        previewElement,
        filename: fileName,
      })
    } catch {
      try {
        window.print()
      } catch {
        setUiError('Nao foi possivel exportar o PDF. Tente novamente.')
      }
    } finally {
      setIsExporting(false)
    }
  }

  const handleError = (message: string) => {
    setUiError(message)
    if (!message) {
      setErrors([])
    }
  }

  return (
    <div className="app-shell">
      <header className="app-topbar no-print">
        <h2>Relatorio Fotografico</h2>
      </header>

      <main className="app-content main-layout">
        <Sidebar
          report={report}
          errors={uiError ? [uiError, ...errors] : errors}
          onGeneralInfoChange={updateGeneralInfo}
          onHeaderUpdate={updateHeader}
          onFooterUpdate={updateFooter}
          onAddPhoto={addPhoto}
          onUpdatePhoto={updatePhoto}
          onRemovePhoto={removePhoto}
          onMovePhoto={movePhoto}
          onAddSignature={addSignature}
          onUpdateSignature={updateSignature}
          onRemoveSignature={removeSignature}
          onNomenclatureChange={updateNomenclature}
          onReset={handleReset}
          onExport={handleExportPdf}
          isExporting={isExporting}
          onError={handleError}
        />

        <section className="report-preview preview-panel preview" id="report-preview" ref={previewPanelRef}>
          <div className="preview-content report-pages" ref={previewPagesRef}>
            {reportPages.map((page, pageIndex) => {
              const firstPage = pageIndex === 0
              const showHeader = report.header.repeatMode === 'all' || firstPage
              const showFooter = report.footer.repeatMode === 'all' || firstPage

              return (
                <div
                  className={`page-preview-wrapper${page.type === 'draft-photo-placeholder' ? ' no-print-placeholder-page' : ''}`}
                  style={{
                    width: `${A4_WIDTH_PX * previewScale}px`,
                    height: `${A4_HEIGHT_PX * previewScale}px`,
                  }}
                  key={`${page.type}-${pageIndex}`}
                >
                  <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
                    <A4Page
                      headerImage={report.header.imageDataUrl}
                      headerWidthPercent={report.header.widthPercent}
                      showHeader={showHeader}
                      footerImage={report.footer.imageDataUrl}
                      footerWidthPercent={report.footer.widthPercent}
                      showFooter={showFooter}
                      pageLabel={getPageLabel(page, pageIndex)}
                    >
                      {page.type === 'photos' && (
                        <PhotoPage
                          photos={page.items}
                          allPhotos={validPhotos}
                          showGeneralInfo={page.photoPageIndex === 0}
                          showRepeatedTitle={page.photoPageIndex > 0 && report.generalInfo.repeatTitle}
                          generalInfo={report.generalInfo}
                          signatures={report.signatures}
                          embedSignature={Boolean(page.embedSignature)}
                        />
                      )}
                      {page.type === 'draft-photo-placeholder' && (
                        <PhotoPage
                          photos={[]}
                          allPhotos={[]}
                          showGeneralInfo
                          showRepeatedTitle={false}
                          generalInfo={report.generalInfo}
                          signatures={[]}
                          embedSignature={false}
                          watermarkPhotoPlaceholder
                        />
                      )}
                      {page.type === 'signatures' && <SignaturePage signatures={report.signatures} />}
                    </A4Page>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
