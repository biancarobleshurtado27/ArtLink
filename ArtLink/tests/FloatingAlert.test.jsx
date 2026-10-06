import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FloatingAlert from '../src/components/FloatingAlert'
import { AlertProvider, useAlert } from '../src/context/AlertContext'

function TestConsumer({ alertOptions }) {
  const { showAlert } = useAlert()
  return (
    <button type="button" onClick={() => showAlert(alertOptions)}>
      Disparar Alerta
    </button>
  )
}

describe('FloatingAlert Component & System', () => {
  it('renders correctly with title, message, and blurred backdrop without emojis', () => {
    const handleClose = vi.fn()
    const { container } = render(
      <FloatingAlert
        open={true}
        type="success"
        title="¡Reseña enviada correctamente!"
        message="Tu valoración ha sido publicada con éxito."
        onClose={handleClose}
      />
    )

    // Backdrop with blurred class
    expect(container.querySelector('.floating-alert-backdrop')).toBeTruthy()
    // Centered card
    expect(container.querySelector('.floating-alert-card')).toBeTruthy()
    // Check title and message
    expect(screen.getByText('¡Reseña enviada correctamente!')).toBeTruthy()
    expect(screen.getByText('Tu valoración ha sido publicada con éxito.')).toBeTruthy()

    // No emojis, uses SVG
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('handles close action button click and Escape key', () => {
    const handleClose = vi.fn()
    render(
      <FloatingAlert
        open={true}
        type="info"
        title="Solicitud aceptada"
        message="La propuesta ha comenzado su desarrollo."
        closeLabel="Cerrar ventana"
        onClose={handleClose}
      />
    )

    const closeBtn = screen.getByRole('button', { name: 'Cerrar ventana' })
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(2)
  })

  it('supports custom primary action buttons for proposal navigation', () => {
    const handleAction = vi.fn()
    const handleClose = vi.fn()

    render(
      <FloatingAlert
        open={true}
        type="success"
        title="¡Propuesta de comisión enviada correctamente!"
        message="Fondos asegurados en custodia Escrow."
        action={{ label: 'Ver mis solicitudes', onClick: handleAction }}
        onClose={handleClose}
      />
    )

    const actionBtn = screen.getByRole('button', { name: 'Ver mis solicitudes' })
    fireEvent.click(actionBtn)
    expect(handleAction).toHaveBeenCalledTimes(1)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('renders error variants properly with error icons and styles', () => {
    const { container } = render(
      <FloatingAlert
        open={true}
        type="error"
        title="Error al enviar una reseña"
        message="No se pudo procesar tu comentario."
      />
    )

    expect(container.querySelector('.floating-alert-error')).toBeTruthy()
    expect(screen.getByText('Error al enviar una reseña')).toBeTruthy()
    expect(screen.getByText('No se pudo procesar tu comentario.')).toBeTruthy()
  })

  it('works seamlessly through AlertContext and useAlert hook', () => {
    const { container } = render(
      <AlertProvider>
        <TestConsumer
          alertOptions={{
            type: 'success',
            title: 'Cambio de estado: ¡Entrega aprobada!',
            message: 'Los fondos han sido liberados.',
          }}
        />
      </AlertProvider>
    )

    expect(screen.queryByText('Cambio de estado: ¡Entrega aprobada!')).toBeNull()

    const triggerBtn = screen.getByRole('button', { name: 'Disparar Alerta' })
    fireEvent.click(triggerBtn)

    expect(screen.getByText('Cambio de estado: ¡Entrega aprobada!')).toBeTruthy()
    expect(container.querySelector('.floating-alert-backdrop')).toBeTruthy()

    const closeBtn = screen.getByRole('button', { name: 'Entendido' })
    fireEvent.click(closeBtn)

    expect(screen.queryByText('Cambio de estado: ¡Entrega aprobada!')).toBeNull()
  })
})
