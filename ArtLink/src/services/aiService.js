import axios from 'axios'

const responseShape = {
  summary: '',
  suggestedFilters: { disciplines: [], styles: [], maxPrice: null, availability: '' },
  explanation: '',
}

const fallbackResponse = (input) => {
  const text = input.toLocaleLowerCase()
  const disciplineRules = [
    { match: ['ilustración', 'ilustracion', 'dibujo'], value: 'Ilustración 2D' },
    { match: ['3d', 'modelado', 'render'], value: 'Modelado 3D' },
    { match: ['animación', 'animacion', 'motion'], value: 'Animación' },
    { match: ['pixel'], value: 'Pixel Art' },
    { match: ['emote', 'emotes'], value: 'Emotes' },
  ]
  const styleRules = ['fantasía', 'fantasia', 'anime', 'editorial', 'minimalista', 'realista', 'colorido']
  const discipline = disciplineRules.find((rule) => rule.match.some((term) => text.includes(term)))?.value
  const style = styleRules.find((term) => text.includes(term))
  const budgetMatch = text.match(/(?:presupuesto|budget|hasta|maximo|máximo)\D{0,12}(\d+(?:[.,]\d+)?)/i)
  const maxPrice = budgetMatch ? Number(budgetMatch[1].replace(',', '.')) : null
  const availability = text.includes('espera') ? 'waitlist' : text.includes('cerrad') ? 'closed' : 'open'
  const disciplines = discipline ? [discipline] : []
  const styles = style ? [style.charAt(0).toUpperCase() + style.slice(1)] : []
  return {
    ...responseShape,
    summary: discipline || style || maxPrice ? 'He convertido tu idea en filtros para encontrar artistas compatibles.' : 'Cuéntame qué disciplina, estilo y presupuesto tienes en mente.',
    suggestedFilters: { disciplines, styles, maxPrice, availability },
    explanation: 'Modo demostración: esta sugerencia se genera localmente con reglas deterministas y es orientativa. No realiza compras, reservas ni operaciones externas.',
    mode: 'demo',
  }
}

function validateResponse(value) {
  if (!value || typeof value !== 'object') throw new Error('La respuesta de IA no tiene un formato válido.')
  const filters = value.suggestedFilters
  if (typeof value.summary !== 'string' || typeof value.explanation !== 'string' || !filters || !Array.isArray(filters.disciplines) || !Array.isArray(filters.styles)) throw new Error('La respuesta de IA está incompleta.')
  return {
    summary: value.summary,
    suggestedFilters: {
      disciplines: filters.disciplines.filter((item) => typeof item === 'string'),
      styles: filters.styles.filter((item) => typeof item === 'string'),
      maxPrice: Number.isFinite(Number(filters.maxPrice)) ? Number(filters.maxPrice) : null,
      availability: ['open', 'waitlist', 'closed'].includes(filters.availability) ? filters.availability : '',
    },
    explanation: value.explanation,
    mode: 'ai',
  }
}

function parsePayload(payload) {
  const candidate = typeof payload === 'string' ? JSON.parse(payload) : payload?.result || payload?.output || payload
  return validateResponse(candidate)
}

export async function interpretNeed(input) {
  const text = input.trim()
  if (!text) throw new Error('Escribe una necesidad para que pueda interpretarla.')
  const apiUrl = import.meta.env.VITE_AI_API_URL
  const apiKey = import.meta.env.VITE_AI_API_KEY
  if (!apiUrl || !apiKey) return fallbackResponse(text)
  try {
    const prompt = `Interpreta esta necesidad de un cliente de ArtLink: "${text}". Responde exclusivamente JSON válido con este formato: ${JSON.stringify(responseShape)}. disciplines y styles deben ser arrays, maxPrice un número o null y availability uno de open, waitlist, closed o cadena vacía. No inventes compras, reservas ni operaciones externas.`
    const { data } = await axios.post(apiUrl, { prompt }, { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } })
    return parsePayload(data)
  } catch (error) {
    throw new Error(`No pudimos interpretar tu necesidad: ${error.response?.data?.message || error.message}`, { cause: error })
  }
}

export { fallbackResponse, validateResponse }
