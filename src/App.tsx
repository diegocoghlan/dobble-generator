import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { GameModeSelector } from './components/GameModeSelector'
import { UploadZone } from './components/UploadZone'
import { exportDeckToPdf } from './utils/pdfExport'

function PdfPreviewModal({
  pdfUrl,
  onClose,
}: {
  pdfUrl: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-preview-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 id="pdf-preview-title" className="text-lg font-semibold text-slate-800">
            Vista previa del PDF
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Cerrar
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <iframe
            src={pdfUrl}
            title="Vista previa del PDF"
            className="w-full rounded border border-slate-200 bg-white"
            style={{ height: '600px' }}
          />
        </div>
      </div>
    </div>
  )
}

function AppContent() {
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
      .catch((err) => console.error('Error al generar PDF', err))
      .finally(() => setIsGeneratingPdf(false))
  }

  const closePdfPreview = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl)
      setPdfPreviewUrl(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <header className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Spot It (Dobble) Card Generator</h1>
        <p className="text-slate-600 mt-2">Elige el modo, sube las imágenes y genera tu baraja imprimible.</p>
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
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              aria-label="Generar PDF de la baraja"
            >
              {isGeneratingPdf ? 'Generando…' : 'Generar PDF'}
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
