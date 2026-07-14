import html2pdf from 'html2pdf.js'

export interface ExportPdfOptions {
  filename: string
  element: HTMLElement
}

export async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll<HTMLImageElement>('img'))

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve()
            return
          }

          const onLoad = () => {
            image.removeEventListener('load', onLoad)
            image.removeEventListener('error', onError)
            resolve()
          }

          const onError = () => {
            image.removeEventListener('load', onLoad)
            image.removeEventListener('error', onError)
            resolve()
          }

          image.addEventListener('load', onLoad)
          image.addEventListener('error', onError)
        }),
    ),
  )
}

export async function exportReportToPdf(options: ExportPdfOptions): Promise<void> {
  const { filename, element } = options
  const pageNodes = Array.from(element.querySelectorAll<HTMLElement>('.report-page')).filter(
    (page) => !page.closest('.no-print-placeholder-page'),
  )

  if (pageNodes.length === 0) {
    throw new Error('Nao foi possivel localizar paginas para exportacao.')
  }

  const exportOptions = {
    margin: 0,
    filename,
    image: {
      type: 'jpeg',
      quality: 0.98,
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: {
      mode: ['css', 'legacy'] as const,
      before: '.report-page:not(:first-child)',
      avoid: ['.photo-section', '.signature-card', '.page-header', '.page-footer'],
    },
  }

  await html2pdf().set(exportOptions).from(element).save()
}
