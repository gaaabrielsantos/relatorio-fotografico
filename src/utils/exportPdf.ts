import html2pdf from 'html2pdf.js'

export interface ExportPdfOptions {
  filename: string
  container: HTMLElement
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

export async function exportReportToPdf({ filename, container }: ExportPdfOptions): Promise<void> {
  if ('fonts' in document) {
    await (document as Document & { fonts: FontFaceSet }).fonts.ready
  }

  await waitForImages(container)
  await waitForRenderFrames()

  const pageNodes = Array.from(container.querySelectorAll<HTMLElement>('.a4-page')).filter(
    (page) => !page.closest('.no-print-placeholder-page'),
  )
  if (pageNodes.length === 0) {
    throw new Error('Nao foi possivel localizar paginas para exportacao.')
  }
  if (!container.id) {
    throw new Error('O elemento do relatorio precisa ter um ID para exportacao.')
  }

  const options = {
    margin: 0,
    filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
      scrollX: 0,
      onclone: (clonedDocument: Document) => {
        const clonedContainer = clonedDocument.getElementById(container.id)
        clonedContainer?.classList.add('pdf-export-mode')
        clonedContainer
          ?.querySelectorAll('.no-print-placeholder-page')
          .forEach((placeholder) => placeholder.remove())
      },
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait' as const,
    },
    pagebreak: {
      mode: 'css',
    },
  }

  await html2pdf().set(options).from(container).save()
}
