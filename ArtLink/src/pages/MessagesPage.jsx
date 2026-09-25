import { useEffect, useState, useRef } from 'react'
import { Send, CheckCheck, Clock, User, MessageSquare } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
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
  const chatBottomRef = useRef(null)

  const activeRequestId = selectedId || requests[0]?.id || ''
  const selected = requests.find((request) => request.id === activeRequestId)

  useEffect(() => {
    if (selected) {
      loadMessages(selected)
    }
  }, [selected, loadMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) return <LoadingState label="Cargando tus conversaciones..." />
  if (error) return <ErrorState message={error.message} />
  if (!requests.length) {
    return (
      <section className="messages-page">
        <div className="messages-header-top">
          <p className="eyebrow">ArtLink / Chat</p>
          <h1>Mensajes</h1>
        </div>
        <EmptyState
          title="No tienes mensajes o conversaciones activas"
          description="Las conversaciones se habilitan automáticamente cuando creas o recibes una solicitud de comisión."
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
      const recipientId = user.role === 'cliente' ? selected.artistId : selected.clientId
      await sendMessage(selected, text, recipientId)
      setBody('')
    } catch (err) {
      console.error('Error enviando mensaje:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="messages-page" aria-labelledby="messages-title">
      <div className="messages-header-top">
        <p className="eyebrow">ArtLink / Centro de mensajes</p>
        <h1 id="messages-title">Mensajes privados</h1>
      </div>

      <div className="messages-layout">
        {/* Lista de solicitudes / conversaciones */}
        <aside className="conversation-list" aria-label="Lista de conversaciones">
          <div className="conversation-list-header">
            <span>Conversaciones ({requests.length})</span>
          </div>
          <div className="conversation-items">
            {requests.map((request) => {
              const isSelected = request.id === selectedId
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

        {/* Panel principal de chat */}
        <section className="chat-panel" aria-label="Panel de mensajería">
          {!selected ? (
            <EmptyState
              title="Selecciona una conversación"
              description="Elige una solicitud de la lista lateral para ver los mensajes."
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
                  <User size={14} /> Rol: {user.role === 'cliente' ? 'Cliente' : 'Artista'}
                </div>
              </header>

              <div className="message-list">
                {messages.length ? (
                  messages.map((message) => {
                    const isMine = message.senderId === user.id
                    const senderLabel = isMine ? 'Tú' : (user.role === 'cliente' ? 'Artista' : 'Cliente')
                    
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
                    <small>Utiliza este canal para coordinar borradores, paleta de colores y detalles finales.</small>
                  </div>
                )}
                <div ref={chatBottomRef} />
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

