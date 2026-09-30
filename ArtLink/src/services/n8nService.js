import axios from 'axios'

const isExplicitlyDisabled = import.meta.env.VITE_N8N_ENABLED === 'false'

const DEFAULT_WEBHOOK_REGISTRO = '/n8n-proxy/webhook/artlink-registro-usuario'
const DEFAULT_WEBHOOK_SOLICITUD = '/n8n-proxy/webhook/artlink-solicitud-comision'

const WEBHOOK_REGISTRO = import.meta.env.VITE_N8N_WEBHOOK_REGISTRO || DEFAULT_WEBHOOK_REGISTRO
const WEBHOOK_SOLICITUD = import.meta.env.VITE_N8N_WEBHOOK_SOLICITUD || DEFAULT_WEBHOOK_SOLICITUD

/**
 * Comprueba si N8N está habilitado.
 */
export function isN8nConfigured() {
  return !isExplicitlyDisabled
}

/**
 * Consulta la disponibilidad de la instancia local de N8N a través del proxy.
 */
export async function checkN8nHealth() {
  try {
    const res = await axios.get('/n8n-proxy/healthz', { timeout: 2000 })
    return res.data?.status === 'ok'
  } catch {
    return false
  }
}

/**
 * Realiza una petición POST a un webhook de N8N.
 * Conmuta automáticamente entre /webhook-test/ y /webhook/ para soportar
 * tanto el modo prueba interactivo como el modo de producción activo.
 */
async function postToN8nWebhook(targetUrl, payload) {
  const alternateUrl = targetUrl.includes('/webhook-test/')
    ? targetUrl.replace('/webhook-test/', '/webhook/')
    : targetUrl.replace('/webhook/', '/webhook-test/')

  try {
    const res = await axios.post(targetUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 8000,
    })
    return res.data
  } catch (primaryError) {
    if (primaryError.response?.status === 404) {
      try {
        const altRes = await axios.post(alternateUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 8000,
        })
        return altRes.data
      } catch (altError) {
        if (altError.response?.status === 404) {
          throw new Error(
            'El webhook de N8N no está escuchando. En N8N: haz clic en "Execute workflow" para escuchar en modo prueba o activa el interruptor "Active" arriba a la derecha.',
            { cause: altError }
          )
        }
        throw altError
      }
    }
    throw primaryError
  }
}

/**
 * Envía el registro de un nuevo usuario al webhook de N8N.
 */
export async function registerUserViaN8n(userData) {
  return postToN8nWebhook(WEBHOOK_REGISTRO, userData)
}

/**
 * Envía la propuesta de comisión al webhook de N8N.
 */
export async function createCommissionRequestViaN8n(requestData) {
  return postToN8nWebhook(WEBHOOK_SOLICITUD, requestData)
}
