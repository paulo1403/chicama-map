export type ToastKind = 'success' | 'error' | 'info'

export type ToastItem = {
  id: string
  kind: ToastKind
  message: string
  title?: string
  durationMs?: number
}

type ToastInput = Omit<ToastItem, 'id'>

type Listener = (toast: ToastItem) => void

class ToastService {
  private listeners = new Set<Listener>()

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  show(input: ToastInput) {
    const toast: ToastItem = {
      id: crypto.randomUUID(),
      durationMs: 2800,
      ...input,
    }

    this.listeners.forEach((listener) => listener(toast))
    return toast.id
  }

  success(message: string, title = 'Listo') {
    return this.show({ kind: 'success', title, message })
  }

  error(message: string, title = 'Error') {
    return this.show({ kind: 'error', title, message, durationMs: 4200 })
  }

  info(message: string, title = 'Info') {
    return this.show({ kind: 'info', title, message })
  }
}

export const toastService = new ToastService()
