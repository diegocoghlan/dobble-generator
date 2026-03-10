import { useEffect, useRef } from 'react'
import { useLocale } from '../context/LocaleContext'

interface PdfPreviewModalProps {
  pdfUrl: string
  onClose: () => void
}

export function PdfPreviewModal({ pdfUrl, onClose }: PdfPreviewModalProps) {
  const { t } = useLocale()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-preview-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-palette-surface shadow-xl">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-palette-border px-3 py-2 sm:px-4 sm:py-3">
          <h2
            id="pdf-preview-title"
            className="min-w-0 truncate text-base font-semibold text-palette-primary sm:text-lg"
          >
            {t('pdfPreview.title')}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-10 border border-palette-border bg-palette-surface px-4 py-2 text-palette-primary hover:bg-palette-bg focus:outline-none focus:ring-2 focus:ring-palette-accent focus:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {t('pdfPreview.close')}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-2 sm:p-4">
          <iframe
            src={pdfUrl}
            title={t('pdfPreview.title')}
            className="w-full rounded-10 border border-palette-border bg-palette-surface h-[min(600px,calc(90vh-8rem))] min-h-[50vh]"
          />
          <p className="mt-3 text-center sm:hidden">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-palette-accent underline hover:text-palette-accentHover"
            >
              {t('pdfPreview.openInNewTab')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
