import { useI18n } from '../../i18n/useI18n'

export function LanguageToggle() {
  const { language, setLanguage, copy } = useI18n()

  return (
    <div className="LanguageToggle" role="group" aria-label={copy.language.label}>
      <button
        className={language === 'es' ? 'Chip ChipActive LanguageToggleButton' : 'Chip LanguageToggleButton'}
        onClick={() => setLanguage('es')}
        type="button"
      >
        ES
      </button>
      <button
        className={language === 'en' ? 'Chip ChipActive LanguageToggleButton' : 'Chip LanguageToggleButton'}
        onClick={() => setLanguage('en')}
        type="button"
      >
        EN
      </button>
    </div>
  )
}
