/** Max dimension (px) for crisp symbols on cards and PDF. */
const MAX_SIZE = 800

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]

const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg']

export function isAcceptedFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext)
}

/**
 * Resize image to max 800px per side (keeping aspect ratio), then return as data URL
 * for use in both preview and jsPDF. SVG is rasterized to canvas for consistency.
 */
export function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        let { width, height } = img
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error('Canvas 2d not available'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)

        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        const dataUrl = canvas.toDataURL(mime, 0.9)
        resolve(dataUrl)
      } catch (e) {
        URL.revokeObjectURL(url)
        reject(e)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
