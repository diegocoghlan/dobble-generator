import { useCallback, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { isAcceptedFile, resizeImageToDataUrl } from '../utils/resizeImage'

export function UploadZone() {
  const { images, setImages, setImageAtIndex, clearImages, gameMode } = useApp()
  const required = gameMode.cardCount
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pendingSlot, setPendingSlot] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputSingleRef = useRef<HTMLInputElement>(null)

  const filledCount = images.filter(Boolean).length
  const hasAll = filledCount === required

  const processFiles = useCallback(
    async (files: FileList | null, startAtIndex: number | null) => {
      if (!files || files.length === 0) return
      setError(null)

      const fileArray = Array.from(files)
      const invalid = fileArray.find((f) => !isAcceptedFile(f))
      if (invalid) {
        setError(`Formato no válido: "${invalid.name}". Usa JPG, PNG, WEBP o SVG.`)
        return
      }

      setLoading(true)
      try {
        const indicesToFill: number[] = []
        if (startAtIndex !== null && startAtIndex >= 0 && startAtIndex < required && !images[startAtIndex]) {
          indicesToFill.push(startAtIndex)
          for (let i = 1; i < fileArray.length; i++) {
            const nextEmpty = images.findIndex((url, idx) => !url && !indicesToFill.includes(idx))
            if (nextEmpty === -1) break
            indicesToFill.push(nextEmpty)
          }
        } else {
          for (let i = 0; i < fileArray.length; i++) {
            const nextEmpty = images.findIndex((url, idx) => !url && !indicesToFill.includes(idx))
            if (nextEmpty === -1) break
            indicesToFill.push(nextEmpty)
          }
        }

        const nextImages = [...images]
        const limit = Math.min(indicesToFill.length, fileArray.length)
        for (let i = 0; i < limit; i++) {
          try {
            const dataUrl = await resizeImageToDataUrl(fileArray[i])
            nextImages[indicesToFill[i]] = dataUrl
          } catch (e) {
            console.error('Error resizing image', indicesToFill[i], e)
          }
        }
        setImages(nextImages as (string | null)[])
      } finally {
        setLoading(false)
        setPendingSlot(null)
      }
    },
    [required, images, setImages]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const slot = (e.currentTarget as HTMLElement).dataset.slot
      const index = slot != null ? parseInt(slot, 10) : null
      processFiles(e.dataTransfer.files, index)
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleChangeBulk = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      processFiles(files, null)
      e.target.value = ''
    },
    [processFiles]
  )

  const handleChangeSingle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files?.length && pendingSlot !== null) {
        processFiles(files, pendingSlot)
      }
      e.target.value = ''
      setPendingSlot(null)
    },
    [processFiles, pendingSlot]
  )

  const openAddToSlot = useCallback((index: number) => {
    setPendingSlot(index)
    inputSingleRef.current?.click()
  }, [])

  const handleClickZone = () => inputRef.current?.click()

  return (
    <section aria-label="Zona de subida de imágenes">
      <p className="text-slate-700 mb-2">
        Este modo usa <strong>{required} símbolos</strong>. Sube <strong>{required} imágenes</strong> (una por cada símbolo).
      </p>
      <p className="text-slate-600 text-sm mb-4">
        {filledCount} de {required} subidas. Puedes añadir de una en una o varias a la vez, y quitar cualquiera con la X.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClickZone}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClickZone()
          }
        }}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-4
          ${hasAll ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white hover:border-slate-400'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
          multiple
          onChange={handleChangeBulk}
          className="hidden"
          aria-hidden
        />
        <input
          ref={inputSingleRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleChangeSingle}
          className="hidden"
          aria-hidden
        />
        {loading ? (
          <p className="text-slate-600">Procesando imágenes…</p>
        ) : (
          <p className="text-slate-600">
            Arrastra aquí varias imágenes o haz clic para elegir. Se asignarán a los huecos libres.
          </p>
        )}
      </div>

      {error && (
        <p className="mb-4 text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {images.map((url, index) => (
          <div
            key={index}
            data-slot={index}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50 aspect-square"
          >
            {url ? (
              <>
                <img
                  src={url}
                  alt={`Símbolo ${index + 1}`}
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setImageAtIndex(index, null)
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white text-xs font-medium shadow hover:bg-red-600"
                  title="Quitar esta imagen"
                  aria-label={`Quitar imagen del símbolo ${index + 1}`}
                >
                  Quitar
                </button>
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-0.5 text-center">
                  {index + 1}
                </span>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  openAddToSlot(index)
                }}
                className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400 border-dashed border-2 border-slate-200 rounded-lg transition-colors"
              >
                <span className="text-2xl mb-1">+</span>
                <span className="text-xs">Símbolo {index + 1}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {hasAll && (
        <button
          type="button"
          onClick={clearImages}
          className="mt-4 text-slate-500 hover:text-slate-700 text-sm underline"
        >
          Vaciar todo y volver a subir
        </button>
      )}
    </section>
  )
}
