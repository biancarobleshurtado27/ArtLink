import { useId, useRef, useState } from 'react'
import { ImageOff, Trash2, Upload } from 'lucide-react'
import { handleImageError } from '../../utils/imageFallback'
import {
  AVATAR_MAX_BYTES,
  BANNER_MAX_BYTES,
  IMAGE_ACCEPT_ATTRIBUTE,
  formatBytes,
  readImageFileAsDataUrl,
} from '../../utils/imageFile'

const SIZE_BY_SHAPE = {
  avatar: AVATAR_MAX_BYTES,
  banner: BANNER_MAX_BYTES,
}

/**
 * Selector de imagenes basado en un input[type="file"] real.
 * Permite elegir la foto de perfil o el banner desde la computadora, el telefono
 * o la galeria del dispositivo. Nunca genera ni reemplaza la imagen elegida.
 */
export default function ImagePickerField({
  id,
  label,
  value = '',
  onChange,
  shape = 'banner',
  hint = '',
  previewAlt = '',
  initials = '',
  disabled = false,
}) {
  const generatedId = useId()
  const inputId = id || `image-picker-${generatedId}`
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  const maxBytes = SIZE_BY_SHAPE[shape] || BANNER_MAX_BYTES
  const isCircle = shape === 'avatar'

  function openFileDialog() {
    setError('')
    inputRef.current?.click()
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    // Permite volver a elegir el mismo archivo mas de una vez.
    event.target.value = ''
    if (!file) return

    try {
      const dataUrl = await readImageFileAsDataUrl(file, { maxBytes })
      onChange?.(dataUrl)
      setFileName(file.name || '')
      setError('')
    } catch (readError) {
      setFileName('')
      setError(readError.message || 'No se pudo cargar la imagen.')
    }
  }

  function handleClear() {
    onChange?.('')
    setFileName('')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={`studio-image-picker is-${shape}`}>
      <span className="studio-image-picker-label">{label}</span>

      <div className="studio-image-picker-body">
        <div className="studio-image-picker-preview">
          {value ? (
            <img
              className="studio-image-picker-img"
              src={value}
              alt={previewAlt || label}
              onError={handleImageError}
            />
          ) : (
            <span className="studio-image-picker-empty">
              {isCircle && initials
                ? initials
                : <ImageOff size={22} aria-hidden="true" />}
            </span>
          )}
        </div>

        <div className="studio-image-picker-controls">
          <div className="studio-image-picker-actions">
            <button
              type="button"
              className="studio-chip-btn"
              onClick={openFileDialog}
              disabled={disabled}
            >
              <Upload size={13} aria-hidden="true" />
              <span>Subir imagen</span>
            </button>

            {value && (
              <button
                type="button"
                className="studio-btn-delete-banner"
                onClick={handleClear}
                disabled={disabled}
              >
                <Trash2 size={13} aria-hidden="true" />
                <span>Quitar</span>
              </button>
            )}
          </div>

          <p className="studio-image-picker-hint">
            {hint || `Elige un archivo desde tu computadora, telefono o galeria. JPG, PNG, WebP o GIF hasta ${formatBytes(maxBytes)}.`}
          </p>

          {fileName && (
            <p className="studio-image-picker-filename">Archivo seleccionado: {fileName}</p>
          )}

          {error && (
            <p className="studio-image-picker-error" role="alert">
              {error}
            </p>
          )}

          <input
            ref={inputRef}
            id={inputId}
            name={inputId}
            type="file"
            aria-label={`${label}: seleccionar archivo de imagen desde tu dispositivo`}
            accept={IMAGE_ACCEPT_ATTRIBUTE}
            className="studio-image-picker-input"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}