import { fetchArticArtworks } from './artApiService'

export async function getRealExternalArtists() {
  const items = await fetchArticArtworks('impressionism', 10)
  return items.filter(item => item.image_id && item.artist_title).map(item => {
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
      id: `ext-${item.artist_id || item.id}`,
      source: "external",
      sourceName: "Art Institute of Chicago",
      sourceUrl: `https://www.artic.edu/artworks/${item.id}`,
      name: item.artist_title,
      biography: `Artista histórico de la colección del Art Institute of Chicago. ${artistDisplay}`,
      nationality,
      birthDate,
      deathDate,
      artworks: [{
        id: `art-${item.id}`,
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
}

export async function getRealArtistProfile(artistId) {
  const profiles = await getDemoArtistProfiles()
  const profile = profiles.find(p => p.id === artistId)
  if (!profile) throw new Error("Artista no encontrado")
  return profile
}

export async function getRealArtistPortfolio(artistId) {
  const allItems = await getDemoPortfolioItems()
  return allItems.filter(item => item.artistId === artistId)
}

export async function getDemoArtistProfiles() {
  const items = await fetchArticArtworks('impressionism', 3)
  return items.filter(item => item.image_id && item.artist_title).map(primary => {
    const artistDisplay = primary.artist_display || ""
    return {
      id: `ext-${primary.artist_id || primary.id}`,
      displayName: primary.artist_title,
      username: primary.artist_title.replace(/\s+/g, '').toLowerCase(),
      avatar: `https://www.artic.edu/iiif/2/${primary.image_id}/full/843,/0/default.jpg`,
      banner: `https://www.artic.edu/iiif/2/${primary.image_id}/full/843,/0/default.jpg`,
      bio: `MODO DEMOSTRACIÓN: Perfil visual generado con datos de dominio público del Art Institute of Chicago. ${artistDisplay}`,
      disciplines: ['Demostración', 'Arte Histórico'],
      styles: [primary.medium_display || 'Tradicional'],
      location: 'Dominio Público',
      availability: 'open',
      slots: 5,
      rating: 5.0,
      verified: false,
      basePrice: 150, // Added base price
      isDemo: true,
      demoDisclaimer: "Este es un perfil generado para propósitos de demostración visual. El artista no es usuario de ArtLink y esta no es una oferta comercial real.",
      socialLinks: {
        artic: `https://www.artic.edu/artworks/${primary.id}`
      }
    }
  })
}

export async function getDemoPortfolioItems() {
  const items = await fetchArticArtworks('impressionism', 3)
  const portfolio = []
  
  items.filter(i => i.image_id).forEach(item => {
    // Generar 3 obras por artista para rellenar los thumbnails
    for (let i = 1; i <= 3; i++) {
      portfolio.push({
        id: `art-${item.id}-${i}`,
        artistId: `ext-${item.artist_id || item.id}`,
        title: `${item.title} (Vista ${i})`,
        category: 'Histórico',
        image: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
        likes: 20 * i,
        description: `MODO DEMOSTRACIÓN: Obra original "${item.title}". ${item.credit_line}`
      })
    }
  })
  
  return portfolio
}

export async function getRealArtistCommissions(artistId) {
  return [
    {
      id: `comm-demo-1`,
      title: "DEMO: Retrato Histórico",
      description: "ESTA ES UNA SIMULACIÓN. No se realizará ningún cobro. Ejemplo visual de cómo se ve una comisión de retrato.",
      price: 150,
      deliveryDays: 14,
      revisions: 1,
      includes: "Solo Demostración",
      featured: true,
      category: "SIMULACIÓN DE ENCARGO"
    },
    {
      id: `comm-demo-2`,
      title: "DEMO: Composición Completa",
      description: "ESTA ES UNA SIMULACIÓN. Ejemplo visual de paquete avanzado.",
      price: 350,
      deliveryDays: 30,
      revisions: 3,
      includes: "Solo Demostración",
      featured: false,
      category: "SIMULACIÓN DE ENCARGO"
    }
  ]
}

export async function getRealArtistReviews(artistId) {
  return [
    {
      id: 'rev-demo-1',
      clientName: "Usuario de Demostración",
      clientAvatar: "https://i.pravatar.cc/150?img=10",
      commissionTitle: "DEMOSTRACIÓN DE COMISIÓN",
      rating: 5,
      comment: "Esta reseña es un marcador de posición para demostrar cómo se verían los comentarios en un perfil verificado de un artista real.",
      createdAt: new Date().toISOString()
    }
  ]
}
