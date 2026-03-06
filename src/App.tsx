import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { useLocale } from './context/LocaleContext'
import { GameModeSelector } from './components/GameModeSelector'
import { UploadZone } from './components/UploadZone'
import { LanguageSelector } from './components/LanguageSelector'
import { exportDeckToPdf } from './utils/pdfExport'

function PdfPreviewModal({
  pdfUrl,
  onClose,
}: {
  pdfUrl: string
  onClose: () => void
}) {
  const { t } = useLocale()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-preview-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-palette-surface shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-palette-border px-4 py-3">
          <h2 id="pdf-preview-title" className="text-lg font-semibold text-palette-primary">
            {t('pdfPreview.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-10 border border-palette-border bg-palette-surface px-4 py-2 text-palette-primary hover:bg-palette-bg focus:outline-none focus:ring-2 focus:ring-palette-accent focus:ring-offset-2"
          >
            {t('pdfPreview.close')}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <iframe
            src={pdfUrl}
            title={t('pdfPreview.title')}
            className="w-full rounded-10 border border-palette-border bg-palette-surface"
            style={{ height: '600px' }}
          />
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { t } = useLocale()
  const { gameMode, images, layoutByCard, cardData } = useApp()
  const required = gameMode.cardCount
  const hasImages = images.length === required && images.every(Boolean)
  const hasLayout = layoutByCard.length === cardData.length

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const handleGeneratePdf = () => {
    if (!hasImages || !hasLayout) return
    setIsGeneratingPdf(true)
    exportDeckToPdf(images as string[], layoutByCard, cardData)
      .then((url) => setPdfPreviewUrl(url))
      .catch((err) => console.error('Error generating PDF', err))
      .finally(() => setIsGeneratingPdf(false))
  }

  const closePdfPreview = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl)
      setPdfPreviewUrl(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4">
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h1 className="text-3xl font-bold text-palette-primary">{t('app.title')}</h1>
            <p className="text-palette-muted mt-2">{t('app.subtitle')}</p>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <GameModeSelector />
        <UploadZone />

        {hasImages && hasLayout && (
          <section className="flex justify-center">
            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="px-6 py-3 bg-palette-accent text-white rounded-10 hover:bg-palette-accentHover focus:outline-none focus:ring-2 focus:ring-palette-accent focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              aria-label={t('actions.generatePdfA11y')}
            >
              {isGeneratingPdf ? t('actions.generating') : t('actions.generatePdf')}
            </button>
          </section>
        )}

        {pdfPreviewUrl && (
          <PdfPreviewModal pdfUrl={pdfPreviewUrl} onClose={closePdfPreview} />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
