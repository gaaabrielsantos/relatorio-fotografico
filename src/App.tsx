import { useEffect, useMemo, useRef, useState } from 'react'
import A4Page from './components/A4Page'
import PhotoPage from './components/PhotoPage'
import Sidebar from './components/Sidebar'
import { useReportState } from './hooks/useReportState'
import { createPdfFilename } from './utils/filenameUtils'
import { exportReportToPdf } from './utils/exportPdf'
import type { ReportData } from './types/report'
import './styles/report.css'
import './styles/print.css'
import './styles/pdf.css'

const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

type ReportPage =
  | {
      type: 'declaration'
      pageIndex: number
      showGeneralInfo: boolean
      showRepeatedTitle: boolean
      showDateAndSignatures: boolean
      text: string
    }

type MeasureOptions = {
  declarationText: string
  generalInfo: ReportData['generalInfo']
  signatures: ReportData['signatures']
  elaborationDateText: string
  showGeneralInfo: boolean
  showRepeatedTitle: boolean
  showDateAndSignatures: boolean
}

function tokenizeDeclarationText(text: string): string[] {
  return text.replace(/\r\n/g, '\n').match(/\s+|\S+/g) ?? []
}

function joinTokens(tokens: string[]): string {
  return tokens.join('')
}

function createMeasureNode(options: MeasureOptions, content: string): HTMLElement {
  const article = document.createElement('article')
  article.className = 'a4-page report-page avoid-break'

  const body = document.createElement('div')
  body.className = 'page-body'

  if (options.showGeneralInfo) {
    const info = document.createElement('section')
    info.className = 'general-info-box avoid-break'

    const title = document.createElement('h2')
    title.textContent = options.generalInfo.title.trim() || 'Declaração'
    info.appendChild(title)

    if (options.generalInfo.subtitle.trim()) {
      const subtitle = document.createElement('h3')
      subtitle.textContent = options.generalInfo.subtitle
      info.appendChild(subtitle)
    }

    const grid = document.createElement('div')
    grid.className = 'general-info-grid'
    ;[
      ['Endereco', options.generalInfo.address, 'Endereco do local'],
      ['Data da vistoria', options.generalInfo.surveyDate, 'Data da vistoria'],
      ['Responsavel', options.generalInfo.responsible, 'Nome do responsavel'],
      ['Processo/Convenio', options.generalInfo.processNumber, 'Numero do processo ou convenio'],
    ].forEach(([label, value, placeholder]) => {
      const paragraph = document.createElement('p')
      const strong = document.createElement('strong')
      strong.textContent = `${label}: `
      const span = document.createElement('span')
      span.textContent = value.trim() || placeholder
      paragraph.appendChild(strong)
      paragraph.appendChild(span)
      grid.appendChild(paragraph)
    })
    info.appendChild(grid)

    const description = document.createElement('p')
    description.className = 'general-info-description'
    description.textContent = options.generalInfo.description.trim() || 'Descricao do servico ou vistoria'
    info.appendChild(description)

    body.appendChild(info)
  }

  if (!options.showGeneralInfo && options.showRepeatedTitle) {
    const repeatedTitle = document.createElement('section')
    repeatedTitle.className = 'repeated-title-box avoid-break'
    const heading = document.createElement('h2')
    heading.textContent = options.generalInfo.title.trim() || 'Declaração'
    repeatedTitle.appendChild(heading)
    body.appendChild(repeatedTitle)
  }

  const declaration = document.createElement('section')
  declaration.className = 'declaration-content'
  if (content.trim()) {
    const bodyText = document.createElement('div')
    bodyText.className = 'declaration-body'
    bodyText.textContent = content
    declaration.appendChild(bodyText)
  } else {
    const placeholder = document.createElement('p')
    placeholder.className = 'declaration-placeholder no-print'
    placeholder.textContent = 'Digite o conteúdo da declaração no menu lateral.'
    declaration.appendChild(placeholder)
  }
  body.appendChild(declaration)

  if (options.showDateAndSignatures) {
    if (options.elaborationDateText.trim()) {
      const dateSection = document.createElement('section')
      dateSection.className = 'elaboration-date-section avoid-break'
      const paragraph = document.createElement('p')
      paragraph.textContent = options.elaborationDateText
      dateSection.appendChild(paragraph)
      body.appendChild(dateSection)
    }

    const signaturePage = document.createElement('section')
    signaturePage.className = 'signature-page-content'
    const grid = document.createElement('div')
    grid.className = `signatures-grid signatures-${options.signatures.length}`

    options.signatures.forEach((signature) => {
      const card = document.createElement('article')
      card.className = 'signature-card avoid-break'

      const area = document.createElement('div')
      area.className = 'signature-area'
      const blank = document.createElement('div')
      blank.className = 'signature-blank'
      area.appendChild(blank)
      card.appendChild(area)

      const line = document.createElement('div')
      line.className = 'signature-line'
      card.appendChild(line)

      const details = document.createElement('div')
      details.className = 'signature-details'

      const name = document.createElement('p')
      name.className = 'signature-name'
      name.textContent = signature.name || 'Nome do responsável'
      details.appendChild(name)

      if (signature.role) {
        const role = document.createElement('p')
        role.className = 'signature-role'
        role.textContent = signature.role
        details.appendChild(role)
      }

      if (signature.registrationNumber) {
        const registry = document.createElement('p')
        registry.className = 'signature-registry'
        registry.textContent = signature.registrationNumber
        details.appendChild(registry)
      }

      card.appendChild(details)
      grid.appendChild(card)
    })

    signaturePage.appendChild(grid)
    body.appendChild(signaturePage)
  }

  article.appendChild(body)
  return article
}

function pageFits(options: MeasureOptions, content: string): boolean {
  const sandbox = document.createElement('div')
  sandbox.style.position = 'absolute'
  sandbox.style.left = '-10000px'
  sandbox.style.top = '0'
  sandbox.style.width = `${A4_WIDTH_PX}px`
  sandbox.style.height = 'auto'
  sandbox.style.visibility = 'hidden'
  sandbox.style.pointerEvents = 'none'
  sandbox.style.overflow = 'hidden'
  document.body.appendChild(sandbox)

  try {
    const node = createMeasureNode(options, content)
    sandbox.appendChild(node)
    const body = node.querySelector('.page-body') as HTMLElement | null
    return Boolean(body && body.scrollHeight <= body.clientHeight)
  } finally {
    sandbox.remove()
  }
}

function splitDeclarationIntoPages(options: MeasureOptions): Array<{ text: string; showGeneralInfo: boolean; showRepeatedTitle: boolean; showDateAndSignatures: boolean }> {
  const tokens = tokenizeDeclarationText(options.declarationText)
  if (tokens.length === 0) {
    return [
      {
        text: '',
        showGeneralInfo: true,
        showRepeatedTitle: false,
        showDateAndSignatures: true,
      },
    ]
  }

  const pages: Array<{ text: string; showGeneralInfo: boolean; showRepeatedTitle: boolean; showDateAndSignatures: boolean }> = []
  let startIndex = 0
  let pageIndex = 0

  while (startIndex < tokens.length) {
    const remaining = tokens.slice(startIndex)
    const showGeneralInfo = pageIndex === 0
    const showRepeatedTitle = pageIndex > 0 && options.showRepeatedTitle
    const fullText = joinTokens(remaining)

    const fitsWithSignature = pageFits(
      {
        ...options,
        showGeneralInfo,
        showRepeatedTitle,
        showDateAndSignatures: true,
      },
      fullText,
    )

    if (fitsWithSignature) {
      pages.push({ text: fullText, showGeneralInfo, showRepeatedTitle, showDateAndSignatures: true })
      return pages
    }

    let low = 1
    let high = remaining.length
    let best = 1

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const candidate = joinTokens(remaining.slice(0, mid))
      const fits = pageFits(
        {
          ...options,
          showGeneralInfo,
          showRepeatedTitle,
          showDateAndSignatures: false,
        },
        candidate,
      )

      if (fits) {
        best = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    pages.push({
      text: joinTokens(remaining.slice(0, best)),
      showGeneralInfo,
      showRepeatedTitle,
      showDateAndSignatures: false,
    })
    startIndex += best
    pageIndex += 1
  }

  const lastPage = pages.at(-1)
  if (lastPage) {
    const lastPageFitsWithSignature = pageFits(
      {
        ...options,
        showGeneralInfo: lastPage.showGeneralInfo,
        showRepeatedTitle: lastPage.showRepeatedTitle,
        showDateAndSignatures: true,
      },
      lastPage.text,
    )

    if (lastPageFitsWithSignature) {
      lastPage.showDateAndSignatures = true
    } else {
      pages.push({
        text: '',
        showGeneralInfo: false,
        showRepeatedTitle: false,
        showDateAndSignatures: true,
      })
    }
  }

  return pages
}

function App() {
  const {
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
  } = useReportState()

  const [uiError, setUiError] = useState<string>('')
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [previewScale, setPreviewScale] = useState(1)
  const previewPanelRef = useRef<HTMLElement | null>(null)
  const previewPagesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!report.generalInfo.title.trim()) {
      document.title = 'Declarações'
      return
    }
    document.title = `Declarações - ${report.generalInfo.title}`
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

  const reportPages = useMemo(() => {
    const declarationPages = splitDeclarationIntoPages({
      declarationText: report.declarationText,
      generalInfo: report.generalInfo,
      signatures: report.signatures,
      elaborationDateText: report.elaborationDateText,
      showGeneralInfo: true,
      showRepeatedTitle: report.generalInfo.repeatTitle,
      showDateAndSignatures: true,
    })

    return declarationPages.map((page, pageIndex) => ({
      type: 'declaration' as const,
      pageIndex,
      showGeneralInfo: page.showGeneralInfo,
      showRepeatedTitle: page.showRepeatedTitle,
      showDateAndSignatures: page.showDateAndSignatures,
      text: page.text,
    }))
  }, [report.declarationText, report.elaborationDateText, report.generalInfo, report.signatures])

  const getPageLabel = (page: ReportPage, pageIndex: number) => {
    const numberedIndex = pageIndex + 1

    const totalRenderedPages = reportPages.length || 1
    return `${report.nomenclature} ${numberedIndex}/${totalRenderedPages}`
  }

  const handleReset = () => {
    const confirmed = window.confirm('Deseja iniciar uma nova declaracao? Os dados atuais serao apagados.')
    if (!confirmed) return
    resetReport()
    setUiError('')
  }

  const handleExportPdf = async () => {
    if (isExporting) return

    validateBeforeExport()

    const previewElement = previewPagesRef.current
    if (!previewElement) {
      setUiError('Nao foi possivel localizar a declaracao para exportacao.')
      return
    }

    setUiError('')
    setIsExporting(true)
    const fileName = createPdfFilename(report.generalInfo.title)

    try {
      await exportReportToPdf({
        container: previewElement,
        pageSelector: '.report-page',
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
        <h2>Declarações</h2>
      </header>

      <main className="app-content main-layout">
        <Sidebar
          report={report}
          errors={uiError ? [uiError, ...errors] : errors}
          onElaborationDateChange={updateElaborationDateText}
          onDeclarationTextChange={updateDeclarationText}
          onGeneralInfoChange={updateGeneralInfo}
          onHeaderUpdate={updateHeader}
          onFooterUpdate={updateFooter}
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
                  className="page-preview-wrapper"
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
                      {page.type === 'declaration' && (
                        <PhotoPage
                          showGeneralInfo={page.showGeneralInfo}
                          showRepeatedTitle={page.showRepeatedTitle}
                          generalInfo={report.generalInfo}
                          elaborationDateText={report.elaborationDateText}
                          declarationText={page.text}
                          signatures={report.signatures}
                          showDateAndSignatures={page.showDateAndSignatures}
                        />
                      )}
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
