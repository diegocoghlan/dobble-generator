import { useCallback, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLocale } from '../context/LocaleContext'
import { isAcceptedFile, resizeImageToDataUrl } from '../utils/resizeImage'

export function UploadZone() {
  const { t } = useLocale()
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
        setError(t('upload.invalidFormat', { name: invalid.name }))
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
    [required, images, setImages, t]
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
    <section aria-label={t('upload.ariaLabel')}>
      <p className="text-palette-primary mb-2">
        {t('upload.description', { count: required })}
      </p>
      <p className="text-palette-muted text-sm mb-6">
        {t('upload.count', { filled: filledCount, required })}
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
          border-2 border-dashed rounded-10 p-6 text-center cursor-pointer transition-colors mb-8
          bg-palette-surface text-palette-primary
          ${hasAll ? 'border-palette-accent' : 'border-palette-accent hover:border-palette-accentHover'}
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
          <p className="text-palette-muted">{t('upload.processing')}</p>
        ) : (
          <p className="text-palette-primary">{t('upload.dropHint')}</p>
        )}
      </div>

      {error && (
        <p className="mb-4 text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6 mt-2">
        {images.map((url, index) => (
          <div
            key={index}
            data-slot={index}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`relative rounded-10 overflow-hidden aspect-square border-2 transition-colors group ${
              url
                ? 'border-solid border-palette-accent bg-white'
                : 'border-dashed border-palette-border bg-white hover:border-palette-accent'
            }`}
          >
            {url ? (
              <>
                <img
                  src={url}
                  alt={t('upload.symbolN', { n: index + 1 })}
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setImageAtIndex(index, null)
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white text-xs font-medium shadow hover:bg-red-600"
                  title={t('upload.removeTitle')}
                  aria-label={t('upload.removeSymbolA11y', { n: index + 1 })}
                >
                  {t('upload.remove')}
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
                className="w-full h-full flex flex-col items-center justify-center text-palette-primary rounded-10 transition-all group"
              >
                <span className="inline-block text-2xl mb-1 text-palette-accent transition-transform group-hover:scale-110">+</span>
                <span className="text-xs">{t('upload.symbolN', { n: index + 1 })}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {hasAll && (
        <button
          type="button"
          onClick={clearImages}
          className="mt-4 text-palette-muted hover:text-palette-accent text-sm underline"
        >
          {t('upload.clearAll')}
        </button>
      )}
    </section>
  )
}
