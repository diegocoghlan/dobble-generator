import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { generateDobbleDeck, getGameModeById, type GameMode } from '../utils/dobbleDeck'
import { computeAllLayouts } from '../utils/cardLayout'

export interface Placement {
  imageIndex: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  /** When set (e.g. hard-fail placement), render on top of other tokens. */
  zIndex?: number
}

interface AppState {
  gameMode: GameMode
  setGameMode: (mode: GameMode) => void
  images: (string | null)[]
  layoutByCard: Placement[][]
  cardData: number[][]
  setImages: (urls: (string | null)[]) => void
  setImageAtIndex: (index: number, url: string | null) => void
  clearImages: () => void
}

const AppContext = createContext<AppState | null>(null)

const DEFAULT_MODE_ID = 'full'

export function AppProvider({ children }: { children: ReactNode }) {
  const [gameMode, setGameModeState] = useState<GameMode>(() =>
    getGameModeById(DEFAULT_MODE_ID)
  )
  const requiredCount = gameMode.cardCount

  const [images, setImagesState] = useState<(string | null)[]>(() =>
    Array(requiredCount).fill(null)
  )

  const cardData = useMemo(
    () => generateDobbleDeck(gameMode.order),
    [gameMode.order]
  )

  const layoutByCard = useMemo(
    () => computeAllLayouts(cardData, gameMode.symbolsPerCard),
    [cardData, gameMode.symbolsPerCard]
  )

  const setGameMode = useCallback((mode: GameMode) => {
    setGameModeState(mode)
    setImagesState(Array(mode.cardCount).fill(null))
  }, [])

  const setImages = useCallback(
    (urls: (string | null)[]) => {
      if (urls.length !== requiredCount) return
      setImagesState([...urls])
    },
    [requiredCount]
  )

  const setImageAtIndex = useCallback((index: number, url: string | null) => {
    setImagesState((prev) => {
      if (index < 0 || index >= prev.length) return prev
      const next = [...prev]
      next[index] = url
      return next
    })
  }, [])

  const clearImages = useCallback(() => {
    setImagesState(Array(requiredCount).fill(null))
  }, [requiredCount])

  const value: AppState = useMemo(
    () => ({
      gameMode,
      setGameMode,
      images,
      layoutByCard,
      cardData,
      setImages,
      setImageAtIndex,
      clearImages,
    }),
    [
      gameMode,
      setGameMode,
      images,
      layoutByCard,
      cardData,
      setImages,
      setImageAtIndex,
      clearImages,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
