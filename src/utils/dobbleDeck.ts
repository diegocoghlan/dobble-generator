/**
 * Finite Projective Plane – Dobble deck generator.
 * For order n (prime): n² + n + 1 cards, n² + n + 1 symbols, n + 1 symbols per card.
 */
export function generateDobbleDeck(n: number): number[][] {
  const size = n
  const cards: number[][] = []

  // 1. First set of n+1 cards (symbol 0 is the "point at infinity")
  for (let i = 0; i <= size; i++) {
    const card = [0]
    for (let j = 0; j < size; j++) {
      card.push(j + 1 + i * size)
    }
    cards.push(card)
  }

  // 2. Remaining n² cards
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const card = [i + 1]
      for (let k = 0; k < size; k++) {
        const val = size + 1 + size * k + ((i * k + j) % size)
        card.push(val)
      }
      cards.push(card)
    }
  }

  return cards
}

export interface GameMode {
  id: string
  label: string
  order: number
  cardCount: number
  symbolsPerCard: number
}

export const GAME_MODES: GameMode[] = [
  { id: 'quick', label: 'Partida rápida (7 cartas, 3 por carta)', order: 2, cardCount: 7, symbolsPerCard: 3 },
  { id: 'mini', label: 'Partida mini (13 cartas, 4 por carta)', order: 3, cardCount: 13, symbolsPerCard: 4 },
  { id: 'standard', label: 'Partida estándar (31 cartas, 6 por carta)', order: 5, cardCount: 31, symbolsPerCard: 6 },
  { id: 'full', label: 'Partida completa (57 cartas, 8 por carta)', order: 7, cardCount: 57, symbolsPerCard: 8 },
  { id: 'expert', label: 'Partida experta (133 cartas, 12 por carta)', order: 11, cardCount: 133, symbolsPerCard: 12 },
]

export function getGameModeById(id: string): GameMode {
  const mode = GAME_MODES.find((m) => m.id === id)
  if (!mode) return GAME_MODES[3]
  return mode
}
