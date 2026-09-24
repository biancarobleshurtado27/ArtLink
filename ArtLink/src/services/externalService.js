import axios from 'axios'

const quotesClient = axios.create({ baseURL: 'https://dummyjson.com' })

export async function getRandomInspiration() {
  try {
    const { data } = await quotesClient.get('/quotes/random')
    return data
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Error de red'
    throw new Error(`No se pudo obtener la frase de inspiración: ${message}`, { cause: error })
  }
}
