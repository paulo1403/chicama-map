import { CircleCheck } from 'lucide-react'

import { CATEGORIES } from '../../constants/categories'
import { useI18n } from '../../i18n/useI18n'
import type { AdminDraft } from '../../types/map'
import './AdminSheet.css'

type AdminSheetProps = {
  authError: string | null
  backendAvailable: boolean
  busy: boolean
  draft: AdminDraft | null
  password: string
  sheetOpen: boolean
  token: string | null
  username: string
  onClose: () => void
  onDeletePoint: (id: string) => void
  onDraftChange: (nextDraft: AdminDraft) => void
  onLogin: () => void
  onPasswordChange: (value: string) => void
  onSave: () => void
  onUseMyLocation: () => void
  onUsernameChange: (value: string) => void
}

export function AdminSheet({
  authError,
  backendAvailable,
  busy,
  draft,
  password,
  sheetOpen,
  token,
  username,
  onClose,
  onDeletePoint,
  onDraftChange,
  onLogin,
  onPasswordChange,
  onSave,
  onUseMyLocation,
  onUsernameChange,
}: AdminSheetProps) {
  const { categoryLabel, copy, formatCategories, language } = useI18n()

  const sheetUxCopy =
    language === 'en'
      ? {
          loginIntroTitle: 'Unlock the admin tools',
          loginIntroText: 'Sign in once to create, edit, and polish places with a much smoother flow.',
          progressText: (count: number) => `${count}/3 essentials ready`,
          basicsTitle: 'Basic info',
          basicsHint: 'Name and category help people find the place faster.',
          locationTitle: 'Location',
          locationHint: 'Double-check the pin before saving.',
          detailsTitle: 'Helpful details',
          detailsHint: 'Short practical notes make the point more useful.',
          checkName: 'Name',
          checkLocation: 'Location',
          checkCategory: 'Category',
          namePlaceholder: 'E.g. Sunset hostel',
          contactPlaceholder: 'Phone, WhatsApp or Instagram',
          descriptionPlaceholder: 'Describe what people will find here and what makes it useful.',
        }
      : {
          loginIntroTitle: 'Desbloquea las herramientas admin',
          loginIntroText: 'Inicia sesión una vez para crear, editar y pulir lugares con un flujo mucho más claro.',
          progressText: (count: number) => `${count}/3 datos esenciales listos`,
          basicsTitle: 'Información básica',
          basicsHint: 'Nombre y categoría ayudan a encontrar el lugar más rápido.',
          locationTitle: 'Ubicación',
          locationHint: 'Verifica bien el pin antes de guardar.',
          detailsTitle: 'Detalles útiles',
          detailsHint: 'Notas cortas y prácticas hacen el punto más valioso.',
          checkName: 'Nombre',
          checkLocation: 'Ubicación',
          checkCategory: 'Categoría',
          namePlaceholder: 'Ej. Hospedaje Ola Norte',
          contactPlaceholder: 'Teléfono, WhatsApp o Instagram',
          descriptionPlaceholder: 'Cuéntale a la gente qué encontrará aquí y por qué este lugar es útil.',
        }

  if (!sheetOpen) return null

  const sheetTitle = draft
    ? draft.mode === 'create'
      ? copy.adminSheet.newPoint
      : copy.adminSheet.editPoint
    : copy.adminSheet.access

  return (
    <>
      <div className="SheetBackdrop" onClick={onClose} />

      <div
        className="Sheet"
        role="dialog"
        aria-label={sheetTitle}
      >
        <div className="SheetHandle" />
        <div className="SheetTitleRow">
          <div className="SheetTitle">{sheetTitle}</div>
          <button className="Button" onClick={onClose} type="button">
            {copy.common.close}
          </button>
        </div>

        {!token ? (
          <div className="Grid">
            <div className="SheetIntroCard">
              <div className="SheetSectionTitle">{sheetUxCopy.loginIntroTitle}</div>
              <div className="SheetMeta">{sheetUxCopy.loginIntroText}</div>
            </div>

            <div>
              <div className="FieldLabel">{copy.adminSheet.username}</div>
              <input
                className="Field"
                autoComplete="username"
                value={username}
                onChange={(event) => onUsernameChange(event.target.value)}
              />
            </div>
            <div>
              <div className="FieldLabel">{copy.adminSheet.password}</div>
              <input
                className="Field"
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
              />
            </div>
            {authError && <div className="SheetMeta SheetMetaAlert">{authError}</div>}
            <div className="Row">
              <button
                className="Button ButtonPrimary"
                type="button"
                onClick={onLogin}
                disabled={!backendAvailable || busy || !username || !password}
              >
                {copy.adminSheet.login}
              </button>
            </div>
          </div>
        ) : draft ? (
          <div className="Grid">
            <div className="SheetProgressCard">
              <div className="SheetMeta">{sheetUxCopy.progressText([draft.name.trim(), draft.categories.length > 0 ? 'ok' : '', Number.isFinite(draft.lat) && Number.isFinite(draft.lng) ? 'ok' : ''].filter(Boolean).length)}</div>
              <div className="SheetChecklist">
                {[
                  { label: sheetUxCopy.checkName, done: Boolean(draft.name.trim()) },
                  { label: sheetUxCopy.checkCategory, done: draft.categories.length > 0 },
                  { label: sheetUxCopy.checkLocation, done: Number.isFinite(draft.lat) && Number.isFinite(draft.lng) },
                ].map((item) => (
                  <span className={item.done ? 'SheetCheckItem is-done' : 'SheetCheckItem'} key={item.label}>
                    <CircleCheck size={14} strokeWidth={2.2} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <section className="SheetSection">
              <div className="SheetSectionHead">
                <div className="SheetSectionTitle">{sheetUxCopy.basicsTitle}</div>
                <div className="SheetMeta">{sheetUxCopy.basicsHint}</div>
              </div>

              <div>
                <div className="FieldLabel">{copy.adminSheet.name}</div>
                <input
                  className="Field"
                  placeholder={sheetUxCopy.namePlaceholder}
                  value={draft.name}
                  onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
                />
              </div>

              <div>
                <div className="FieldLabel">{copy.adminSheet.categories}</div>
                <div className="PointBadges">
                  {CATEGORIES.map((category) => {
                    const active = draft.categories.includes(category.key)
                    return (
                      <button
                        key={category.key}
                        className={active ? 'Chip ChipActive' : 'Chip'}
                        type="button"
                        onClick={() => {
                          const nextCategories = active
                            ? draft.categories.filter((key) => key !== category.key)
                            : [...draft.categories, category.key]
                          onDraftChange({ ...draft, categories: nextCategories })
                        }}
                      >
                        {categoryLabel(category.key)}
                      </button>
                    )
                  })}
                </div>
                {draft.categories.length > 0 ? <div className="SheetMeta">{formatCategories(draft.categories)}</div> : null}
              </div>

              <div>
                <div className="FieldLabel">{copy.adminSheet.ratingLabel}</div>
                <input
                  className="Field"
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={draft.rating}
                  onChange={(event) => onDraftChange({ ...draft, rating: Number(event.target.value) })}
                />
                <div className="SheetMeta">{draft.rating > 0 ? draft.rating.toFixed(1) : copy.adminSheet.noRating}</div>
              </div>
            </section>

            <section className="SheetSection">
              <div className="SheetSectionHead">
                <div className="SheetSectionTitle">{sheetUxCopy.locationTitle}</div>
                <div className="SheetMeta">{sheetUxCopy.locationHint}</div>
              </div>

              <div className="Row">
                <div>
                  <div className="FieldLabel">{copy.adminSheet.latitude}</div>
                  <input
                    className="Field"
                    inputMode="decimal"
                    value={String(draft.lat)}
                    onChange={(event) => onDraftChange({ ...draft, lat: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <div className="FieldLabel">{copy.adminSheet.longitude}</div>
                  <input
                    className="Field"
                    inputMode="decimal"
                    value={String(draft.lng)}
                    onChange={(event) => onDraftChange({ ...draft, lng: Number(event.target.value) })}
                  />
                </div>
              </div>

              <div className="Row">
                <button className="Button" type="button" onClick={onUseMyLocation} disabled={busy}>
                  {copy.adminSheet.useMyLocation}
                </button>
              </div>
            </section>

            <section className="SheetSection">
              <div className="SheetSectionHead">
                <div className="SheetSectionTitle">{sheetUxCopy.detailsTitle}</div>
                <div className="SheetMeta">{sheetUxCopy.detailsHint}</div>
              </div>

              <div>
                <div className="FieldLabel">{copy.adminSheet.contact}</div>
                <input
                  className="Field"
                  placeholder={sheetUxCopy.contactPlaceholder}
                  value={draft.contact}
                  onChange={(event) => onDraftChange({ ...draft, contact: event.target.value })}
                />
              </div>

              <div>
                <div className="FieldLabel">{copy.adminSheet.keywords}</div>
                <input
                  className="Field"
                  placeholder={copy.adminSheet.keywordsPlaceholder}
                  value={(draft.keywords ?? []).join(', ')}
                  onChange={(event) =>
                    onDraftChange({
                      ...draft,
                      keywords: event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
                <div className="SheetMeta">{copy.adminSheet.keywordsHelp}</div>
              </div>

              <div>
                <div className="FieldLabel">{copy.adminSheet.description}</div>
                <textarea
                  className="Field"
                  placeholder={sheetUxCopy.descriptionPlaceholder}
                  rows={3}
                  value={draft.description}
                  onChange={(event) => onDraftChange({ ...draft, description: event.target.value })}
                />
              </div>
            </section>

            <div className="Row SheetActionBar">
              <button
                className="Button ButtonPrimary"
                type="button"
                onClick={onSave}
                disabled={busy || !draft.name.trim()}
              >
                {copy.common.save}
              </button>
              {draft.mode === 'edit' && draft.id ? (
                <button
                  className="Button ButtonDanger"
                  type="button"
                  onClick={() => onDeletePoint(draft.id!)}
                  disabled={busy}
                >
                  {copy.common.delete}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}