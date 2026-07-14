export function sanitizeFilename(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[<>:"/\\|?*]+/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

export function createPdfFilename(reportTitle: string): string {
  const baseName = sanitizeFilename(reportTitle)
  if (!baseName) {
    return 'Relatorio_Fotografico.pdf'
  }
  return `Relatorio_Fotografico_${baseName}.pdf`
}
