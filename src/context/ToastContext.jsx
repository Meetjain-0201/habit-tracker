import { createContext, useCallback, useContext, useState } from 'react'
import ToastContainer from '../components/Toast'

const MAX_TOASTS = 3
const DURATION_MS = 3000
const ANIM_MS = 250

const ToastContext = createContext({ showToast: () => {} })

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, ANIM_MS)
  }, [])

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = ++nextId
      setToasts((prev) => {
        const next = [...prev, { id, message, type, dismissing: false }]
        return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next
      })
      setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
