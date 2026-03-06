import { useLocale } from '../context/LocaleContext'
import type { Locale } from '../i18n/translations'

const LOCALES: { value: Locale; flag: string; labelKey: string }[] = [
  { value: 'en', flag: '🇺🇸', labelKey: 'language.english' },
  { value: 'es', flag: '🇲🇽', labelKey: 'language.spanish' },
]

export function LanguageSelector() {
  const { locale, setLocale, t } = useLocale()

  return (
    <div className="flex items-center gap-2">
      <select
        id="language"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="rounded-10 border-2 border-palette-accentHover bg-palette-purpleLight px-3 py-2 text-palette-accentHover shadow-sm focus:border-palette-accent focus:outline-none focus:ring-2 focus:ring-palette-accent flex items-center gap-2 font-medium"
        aria-label={t('language.selectorA11y')}
      >
        {LOCALES.map(({ value, flag, labelKey }) => (
          <option key={value} value={value}>
            {flag} {t(labelKey)}
          </option>
        ))}
      </select>
    </div>
  )
}
