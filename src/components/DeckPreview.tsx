import { useApp } from '../context/AppContext'
import { CardPreview } from './CardPreview'

export function DeckPreview() {
  const { images, layoutByCard, cardData } = useApp()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cardData.map((_, cardIndex) => (
        <CardPreview
          key={cardIndex}
          placements={layoutByCard[cardIndex] ?? []}
          imageUrls={images}
          sizePx={160}
        />
      ))}
    </div>
  )
}
