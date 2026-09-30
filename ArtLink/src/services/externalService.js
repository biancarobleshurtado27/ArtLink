import axios from 'axios'

const articClient = axios.create({ baseURL: 'https://api.artic.edu/api/v1' })
const quotesClient = axios.create({ baseURL: 'https://dummyjson.com' })

export async function getRandomInspiration() {
  try {
    const { data } = await quotesClient.get('/quotes/random')
    return data
  } catch (error) {
    console.error('Error fetching inspiration:', error)
    return { quote: "Sigue creando, el mundo necesita tu arte.", author: "ArtLink" }
  }
}

export async function getExternalArtists() {
  try {
    const { data: response } = await articClient.get('/artworks/search?q=impressionism&limit=10&fields=id,title,artist_display,artist_title,date_display,image_id,credit_line,is_public_domain,medium_display')
    
    return response.data.filter(item => item.image_id && item.artist_title).map(item => {
      let nationality = "Desconocida"
      let birthDate = ""
      let deathDate = ""
      
      const artistDisplay = item.artist_display || ""
      const match = artistDisplay.match(/\(([^,]+)(?:,\s*(\d+)[-–](\d+))?\)/)
      if (match) {
        nationality = match[1] || "Desconocida"
        birthDate = match[2] || ""
        deathDate = match[3] || ""
      }
      
      return {
        source: "external",
        sourceName: "Art Institute of Chicago",
        sourceUrl: `https://www.artic.edu/artworks/${item.id}`,
        name: item.artist_title,
        biography: `Artista histórico. ${artistDisplay}`,
        nationality,
        birthDate,
        deathDate,
        artworks: [{
          title: item.title,
          imageUrl: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
          date: item.date_display,
          medium: item.medium_display
        }],
        imageUrl: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
        creditLine: item.credit_line,
        license: item.is_public_domain ? 'Public Domain' : 'Copyrighted'
      }
    })
  } catch (error) {
    console.error('Error fetching external artists:', error)
    return []
  }
}
