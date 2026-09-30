import axios from 'axios'

const articClient = axios.create({ baseURL: 'https://api.artic.edu/api/v1' })

export async function fetchArticArtworks(query = 'impressionism', limit = 10) {
  try {
    const { data } = await articClient.get(`/artworks/search?q=${query}&limit=${limit}&fields=id,title,artist_display,artist_title,date_display,image_id,credit_line,is_public_domain,medium_display,artist_id`)
    return data.data
  } catch (error) {
    console.error('Error in artApiService:', error)
    return []
  }
}
