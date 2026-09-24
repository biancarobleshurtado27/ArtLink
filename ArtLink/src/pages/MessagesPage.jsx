import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import usePrivateRequests from '../hooks/usePrivateRequests'
import useAuth from '../hooks/useAuth'

export default function MessagesPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { requests, messages, loading, error, loadMessages, sendMessage } = usePrivateRequests()
  const [selectedId, setSelectedId] = useState(searchParams.get('requestId') || '')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const selected = requests.find((request) => request.id === selectedId)

  useEffect(() => {
    if (selected) loadMessages(selected)
  }, [selected, loadMessages])

  if (loading) return <LoadingState label="Cargando conversaciones" />
  if (error) return <ErrorState message={error.message} />
  if (!requests.length) return (
    <EmptyState
      title="No tienes conversaciones"
      description="Las conversaciones aparecerán asociadas a tus solicitudes."
    />
  )

  async function submit(event) {
    event.preventDefault()
    if (!selected || !body.trim() || sending) return
    setSending(true)
    try {
      const recipientId = user.role === 'cliente' ? selected.artistId : selected.clientId
      await sendMessage(selected, body.trim(), recipientId)
      setBody('')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="messages-page" aria-labelledby="messages-title">
      <p className="eyebrow">ArtLink / conversación</p>
      <h1 id="messages-title">Mensajes</h1>
      <div className="messages-layout">
        {/* Lista de solicitudes */}
        <aside className="conversation-list" aria-label="Solicitudes con conversación">
          {requests.map((request) => (
            <button
              className={request.id === selectedId ? 'is-active' : ''}
              type="button"
              key={request.id}
              onClick={() => setSelectedId(request.id)}
            >
              {request.description.slice(0, 42)}
            </button>
          ))}
        </aside>

        {/* Panel de chat */}
        <section className="chat-panel" aria-label="Chat de solicitud">
          {!selected ? (
            <EmptyState
              title="Selecciona una solicitud"
              description="Solo puedes abrir conversaciones propias."
            />
          ) : (
            <>
              <header>
                <h2>{selected.description.slice(0, 55)}</h2>
                <span>Solicitud {selected.id}</span>
              </header>
              <div className="message-list">
                {messages.length ? (
                  messages.map((message) => (
                    <article
                      className={`message-bubble ${message.senderId === user.id ? 'mine' : ''}`}
                      key={message.id}
                    >
                      <p>{message.body}</p>
                      <small>
                        {message.createdAt.slice(0, 16).replace('T', ' ')} · {message.read ? 'Leído' : 'No leído'}
                      </small>
                    </article>
                  ))
                ) : (
                  <EmptyState title="Sin mensajes todavía" description="Sé la primera persona en escribir." />
                )}
              </div>
              <form className="message-form" onSubmit={submit}>
                <label className="sr-only" htmlFor="message-body">Escribe un mensaje</label>
                <input
                  id="message-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  disabled={sending}
                />
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={sending || !body.trim()}
                  aria-label="Enviar mensaje"
                >
                  <Send size={17} aria-hidden="true" />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </section>
  )
}
