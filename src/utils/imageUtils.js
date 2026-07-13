const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateImageFile(file, maxFileSizeMB = 12) {
  if (!file) {
    throw new Error('Nenhum arquivo selecionado.')
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Arquivo invalido. Use apenas JPG, PNG ou WEBP.')
  }

  const maxSize = maxFileSizeMB * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(`Arquivo muito grande. Limite de ${maxFileSizeMB} MB.`)
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Nao foi possivel processar a imagem.'))
    img.src = src
  })
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Falha ao ler arquivo.'))
    reader.readAsDataURL(file)
  })
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Falha ao compactar imagem.'))
        return
      }
      resolve(blob)
    }, type, quality)
  })
}

export async function compressImageFile(file, options = {}) {
  const {
    maxFileSizeMB = 12,
    compressAboveMB = 2,
    maxWidth = 2400,
    maxHeight = 2400,
    quality = 0.82,
  } = options

  validateImageFile(file, maxFileSizeMB)

  const shouldCompress = file.size > compressAboveMB * 1024 * 1024
  if (!shouldCompress) {
    return {
      dataUrl: await readAsDataURL(file),
      contentType: file.type,
      name: file.name,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false,
    }
  }

  const originalDataUrl = await readAsDataURL(file)
  const img = await loadImage(originalDataUrl)

  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
  const width = Math.max(1, Math.round(img.width * ratio))
  const height = Math.max(1, Math.round(img.height * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d', { alpha: false })
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const blob = await toBlob(canvas, outputType, quality)
  const compressedDataUrl = await readAsDataURL(new File([blob], file.name, { type: outputType }))

  return {
    dataUrl: compressedDataUrl,
    contentType: outputType,
    name: file.name,
    originalSize: file.size,
    compressedSize: blob.size,
    compressed: true,
  }
}

export function sanitizeFileName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
