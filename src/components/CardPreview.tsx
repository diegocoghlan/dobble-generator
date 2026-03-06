import { useState, useCallback } from 'react'
import type { CSSProperties, SyntheticEvent } from 'react'
import type { Placement } from '../context/AppContext'

const RADIUS = 100
const CARD_PADDING_PX = 6

/** Estilos según relación de aspecto para maximizar el uso del círculo del token */
function getStyleForAspectRatio(ratio: number): CSSProperties {
  if (ratio > 1.5) {
    return { width: '95%', height: 'auto', objectFit: 'contain' }
  }
  if (ratio < 0.7) {
    return { height: '95%', width: 'auto', objectFit: 'contain' }
  }
  return { width: '80%', height: '80%', objectFit: 'contain' }
}

interface CardPreviewProps {
  placements: Placement[]
  imageUrls: (string | null)[]
  sizePx?: number
}

export function CardPreview({
  placements,
  imageUrls,
  sizePx = 200,
}: CardPreviewProps) {
  const [aspectStyles, setAspectStyles] = useState<Record<string, CSSProperties>>({})

  const handleImageLoad = useCallback((tokenKey: string, e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const ratio = img.naturalWidth / img.naturalHeight
    setAspectStyles((prev) => ({ ...prev, [tokenKey]: getStyleForAspectRatio(ratio) }))
  }, [])

  const innerSize = sizePx - 2 * CARD_PADDING_PX
  const scale = innerSize / (RADIUS * 2)
  const center = sizePx / 2

  return (
    <div
      className="relative flex-shrink-0 bg-white"
      style={{
        width: sizePx,
        height: sizePx,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '1px dashed var(--color-border)',
      }}
    >
      {placements.map((p, i) => {
        const src = imageUrls[p.imageIndex]
        if (!src) return null

        const size = Math.max(p.width, p.height) * scale
        const left = center + p.x * scale - size / 2
        const top = center + p.y * scale - size / 2

        return (
          <div
            key={`${p.imageIndex}-${i}`}
            className="absolute"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${size}px`,
              height: `${size}px`,
              transform: `rotate(${p.rotation}deg)`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              border: '1px solid var(--color-border)',
              ...(p.zIndex != null && { zIndex: p.zIndex }),
            }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              onLoad={(e) => handleImageLoad(`${p.imageIndex}-${i}`, e)}
              style={{
                width: '85%',
                height: '85%',
                objectFit: 'contain',
                display: 'block',
                imageRendering: 'crisp-edges',
                ...aspectStyles[`${p.imageIndex}-${i}`],
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
