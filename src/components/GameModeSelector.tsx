import { useApp } from '../context/AppContext'
import { useLocale } from '../context/LocaleContext'
import { GAME_MODES } from '../utils/dobbleDeck'

export function GameModeSelector() {
  const { t } = useLocale()
  const { gameMode, setGameMode } = useApp()

  return (
    <section aria-label={t('gameMode.ariaLabel')}>
      <label htmlFor="game-mode" className="block text-sm font-medium text-palette-primary mb-2">
        {t('gameMode.label')}
      </label>
      <select
        id="game-mode"
        value={gameMode.id}
        onChange={(e) => {
          const mode = GAME_MODES.find((m) => m.id === e.target.value)
          if (mode) setGameMode(mode)
        }}
        className="w-full max-w-md rounded-10 border-2 border-palette-accentHover bg-white px-3 py-2 text-palette-primary shadow-sm focus:border-palette-accent focus:outline-none focus:ring-2 focus:ring-palette-accent"
      >
        {GAME_MODES.map((mode) => (
          <option key={mode.id} value={mode.id}>
            {t(`gameMode.${mode.id}`)}
          </option>
        ))}
      </select>
    </section>
  )
}
