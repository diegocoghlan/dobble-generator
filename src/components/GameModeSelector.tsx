import { useApp } from '../context/AppContext'
import { GAME_MODES } from '../utils/dobbleDeck'

export function GameModeSelector() {
  const { gameMode, setGameMode } = useApp()

  return (
    <section aria-label="Modo de juego">
      <label htmlFor="game-mode" className="block text-sm font-medium text-slate-700 mb-2">
        Modo de juego
      </label>
      <select
        id="game-mode"
        value={gameMode.id}
        onChange={(e) => {
          const mode = GAME_MODES.find((m) => m.id === e.target.value)
          if (mode) setGameMode(mode)
        }}
        className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        {GAME_MODES.map((mode) => (
          <option key={mode.id} value={mode.id}>
            {mode.label}
          </option>
        ))}
      </select>
    </section>
  )
}
