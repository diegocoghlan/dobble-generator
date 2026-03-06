import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  translations,
  getDefaultLocale,
  interpolate,
  type Locale,
} from '../i18n/translations'

const STORAGE_KEY = 'dobble-locale'

function getNested(
  locale: Locale,
  key: string
): string | Record<string, string> | undefined {
  const parts = key.split('.')
  let current: unknown = translations[locale]
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : (current as Record<string, string> | undefined)
}

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (
    key: string,
    params?: Record<string, string | number>
  ) => string
}

const LocaleContext = createContext<LocaleState | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getDefaultLocale)

  useEffect(() => {
    document.documentElement.lang = locale === 'es' ? 'es' : 'en'
    document.title = translations[locale].app.title
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const value = getNested(locale, key)
      if (typeof value !== 'string') return key
      return params ? interpolate(value, params) : value
    },
    [locale]
  )

  const value: LocaleState = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale(): LocaleState {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
