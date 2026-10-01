import { useEffect, useRef, useState } from 'react'
import {
  Share2,
  Copy,
  Check,
  Mail,
  Send,
  MessageCircle,
} from 'lucide-react'

// Iconos SVG limpios para redes sociales sin dependencias externas
function XTwitterIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export default function ShareMenu({
  title = 'ArtLink',
  text = 'Descubre este perfil en ArtLink',
  url,
  buttonClassName = 'artist-v2-social-btn',
  buttonLabel = 'Compartir',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  async function handleTriggerClick() {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        })
        return
      } catch (err) {
        if (err.name !== 'AbortError') {
          setIsOpen((prev) => !prev)
        }
        return
      }
    }
    setIsOpen((prev) => !prev)
  }

  // Cerrar al pulsar Escape o al hacer clic fuera
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) && !triggerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(text)
  const encodedTitle = encodeURIComponent(title)

  const shareChannels = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
      icon: <MessageCircle size={16} aria-hidden="true" />,
      color: '#25D366',
    },
    {
      name: 'X / Twitter',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: <XTwitterIcon size={15} />,
      color: '#000000',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FacebookIcon size={16} />,
      color: '#1877F2',
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      icon: <Send size={15} aria-hidden="true" />,
      color: '#229ED9',
    },
    {
      name: 'Correo electrónico',
      href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`,
      icon: <Mail size={16} aria-hidden="true" />,
      color: '#4B5563',
    },
  ]

  return (
    <div className="share-menu-container" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        type="button"
        className={buttonClassName}
        onClick={handleTriggerClick}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={buttonLabel}
        title={buttonLabel}
      >
        <Share2 size={15} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="share-dropdown-menu"
          aria-label="Opciones para compartir"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 100,
            minWidth: '220px',
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '2px solid #1E192B',
            boxShadow: '4px 4px 0px #1E192B',
            padding: '0.6rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ padding: '0.25rem 0.5rem', borderBottom: '1px solid #E5E7EB', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>
              Compartir enlace
            </span>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={copyToClipboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem 0.65rem',
              borderRadius: '8px',
              border: '1.5px solid #1E192B',
              background: copied ? '#DCFCE7' : '#F9FAFB',
              color: copied ? '#166534' : '#1E192B',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? 'Enlace copiado' : 'Copiar enlace'}
            </span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
            {shareChannels.map((channel) => (
              <a
                key={channel.name}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  color: '#1E192B',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ color: channel.color, display: 'flex', alignItems: 'center' }}>
                  {channel.icon}
                </span>
                <span>{channel.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
