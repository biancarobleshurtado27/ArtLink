import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop
 * Asegura que al navegar a cualquier página nueva en ArtLink,
 * la pantalla siempre entre posicionada desde el tope superior (y: 0)
 * y no en la posición de scroll en la que se dejó la pantalla anterior.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  // Desactivar la restauración nativa de scroll del navegador para evitar saltos
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    // Si la URL contiene un ancla / hash (ej. #comisiones), hacer scroll al elemento específico
    if (hash) {
      const elementId = hash.replace('#', '')
      const targetElement = document.getElementById(elementId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }

    // Al cambiar de página, volver siempre a la parte superior de la ventana y documento
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } catch {
      window.scrollTo(0, 0)
    }

    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }
  }, [pathname, search, hash])

  return null
}
