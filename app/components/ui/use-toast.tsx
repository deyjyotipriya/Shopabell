import * as React from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

type ToastActionElement = React.ReactElement

interface Toast extends ToastProps {}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

interface ToastContext {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContext | undefined>(undefined)

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = genId()
    const newToast = { ...toast, id }
    
    setToasts((toasts) => [...toasts, newToast].slice(-TOAST_LIMIT))
    
    setTimeout(() => {
      removeToast(id)
    }, TOAST_REMOVE_DELAY)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return {
    toasts: context.toasts,
    toast: context.addToast,
    dismiss: context.removeToast,
  }
}

export function toast(props: Omit<Toast, "id">) {
  // This is a placeholder for the imperative API
  // In a real implementation, this would need to be connected to the provider
  console.log("Toast:", props)
}