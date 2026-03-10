export type Locale = 'en' | 'es'

export const translations: Record<
  Locale,
  {
    app: { title: string; subtitle: string }
    pdfPreview: { title: string; close: string; openInNewTab: string }
    actions: { generatePdf: string; generating: string; generatePdfA11y: string }
    gameMode: {
      label: string
      ariaLabel: string
      quick: string
      mini: string
      standard: string
      full: string
      expert: string
    }
    upload: {
      ariaLabel: string
      description: string
      count: string
      processing: string
      dropHint: string
      invalidFormat: string
      remove: string
      removeTitle: string
      removeSymbolA11y: string
      symbolN: string
      clearAll: string
    }
    language: { english: string; spanish: string; selectorA11y: string }
  }
> = {
  en: {
    app: {
      title: 'Spot It (Dobble) Card Generator',
      subtitle: 'Choose the mode, upload your images and generate your printable deck.',
    },
    pdfPreview: {
      title: 'PDF Preview',
      close: 'Close',
      openInNewTab: 'Open in new tab',
    },
    actions: {
      generatePdf: 'Generate PDF',
      generating: 'Generating…',
      generatePdfA11y: 'Generate deck PDF',
    },
    gameMode: {
      label: 'Game mode',
      ariaLabel: 'Game mode',
      quick: 'Quick game (7 cards, 3 per card)',
      mini: 'Mini game (13 cards, 4 per card)',
      standard: 'Standard game (31 cards, 6 per card)',
      full: 'Full game (57 cards, 8 per card)',
      expert: 'Expert game (133 cards, 12 per card)',
    },
    upload: {
      ariaLabel: 'Image upload area',
      description: 'This mode uses {count} symbols. Upload {count} images (one per symbol).',
      count: '{filled} of {required} uploaded. You can add one at a time or several at once, and remove any with the X.',
      processing: 'Processing images…',
      dropHint: 'Drag images here or click to choose. They will be assigned to empty slots.',
      invalidFormat: 'Invalid format: "{name}". Use JPG, PNG, WEBP or SVG.',
      remove: 'Remove',
      removeTitle: 'Remove this image',
      removeSymbolA11y: 'Remove image for symbol {n}',
      symbolN: 'Symbol {n}',
      clearAll: 'Clear all and upload again',
    },
    language: {
      english: 'English',
      spanish: 'Spanish',
      selectorA11y: 'Language',
    },
  },
  es: {
    app: {
      title: 'Generador de cartas Spot It (Dobble)',
      subtitle: 'Elige el modo, sube las imágenes y genera tu baraja imprimible.',
    },
    pdfPreview: {
      title: 'Vista previa del PDF',
      close: 'Cerrar',
      openInNewTab: 'Abrir en nueva pestaña',
    },
    actions: {
      generatePdf: 'Generar PDF',
      generating: 'Generando…',
      generatePdfA11y: 'Generar PDF de la baraja',
    },
    gameMode: {
      label: 'Modo de juego',
      ariaLabel: 'Modo de juego',
      quick: 'Partida rápida (7 cartas, 3 por carta)',
      mini: 'Partida mini (13 cartas, 4 por carta)',
      standard: 'Partida estándar (31 cartas, 6 por carta)',
      full: 'Partida completa (57 cartas, 8 por carta)',
      expert: 'Partida experta (133 cartas, 12 por carta)',
    },
    upload: {
      ariaLabel: 'Zona de subida de imágenes',
      description: 'Este modo usa {count} símbolos. Sube {count} imágenes (una por cada símbolo).',
      count: '{filled} de {required} subidas. Puedes añadir de una en una o varias a la vez, y quitar cualquiera con la X.',
      processing: 'Procesando imágenes…',
      dropHint: 'Arrastra aquí varias imágenes o haz clic para elegir. Se asignarán a los huecos libres.',
      invalidFormat: 'Formato no válido: "{name}". Usa JPG, PNG, WEBP o SVG.',
      remove: 'Quitar',
      removeTitle: 'Quitar esta imagen',
      removeSymbolA11y: 'Quitar imagen del símbolo {n}',
      symbolN: 'Símbolo {n}',
      clearAll: 'Vaciar todo y volver a subir',
    },
    language: {
      english: 'English',
      spanish: 'Español',
      selectorA11y: 'Idioma',
    },
  },
}

const STORAGE_KEY = 'dobble-locale'

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'es') return stored
  return 'en'
}

export function getDefaultLocale(): Locale {
  return getStoredLocale()
}

export function interpolate(
  str: string,
  params: Record<string, string | number>
): string {
  return str.replace(/\{(\w+)\}/g, (_, key) =>
    String(params[key] ?? '')
  )
}
