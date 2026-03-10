import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { AppProvider, useApp } from './context/AppContext'
import { useLocale } from './context/LocaleContext'
import { GameModeSelector } from './components/GameModeSelector'
import { UploadZone } from './components/UploadZone'
import { LanguageSelector } from './components/LanguageSelector'
import { PdfPreviewModal } from './components/PdfPreviewModal'
import { exportDeckToPdf } from './utils/pdfExport'

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
            <p className="text-palette-muted mt-3 text-sm max-w-2xl">{t('app.intro')}</p>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <section aria-labelledby="game-mode-heading">
          <h2 id="game-mode-heading" className="text-xl font-semibold text-palette-primary mb-3">
            {t('gameMode.heading')}
          </h2>
          <GameModeSelector />
        </section>
        <section aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="text-xl font-semibold text-palette-primary mb-3">
            {t('upload.heading')}
          </h2>
          <UploadZone />
        </section>

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

        {hasImages && hasLayout && (
          <div
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-palette-border bg-palette-surface/95 px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)] sm:hidden"
            aria-label={t('actions.generatePdfA11y')}
          >
            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="w-full rounded-10 bg-palette-accent py-3 text-white font-medium hover:bg-palette-accentHover focus:outline-none focus:ring-2 focus:ring-palette-accent focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={t('actions.generatePdfA11y')}
            >
              {isGeneratingPdf ? t('actions.generating') : t('actions.generatePdf')}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Analytics />
    </AppProvider>
  )
}
