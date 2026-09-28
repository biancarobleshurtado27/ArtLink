import { useEffect, useRef, useState } from 'react'
import { CheckCheck, Clock, MessageSquare, Send, User } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import DecorativeStar from '../components/DecorativeStar'
import usePrivateRequests from '../hooks/usePrivateRequests'
import useAuth from '../hooks/useAuth'

function formatMessageTime(isoString) {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString.slice(0, 16).replace('T', ' ')
  }
}

export default function MessagesPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { requests, messages, loading, error, loadMessages, sendMessage } = usePrivateRequests()
  const [selectedId, setSelectedId] = useState(searchParams.get('requestId') || '')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const messageListRef = useRef(null)

  const activeRequestId = selectedId || requests[0]?.id || ''
  const selected = requests.find((request) => request.id === activeRequestId)

  // Asegurar que al entrar a la página comience arriba
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    if (selected) {
      loadMessages(selected)
    }
  }, [selected, loadMessages])

  // Desplazamiento automático al final de la lista de mensajes sin desplazar la ventana
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }
  }, [messages])

  if (loading) return <LoadingState label="Cargando tus conversaciones de ArtLink..." />
  if (error) return <ErrorState message={error.message} />

  if (!requests.length) {
    return (
      <section className="messages-page" aria-labelledby="messages-title">
        <div className="messages-header-top">
          <span className="sticker sticker-purple" style={{ display: 'inline-flex', marginBottom: '0.4rem' }}>
            <DecorativeStar size={12} color="#1E192B" /> CANAL SEGURO DE COMUNICACIÓN
          </span>
          <h1 id="messages-title">Mensajes</h1>
        </div>
        <EmptyState
          title="No tienes conversaciones activas"
          description="Las conversaciones se crean automáticamente cuando envías o recibes una propuesta de comisión."
        />
      </section>
    )
  }

  async function submit(event) {
    event.preventDefault()
    if (!selected || !body.trim() || sending) return
    setSending(true)
    const text = body.trim()
    try {
      const recipientId = user.id === selected.clientId ? selected.artistId : selected.clientId
      await sendMessage(selected, text, recipientId)
      setBody('')
    } catch (err) {
      console.error('Error al enviar mensaje:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="messages-page" aria-labelledby="messages-title">
      <div className="messages-header-top">
        <span className="sticker sticker-purple" style={{ display: 'inline-flex', marginBottom: '0.4rem' }}>
          <DecorativeStar size={12} color="#1E192B" /> CANAL SEGURO DE COMUNICACIÓN
        </span>
        <h1 id="messages-title">Mensajes</h1>
      </div>

      <div className="messages-layout">
        {/* Listado de Conversaciones del Usuario */}
        <aside className="conversation-list messages-list" aria-label="Lista de conversaciones activas">
          <div className="conversation-list-header">
            <span>Conversaciones ({requests.length})</span>
          </div>
          <div className="conversation-items">
            {requests.map((request) => {
              const isSelected = request.id === activeRequestId
              return (
                <button
                  className={`conversation-item ${isSelected ? 'is-active' : ''}`}
                  type="button"
                  key={request.id}
                  onClick={() => setSelectedId(request.id)}
                >
                  <div className="item-top">
                    <span className="item-id">Encargo #{request.id.slice(-5)}</span>
                    <span className="item-badge">{request.status}</span>
                  </div>
                  <strong className="item-title">{request.description}</strong>
                  <span className="item-meta">${request.budget} USD · {request.desiredDate}</span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Panel Principal de Chat */}
        <section className="chat-panel message-thread" aria-label="Panel de conversación">
          {!selected ? (
            <EmptyState
              title="Selecciona una conversación"
              description="Elige un encargo de la lista para ver el historial de mensajes."
            />
          ) : (
            <>
              <header className="chat-panel-header">
                <div>
                  <h2>{selected.description}</h2>
                  <span className="chat-sub">
                    Encargo #{selected.id} · Presupuesto: ${selected.budget} USD
                  </span>
                </div>
                <div className="chat-role-indicator">
                  <User size={14} aria-hidden="true" /> {user.id === selected.clientId ? 'Cliente' : 'Artista'}
                </div>
              </header>

              <div className="message-list" ref={messageListRef}>
                {messages.length ? (
                  messages.map((message) => {
                    const isMine = message.senderId === user.id
                    const senderLabel = isMine
                      ? 'Tú'
                      : user.id === selected.clientId
                      ? 'Artista'
                      : 'Cliente'

                    return (
                      <article
                        className={`message-bubble ${isMine ? 'mine' : 'other'}`}
                        key={message.id}
                      >
                        <div className="message-sender-bar">
                          <span className="sender-name">{senderLabel}</span>
                          <span className="message-time">{formatMessageTime(message.createdAt)}</span>
                        </div>
                        <p className="message-body-text">{message.body}</p>
                        <div className="message-status-bar">
                          {isMine && (
                            <span className={`read-indicator ${message.read ? 'is-read' : 'sent'}`}>
                              {message.read ? (
                                <>
                                  <CheckCheck size={13} aria-hidden="true" /> Leído
                                </>
                              ) : (
                                <>
                                  <Clock size={13} aria-hidden="true" /> Enviado
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </article>
                    )
                  })
                ) : (
                  <div className="empty-chat-prompt">
                    <MessageSquare size={36} className="empty-chat-icon" />
                    <p><strong>Aún no hay mensajes en este encargo</strong></p>
                    <small>Utiliza este canal seguro para coordinar referencias visuales, bocetos y entregas finales.</small>
                  </div>
                )}
              </div>

              <form className="message-form" onSubmit={submit}>
                <label className="sr-only" htmlFor="message-body">Escribe tu mensaje</label>
                <input
                  id="message-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Escribe un mensaje respecto al encargo..."
                  disabled={sending}
                  autoComplete="off"
                />
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={sending || !body.trim()}
                  aria-label="Enviar mensaje"
                >
                  <Send size={16} aria-hidden="true" />
                  <span>Enviar</span>
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </section>
  )
}
