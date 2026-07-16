import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface ExportPdfOptions {
  filename: string
  container: HTMLElement
  pageSelector?: string
}

export async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll<HTMLImageElement>('img'))

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete && image.naturalWidth > 0) {
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

async function waitForRenderFrames(): Promise<void> {
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )
}

export async function exportReportToPdf(options: ExportPdfOptions): Promise<void> {
  const { filename, container, pageSelector = '.report-page' } = options

  if ('fonts' in document) {
    await (document as Document & { fonts: FontFaceSet }).fonts.ready
  }

  await waitForImages(container)
  await waitForRenderFrames()

  const allPages = Array.from(container.querySelectorAll<HTMLElement>(pageSelector)).filter(
    (page) => !page.closest('.no-print-placeholder-page'),
  )

  const pageNodes = allPages.filter((page) => {
    const rect = page.getBoundingClientRect()
    const computed = window.getComputedStyle(page)
    const isHidden = computed.display === 'none' || computed.visibility === 'hidden'

    return !isHidden && rect.width > 0 && rect.height > 0 && page.childElementCount > 0
  })

  if (pageNodes.length === 0) {
    throw new Error('Nao foi possivel localizar paginas para exportacao.')
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  for (let index = 0; index < pageNodes.length; index += 1) {
    const page = pageNodes[index]
    const width = Math.ceil(page.offsetWidth)
    const height = Math.ceil(page.offsetHeight)

    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
      removeContainer: true,
    })

    const imageData = canvas.toDataURL('image/jpeg', 0.98)

    if (index > 0) {
      pdf.addPage('a4', 'portrait')
    }

    pdf.addImage(imageData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
  }

  pdf.save(filename)
}
