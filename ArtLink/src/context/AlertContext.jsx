import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import FloatingAlert from '../components/FloatingAlert'

export const AlertContext = createContext({
  showAlert: () => {},
  hideAlert: () => {},
  alertState: null,
})

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState({
    open: false,
    type: 'success',
    title: '',
    message: '',
    eyebrow: '',
    action: null,
    closeLabel: 'Entendido',
    onCloseCallback: null,
    autoCloseMs: null,
    children: null,
  })

  const showAlert = useCallback((options) => {
    if (!options) return
    const {
      type = 'success',
      title = '',
      message = '',
      eyebrow = '',
      action = null,
      closeLabel = 'Entendido',
      onClose = null,
      autoCloseMs = null,
      children = null,
    } = options

    setAlertState({
      open: true,
      type,
      title,
      message,
      eyebrow,
      action,
      closeLabel,
      onCloseCallback: onClose,
      autoCloseMs,
      children,
    })
  }, [])

  const hideAlert = useCallback(() => {
    setAlertState((prev) => {
      if (prev.onCloseCallback) {
        try {
          prev.onCloseCallback()
        } catch {}
      }
      return { ...prev, open: false }
    })
  }, [])

  const contextValue = useMemo(
    () => ({
      showAlert,
      hideAlert,
      alertState,
    }),
    [showAlert, hideAlert, alertState]
  )

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alertState.open && (
        <FloatingAlert
          open={alertState.open}
          type={alertState.type}
          title={alertState.title}
          message={alertState.message}
          eyebrow={alertState.eyebrow}
          action={alertState.action}
          closeLabel={alertState.closeLabel}
          onClose={hideAlert}
          autoCloseMs={alertState.autoCloseMs}
        >
          {alertState.children}
        </FloatingAlert>
      )}
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const ctx = useContext(AlertContext)
  if (!ctx) {
    return {
      showAlert: () => {},
      hideAlert: () => {},
      alertState: null,
    }
  }
  return ctx
}

export default AlertContext
