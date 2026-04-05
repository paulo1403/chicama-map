import { useEffect, useState } from 'react'

import type { ToastItem } from '../../services/toast.service'
import { toastService } from '../../services/toast.service'
import './ToastViewport.css'

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const unsubscribe = toastService.subscribe((toast) => {
      setToasts((previous) => [...previous, toast])

      window.setTimeout(() => {
        setToasts((previous) => previous.filter((item) => item.id !== toast.id))
      }, toast.durationMs ?? 2800)
    })

    return unsubscribe
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="ToastViewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`ToastCard ToastCard--${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
          {toast.title ? <div className="ToastTitle">{toast.title}</div> : null}
          <div className="ToastMessage">{toast.message}</div>
        </div>
      ))}
    </div>
  )
}
