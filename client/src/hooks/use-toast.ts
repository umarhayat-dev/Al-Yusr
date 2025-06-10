import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    ({ title, description, action, variant = "default" }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newToast: Toast = { id, title, description, action, variant }
      
      setToasts((prevToasts) => [...prevToasts, newToast])
      
      // Auto-remove after 2 seconds
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
      }, 2000)
      
      return {
        id,
        dismiss: () => setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id)),
        update: (updates: Partial<Toast>) =>
          setToasts((prevToasts) =>
            prevToasts.map((t) => (t.id === id ? { ...t, ...updates } : t))
          ),
      }
    },
    []
  )

  return {
    toast,
    toasts,
    dismiss: (toastId: string) =>
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toastId)),
  }
}
