import { useState } from 'react'
import { AlertCircle, Volume2, VolumeX } from 'lucide-react'

export default function ReadAloudButton({ textToRead, label = 'Escuchar texto en voz alta' }) {
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [errorMsg, setErrorMsg] = useState('')

  function handleToggleRead() {
    if (!supported || !('speechSynthesis' in window)) {
      setErrorMsg('Tu navegador no soporta la lectura por voz sintetizada (Web Speech API).')
      return
    }

    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.lang = 'es-ES'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => {
      setSpeaking(false)
      setErrorMsg('Ocurrió un inconveniente con la lectura de voz.')
    }

    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  if (!supported) {
    return (
      <div className="speech-unsupported-note" role="status" aria-live="polite">
        <AlertCircle size={14} aria-hidden="true" />
        <small>Síntesis de voz opcional no disponible en este navegador.</small>
      </div>
    )
  }

  return (
    <div className="read-aloud-container">
      <button
        type="button"
        className={`button button-small ${speaking ? 'button-mint' : 'button-outline'}`}
        onClick={handleToggleRead}
        aria-label={speaking ? 'Detener lectura en voz alta' : label}
        title={speaking ? 'Detener lectura' : label}
      >
        {speaking ? <VolumeX size={15} aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}
        <span>{speaking ? 'Detener lectura' : 'Escuchar texto'}</span>
      </button>
      {errorMsg && (
        <span className="field-error" role="alert">
          {errorMsg}
        </span>
      )}
    </div>
  )
}
