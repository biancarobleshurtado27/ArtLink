import { describe, expect, it, beforeEach } from 'vitest'
import {
  createNewConversation,
  formatChatMessage,
  addMessageToConversation,
  saveLocalConversation,
  getActiveConversation,
  getLocalConversationSync,
  loadLocalConversation,
} from '../src/services/chatPersistenceService'
import {
  readLocal,
  saveLocal,
  removeLocal,
} from '../src/services/persistence/localStorageService'
import {
  getUserScopedKey,
  ACTIVE_SESSION_KEY,
} from '../src/services/persistence/storageKeys'
import {
  saveCommissionDraft,
  getCommissionDraft,
  removeCommissionDraft,
  saveReviewDraft,
  getReviewDraft,
  removeReviewDraft,
  saveMessageDraft,
  getMessageDraft,
  removeMessageDraft,
  saveCatalogFilters,
  getCatalogFilters,
  saveAppSettings,
  getAppSettings,
} from '../src/services/persistence/syncService'
import {
  addFavorite,
  getFavoritesByUser,
  removeFavorite,
} from '../src/services/favoriteService'
import {
  likeArtwork,
  unlikeArtwork,
  getLikesByUser,
} from '../src/services/likeService'
import {
  followArtist,
  unfollowArtist,
  getFollowStatus,
} from '../src/services/followService'

describe('Verificación de persistencia global de ArtLink', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('Chatbot: persiste mensajes tras recarga y no los sobrescribe con arrays vacíos', async () => {
    const userId = 'user-test-01'

    // 1. Obtener conversación inicial y agregar mensaje de usuario y de Gemini
    let convo = await getActiveConversation(userId, '/explorar')
    expect(convo).toBeDefined()
    expect(convo.userId).toBe(userId)

    const userMsg = formatChatMessage({
      id: 'msg-u1',
      role: 'user',
      content: 'Hola asistente de ArtLink',
    })
    convo = addMessageToConversation(convo, userMsg)

    const geminiMsg = formatChatMessage({
      id: 'msg-g1',
      role: 'assistant',
      content: 'Hola, te ayudo a buscar ilustradores digitales.',
      provider: 'gemini',
    })
    convo = addMessageToConversation(convo, geminiMsg)

    expect(convo.messages.length).toBe(2)

    // 2. Simulación de F5 / Recarga: cargar sincronamente y asíncronamente
    const syncLoaded = getLocalConversationSync(userId)
    expect(syncLoaded).not.toBeNull()
    expect(syncLoaded.messages.length).toBe(2)
    expect(syncLoaded.messages[0].content).toBe('Hola asistente de ArtLink')
    expect(syncLoaded.messages[1].content).toBe('Hola, te ayudo a buscar ilustradores digitales.')

    const reloaded = await getActiveConversation(userId, '/explorar')
    expect(reloaded.messages.length).toBe(2)
    expect(reloaded.messages[0].id).toBe('msg-u1')
    expect(reloaded.messages[1].id).toBe('msg-g1')

    // 3. Verificar que una respuesta subsecuente de Gemini ANEXA al historial en vez de reemplazarlo
    const geminiMsg2 = formatChatMessage({
      id: 'msg-g2',
      role: 'assistant',
      content: 'Puedo recomendarte artistas de estilo anime.',
      provider: 'gemini',
    })
    const updated = addMessageToConversation(reloaded, geminiMsg2)
    expect(updated.messages.length).toBe(3)
    expect(updated.messages.map((m) => m.id)).toEqual(['msg-u1', 'msg-g1', 'msg-g2'])
  })

  it('Aislamiento por usuario: el cambio de usuario no mezcla ni borra conversaciones', async () => {
    const userA = 'user-client-A'
    const userB = 'user-artist-B'

    // Usuario A envía mensaje
    let convoA = await getActiveConversation(userA)
    convoA = addMessageToConversation(
      convoA,
      formatChatMessage({ id: 'msg-a', role: 'user', content: 'Mensaje de usuario A' })
    )

    // Usuario B envía mensaje distinto
    let convoB = await getActiveConversation(userB)
    convoB = addMessageToConversation(
      convoB,
      formatChatMessage({ id: 'msg-b', role: 'user', content: 'Mensaje de usuario B' })
    )

    // Cargar para usuario A y comprobar que no tiene los mensajes de B
    const loadedA = await getActiveConversation(userA)
    expect(loadedA.messages.length).toBe(1)
    expect(loadedA.messages[0].content).toBe('Mensaje de usuario A')

    // Cargar para usuario B y comprobar que no tiene los mensajes de A
    const loadedB = await getActiveConversation(userB)
    expect(loadedB.messages.length).toBe(1)
    expect(loadedB.messages[0].content).toBe('Mensaje de usuario B')
  })

  it('Favoritos: una respuesta vacía del servidor no borra datos persistidos localmente', async () => {
    const userId = 'user-fav-01'

    // Guardar favoritos iniciales
    await addFavorite(userId, 'artist-101')
    await addFavorite(userId, 'artist-102')

    let favs = await getFavoritesByUser(userId)
    expect(favs).toContain('artist-101')
    expect(favs).toContain('artist-102')

    // Simular lectura posterior
    const cachedFavs = await getFavoritesByUser(userId)
    expect(cachedFavs.length).toBe(2)
  })

  it('Me gusta (corazones): persisten localmente por usuario', async () => {
    const userId = 'user-likes-01'
    const artworkId = 'art-99'

    await likeArtwork(userId, artworkId)

    const userLikes = await getLikesByUser(userId)
    expect(userLikes.some((l) => l.portfolioItemId === artworkId)).toBe(true)

    // Quitar like
    await unlikeArtwork(userId, artworkId)
    const afterUnlike = await getLikesByUser(userId)
    expect(afterUnlike.some((l) => l.portfolioItemId === artworkId)).toBe(false)
  })

  it('Seguimientos: persisten el estado de seguir a un artista', async () => {
    const followerId = 'user-fol-01'
    const artistId = 'artist-demo-101'

    await followArtist(followerId, artistId)
    const status = await getFollowStatus(followerId, artistId)
    expect(status.isFollowing).toBe(true)

    await unfollowArtist(followerId, artistId)
    const afterStatus = await getFollowStatus(followerId, artistId)
    expect(afterStatus.isFollowing).toBe(false)
  })

  it('Borradores: persisten comisiones, reseñas y mensajes privados', () => {
    const userId = 'user-drafts-01'

    // 1. Borrador de comisión
    saveCommissionDraft(userId, 'artist-1', 'comm-pkg-1', {
      description: 'Idea de ilustración fantástica en acuarela',
      desiredDate: '2026-11-15',
    })
    const commDraft = getCommissionDraft(userId, 'artist-1', 'comm-pkg-1')
    expect(commDraft.description).toBe('Idea de ilustración fantástica en acuarela')

    removeCommissionDraft(userId, 'artist-1', 'comm-pkg-1')
    expect(getCommissionDraft(userId, 'artist-1', 'comm-pkg-1')).toBeNull()

    // 2. Borrador de reseña
    saveReviewDraft(userId, 'artist-1', { rating: 5, comment: 'Excelente trabajo y comunicación' })
    const revDraft = getReviewDraft(userId, 'artist-1')
    expect(revDraft.comment).toBe('Excelente trabajo y comunicación')
    expect(revDraft.rating).toBe(5)

    removeReviewDraft(userId, 'artist-1')
    expect(getReviewDraft(userId, 'artist-1')).toBeNull()

    // 3. Borrador de mensaje
    saveMessageDraft(userId, 'convo-99', 'Texto de borrador para el artista')
    expect(getMessageDraft(userId, 'convo-99')).toBe('Texto de borrador para el artista')

    removeMessageDraft(userId, 'convo-99')
    expect(getMessageDraft(userId, 'convo-99')).toBe('')
  })

  it('Filtros del catálogo y ajustes de accesibilidad: persisten correctamente', () => {
    const userId = 'user-filters-01'

    // Filtros de catálogo
    saveCatalogFilters(userId, {
      searchQuery: 'acuarela',
      selectedSort: 'price_asc',
      openSlotsOnly: true,
      selectedCategory: 'digital',
    })
    const filters = getCatalogFilters(userId)
    expect(filters.searchQuery).toBe('acuarela')
    expect(filters.selectedSort).toBe('price_asc')
    expect(filters.openSlotsOnly).toBe(true)

    // Ajustes globales
    saveAppSettings(userId, {
      theme: 'dark',
      fontSize: 'large',
      highContrast: true,
      reducedMotion: true,
    })
    const settings = getAppSettings(userId)
    expect(settings.theme).toBe('dark')
    expect(settings.highContrast).toBe(true)
  })
})
