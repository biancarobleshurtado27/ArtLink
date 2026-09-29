import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  Heart,
  Bookmark,
  Sparkles,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { handleImageError } from '../utils/imageFallback'

const CATEGORIES = [
  { id: 'all', label: 'Todas las Obras', count: '4.2k' },
  { id: '2d', label: 'Ilustración 2D', count: '1.8k obras' },
  { id: '3d', label: 'Modelado 3D & CG', count: '940 obras' },
  { id: 'animation', label: 'Animación & Rigging', count: '420 obras' },
  { id: 'concept', label: 'Concept Art & Dev', count: '610 obras' },
  { id: 'pixel', label: 'Pixel Art & Game', count: '380 obras' },
  { id: 'chibi', label: 'Chibi & Emotes', count: '520 obras' },
]

const FEATURED_ARTISTS = [
  {
    id: 'artist-001',
    name: 'Renzo Miyazaki',
    tag: 'Anime Mecha & Cyberpunk',
    badge: 'Cupos abiertos · 2 libres',
    badgeClass: 'badge-mint',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    price: 85,
    thumbs: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'artist-002',
    name: 'Sora Lin',
    tag: 'Chibi & Twitch Emotes',
    badge: 'Entrega 48h',
    badgeClass: 'badge-pink',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    price: 35,
    thumbs: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'artist-003',
    name: 'Valerie Cruz',
    tag: 'Modelado 3D & Escultura',
    badge: '1 cupo restante',
    badgeClass: 'badge-lilac',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    price: 110,
    thumbs: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'artist-004',
    name: 'Airi Hoshino',
    tag: 'Live2D Rigging & VTuber',
    badge: 'Top Rated 5.0 ★',
    badgeClass: 'badge-magenta',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    price: 220,
    thumbs: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
    ],
  },
]

const COMMUNITY_ARTWORKS = [
  {
    id: 'art-1',
    title: 'Nebula Witch Guardian',
    badge: 'Comisión abierta · Desde $80',
    badgeClass: 'badge-mint',
    artist: '@celesta_art',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-001',
    likes: 1420,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    category: '2d',
    openSlots: true,
    tags: ['#Anime2D', '#DarkFantasy'],
  },
  {
    id: 'art-2',
    title: 'Mecha Cyber Samurai 3D',
    badge: 'Modelado 3D',
    badgeClass: 'badge-pink',
    artist: '@kenji_mecha',
    artistAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-003',
    likes: 892,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    category: '3d',
    openSlots: true,
    tags: ['#3DAssetsUnity', '#CharacterSheet'],
  },
  {
    id: 'art-3',
    title: 'Cozy Coffee Shop Pixel Scene',
    badge: 'Pixel Art · Asset Pack',
    badgeClass: 'badge-mint',
    artist: '@pixel_dan',
    artistAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-002',
    likes: 2100,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    category: 'pixel',
    openSlots: true,
    tags: ['#PixelArtRPG'],
  },
  {
    id: 'art-4',
    title: 'Aoi Vtuber Model & Rig',
    badge: 'Cupos cerrados',
    badgeClass: 'badge-lilac',
    artist: '@erikasia_v',
    artistAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-004',
    likes: 3400,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    category: 'animation',
    openSlots: false,
    tags: ['#VtuberModel'],
  },
  {
    id: 'art-5',
    title: 'Pastel Dream Garden',
    badge: 'Comisión abierta · Desde $95',
    badgeClass: 'badge-mint',
    artist: '@hana_draws',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-001',
    likes: 1900,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    category: 'concept',
    openSlots: true,
    tags: ['#FantasyLandscape'],
  },
  {
    id: 'art-6',
    title: 'Dragon Knight OC Portrait',
    badge: 'Desde $120',
    badgeClass: 'badge-lilac',
    artist: '@lucas_v',
    artistAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-003',
    likes: 780,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    category: '2d',
    openSlots: true,
    tags: ['#CharacterSheet', '#DarkFantasy'],
  },
  {
    id: 'art-7',
    title: 'Arcade Glow Emote Set',
    badge: 'Pack 6 Emotes · $45',
    badgeClass: 'badge-pink',
    artist: '@chibi_mochi',
    artistAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-002',
    likes: 1100,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    category: 'chibi',
    openSlots: true,
    tags: ['#PixelArtRPG'],
  },
  {
    id: 'art-8',
    title: 'Cyberpunk Alleyway Scene',
    badge: 'Desde $150',
    badgeClass: 'badge-magenta',
    artist: '@neon_brush',
    artistAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-004',
    likes: 2500,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    category: 'concept',
    openSlots: true,
    tags: ['#FantasyLandscape', '#DarkFantasy'],
  },
  {
    id: 'art-9',
    title: 'Enchanted Forest Shrine',
    badge: 'Comisión abierta · Desde $85',
    badgeClass: 'badge-mint',
    artist: '@mateorios',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-001',
    likes: 980,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    category: '2d',
    openSlots: true,
    tags: ['#FantasyLandscape', '#Anime2D'],
  },
  {
    id: 'art-10',
    title: 'Solaris Mech Pilot',
    badge: 'Modelado 3D · $140',
    badgeClass: 'badge-pink',
    artist: '@diego_alv',
    artistAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-003',
    likes: 1340,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    category: '3d',
    openSlots: true,
    tags: ['#3DAssetsUnity'],
  },
  {
    id: 'art-11',
    title: 'Retro Dungeon Crawler Pack',
    badge: 'Pixel Art · $55',
    badgeClass: 'badge-mint',
    artist: '@sofia_art',
    artistAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-002',
    likes: 1720,
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    category: 'pixel',
    openSlots: true,
    tags: ['#PixelArtRPG'],
  },
  {
    id: 'art-12',
    title: 'Starlight Idol Live2D',
    badge: 'Rigging completo',
    badgeClass: 'badge-magenta',
    artist: '@elena_rostova',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-004',
    likes: 2890,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    category: 'animation',
    openSlots: false,
    tags: ['#VtuberModel'],
  },
  {
    id: 'art-13',
    title: 'Floating Citadel of Zephyr',
    badge: 'Concept Art · $130',
    badgeClass: 'badge-lilac',
    artist: '@camille_l',
    artistAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-005',
    likes: 1650,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    category: 'concept',
    openSlots: true,
    tags: ['#FantasyLandscape'],
  },
  {
    id: 'art-14',
    title: 'Boba Kitty Stream Emotes',
    badge: 'Pack 8 Emotes · $35',
    badgeClass: 'badge-pink',
    artist: '@sora_lin',
    artistAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-006',
    likes: 3100,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    category: 'chibi',
    openSlots: true,
    tags: ['#Anime2D'],
  },
  {
    id: 'art-15',
    title: 'Midnight Ronin Katana',
    badge: 'Modelo 3D Game-Ready',
    badgeClass: 'badge-mint',
    artist: '@kenji_mecha',
    artistAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-003',
    likes: 1210,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    category: '3d',
    openSlots: true,
    tags: ['#3DAssetsUnity', '#DarkFantasy'],
  },
  {
    id: 'art-16',
    title: 'Celestial Empress Illustration',
    badge: 'Desde $110',
    badgeClass: 'badge-lilac',
    artist: '@valeria_m',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-007',
    likes: 2420,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    category: '2d',
    openSlots: true,
    tags: ['#Anime2D', '#CharacterSheet'],
  },
  {
    id: 'art-17',
    title: 'Cozy Tavern Isometric Art',
    badge: 'Pixel Art · $70',
    badgeClass: 'badge-mint',
    artist: '@pixel_dan',
    artistAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-002',
    likes: 1850,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    category: 'pixel',
    openSlots: true,
    tags: ['#PixelArtRPG'],
  },
  {
    id: 'art-18',
    title: 'Cyber Goth Avatar Rig',
    badge: 'Live2D & Expresiones',
    badgeClass: 'badge-magenta',
    artist: '@erikasia_v',
    artistAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-004',
    likes: 1980,
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    category: 'animation',
    openSlots: true,
    tags: ['#VtuberModel', '#DarkFantasy'],
  },
  {
    id: 'art-19',
    title: 'Nordic Fjord Landscape',
    badge: 'Comisión abierta · $105',
    badgeClass: 'badge-mint',
    artist: '@hana_draws',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-001',
    likes: 1430,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    category: 'concept',
    openSlots: true,
    tags: ['#FantasyLandscape'],
  },
  {
    id: 'art-20',
    title: 'Neon Ramen Bar Night',
    badge: 'Ilustración Full · $90',
    badgeClass: 'badge-pink',
    artist: '@neon_brush',
    artistAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-004',
    likes: 2190,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    category: '2d',
    openSlots: true,
    tags: ['#Anime2D'],
  },
  {
    id: 'art-21',
    title: 'Chibi Kawaii Food Pack',
    badge: 'Pack 10 Emotes · $40',
    badgeClass: 'badge-lilac',
    artist: '@chibi_mochi',
    artistAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-002',
    likes: 1670,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    category: 'chibi',
    openSlots: true,
    tags: ['#Anime2D'],
  },
  {
    id: 'art-22',
    title: 'Steampunk Airship Explorer',
    badge: 'Modelado 3D & Texturas',
    badgeClass: 'badge-mint',
    artist: '@lucas_v',
    artistAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-003',
    likes: 1120,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    category: '3d',
    openSlots: true,
    tags: ['#3DAssetsUnity'],
  },
  {
    id: 'art-23',
    title: 'Crystal Cavern Ruins',
    badge: 'Fondo Ilustrado · $115',
    badgeClass: 'badge-lilac',
    artist: '@celesta_art',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-001',
    likes: 1840,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    category: 'concept',
    openSlots: true,
    tags: ['#FantasyLandscape', '#DarkFantasy'],
  },
  {
    id: 'art-24',
    title: 'Pixel Cyberpunk Character Set',
    badge: 'Spritesheet Animado · $50',
    badgeClass: 'badge-pink',
    artist: '@mateorios',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-001',
    likes: 2010,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    category: 'pixel',
    openSlots: true,
    tags: ['#PixelArtRPG', '#CharacterSheet'],
  },
]

export default function ExplorePage() {
  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [openSlotsOnly, setOpenSlotsOnly] = useState(false)
  const [selectedSort, setSelectedSort] = useState('popular')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 8

  // Estados interactivos de Likes y Bookmarks
  const [likedMap, setLikedMap] = useState({})
  const [bookmarkedMap, setBookmarkedMap] = useState({})

  function toggleLike(id) {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleBookmark(id) {
    setBookmarkedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleCategorySelect(id) {
    setSelectedCategory(id)
    setCurrentPage(1)
  }

  function handleSortChange(sort) {
    setSelectedSort(sort)
    setCurrentPage(1)
  }

  // Número de filtros que el usuario tiene activos
  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (openSlotsOnly ? 1 : 0)

  // Filtrado reactivo de obras
  const filteredArtworks = useMemo(() => {
    let list = COMMUNITY_ARTWORKS.filter((art) => {
      if (openSlotsOnly && !art.openSlots) return false
      if (selectedCategory !== 'all' && art.category !== selectedCategory) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = art.title.toLowerCase().includes(q)
        const matchesArtist = art.artist.toLowerCase().includes(q)
        const matchesTag = art.tags.some((t) => t.toLowerCase().includes(q))
        if (!matchesTitle && !matchesArtist && !matchesTag) return false
      }

      return true
    })

    if (selectedSort === 'recent') {
      list = [...list].reverse()
    } else if (selectedSort === 'popular') {
      list = [...list].sort((a, b) => b.likes - a.likes)
    }

    return list
  }, [openSlotsOnly, selectedCategory, searchQuery, selectedSort])

  const totalPages = Math.max(1, Math.ceil(filteredArtworks.length / ITEMS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages)
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredArtworks.length)
  const paginatedArtworks = filteredArtworks.slice(startIndex, endIndex)

  return (
    <div className="explore-v3-container">
      {/* 1. HERO SECTION */}
      <header className="explore-v3-hero" aria-labelledby="explore-hero-title">
        <div className="explore-v3-eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          <span>GALERÍA VIVA & MERCADO CREATIVO</span>
          <Sparkles size={14} aria-hidden="true" />
        </div>

        <h1 id="explore-hero-title" className="explore-v3-title">
          Descubre arte extraordinario y conecta con sus{' '}
          <span className="explore-creadores-badge">creadores</span>
        </h1>

        <p className="explore-v3-subtitle">
          Explora miles de piezas originales, filtra por disponibilidad de comisiones inmediatas,
          estilos de autor y presupuestos totalmente transparentes.
        </p>
      </header>

      {/* 2. MEGA SEARCH & FILTER CARD */}
      <section className="explore-mega-search-card" aria-label="Buscador central de arte">
        <div className="mega-search-top">
          <div className="mega-search-input-wrap">
            <Search size={18} className="mega-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar por estilo, personaje o artista..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Buscar en la galería"
            />
          </div>

          <button
            type="button"
            className={`mega-search-filters-btn ${activeFilterCount > 0 ? 'has-filters' : ''}`}
            onClick={() => setFilterModalOpen(true)}
            aria-label="Abrir panel de filtros"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="mega-filters-badge" aria-label={`${activeFilterCount} filtros activos`}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="mega-search-submit-btn"
            onClick={() => {
              const el = document.getElementById('destacadas-section-header')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            aria-label="Explorar Galería"
          >
            <Sparkles size={16} aria-hidden="true" />
            <span>Explorar Galería</span>
          </button>
        </div>
      </section>

      {/* 3. CONTROLES DE ORDEN Y VISTA */}
      <section className="explore-tabs-bar explore-toolbar-bar" aria-label="Controles de orden y vista">
        <div className="explore-controls-group">
          <select
            className="explore-sort-dropdown"
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            aria-label="Ordenar resultados"
          >
            <option value="popular">Más populares</option>
            <option value="recent">Más recientes</option>
            <option value="price_asc">Precio menor</option>
            <option value="price_desc">Precio mayor</option>
            <option value="rating">Mejor calificación</option>
          </select>

          <div className="view-mode-buttons" role="group" aria-label="Cambiar vista de las obras">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Vista en cuadrícula"
              title="Vista en cuadrícula"
            >
              <Grid size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="Vista en lista"
              title="Vista en lista"
            >
              <List size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. CAROUSEL DE CATEGORÍAS HORIZONTAL */}
      <section className="explore-carousel-bar" aria-label="Categorías artísticas">
        <button
          type="button"
          className="carousel-arrow-btn"
          aria-label="Desplazar categorías a la izquierda"
          onClick={() => {
            const el = document.getElementById('category-scroll-container')
            if (el) el.scrollBy({ left: -220, behavior: 'smooth' })
          }}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <div className="category-pills-scroll" id="category-scroll-container">
          {CATEGORIES.map(({ id, label, count }) => {
            const isActive = selectedCategory === id
            return (
              <button
                key={id}
                type="button"
                className={`category-pill-item ${isActive ? 'is-active' : ''}`}
                onClick={() => handleCategorySelect(id)}
              >
                {id === 'all' ? '✦ ' : ''}
                {label} {id !== 'all' ? `(${count})` : ''}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="carousel-arrow-btn"
          aria-label="Desplazar categorías a la derecha"
          onClick={() => {
            const el = document.getElementById('category-scroll-container')
            if (el) el.scrollBy({ left: 220, behavior: 'smooth' })
          }}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </section>

      {/* 5. SECCIÓN: ARTISTAS DEL MOMENTO */}
      <section className="momento-section" aria-labelledby="momento-title">
        <div className="momento-header">
          <div className="momento-title-wrap">
            <div className="momento-icon-badge" aria-hidden="true">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 id="momento-title">Artistas del Momento</h2>
              <p>Creadores con alta demanda y valoraciones 5 estrellas esta semana</p>
            </div>
          </div>

          <div className="momento-arrows">
            <button
              type="button"
              className="carousel-arrow-btn"
              aria-label="Anterior artista"
              onClick={() => {
                const el = document.getElementById('momento-cards-container')
                if (el) el.scrollBy({ left: -320, behavior: 'smooth' })
              }}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="carousel-arrow-btn"
              aria-label="Siguiente artista"
              onClick={() => {
                const el = document.getElementById('momento-cards-container')
                if (el) el.scrollBy({ left: 320, behavior: 'smooth' })
              }}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="momento-cards-grid" id="momento-cards-container">
          {FEATURED_ARTISTS.map((artist) => (
            <article key={artist.id} className="momento-artist-card" aria-label={`Perfil de ${artist.name}`}>
              <span className={`momento-card-badge ${artist.badgeClass}`}>
                {artist.badge}
              </span>

              <div className="momento-artist-header">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="momento-artist-avatar"
                  onError={handleImageError}
                />
                <div>
                  <h3 className="momento-artist-name">{artist.name}</h3>
                  <p className="momento-artist-tag">{artist.tag}</p>
                </div>
              </div>

              <div className="momento-thumbnails-row">
                {artist.thumbs.map((thumb, idx) => (
                  <img
                    key={idx}
                    src={thumb}
                    alt={`Muestra ${idx + 1} de ${artist.name}`}
                    className="momento-thumbnail"
                    onError={handleImageError}
                  />
                ))}
              </div>

              <div className="momento-card-footer">
                <div>
                  <span className="momento-price-label">Tarifa base</span>
                  <strong className="momento-price-value">Desde ${artist.price}</strong>
                </div>

                <div className="momento-actions-group">
                  <Link to={`/artista/${artist.id}`} className="momento-btn-view">
                    Ver
                  </Link>
                  <Link to={`/solicitudes/nueva/${artist.id}`} className="momento-btn-quote">
                    Cotizar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 6. SECCIÓN: OBRAS DESTACADAS EN LA COMUNIDAD */}
      <section className="destacadas-section" aria-labelledby="destacadas-title" id="destacadas-section-header">
        <div className="destacadas-header">
          <div className="destacadas-title-wrap">
            <h2 id="destacadas-title">Obras Destacadas en la Comunidad</h2>
            <span className="destacadas-counter-badge">{filteredArtworks.length} Encontradas</span>
          </div>
          <span className="destacadas-counter-text">
            Mostrando {filteredArtworks.length > 0 ? startIndex + 1 : 0} - {endIndex} de {filteredArtworks.length}
          </span>
        </div>

        <div className={`destacadas-grid ${viewMode === 'list' ? 'is-list' : ''}`}>
          {paginatedArtworks.map((art) => {
            const isLiked = Boolean(likedMap[art.id])
            const isBookmarked = Boolean(bookmarkedMap[art.id])
            const displayLikes = isLiked ? (art.likes + 1).toLocaleString() : art.likes.toLocaleString()

            return (
              <article key={art.id} className="destacada-card" aria-label={art.title}>
                <div className="destacada-image-box">
                  <span className={`destacada-badge ${art.badgeClass}`}>
                    {art.badge}
                  </span>

                  <img
                    src={art.image}
                    alt={art.title}
                    className="destacada-img"
                    onError={handleImageError}
                  />

                  <div className="destacada-floating-actions">
                    <button
                      type="button"
                      className={`destacada-action-btn ${isLiked ? 'is-liked' : ''}`}
                      onClick={() => toggleLike(art.id)}
                      aria-label="Me gusta esta obra"
                    >
                      <Heart size={14} fill={isLiked ? '#EF4444' : 'none'} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="destacada-action-btn"
                      onClick={() => toggleBookmark(art.id)}
                      aria-label="Guardar obra en colección"
                    >
                      <Bookmark size={14} fill={isBookmarked ? '#8B5CF6' : 'none'} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="destacada-info">
                  <h3 className="destacada-title" title={art.title}>
                    <Link to={`/artista/${art.artistId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {art.title}
                    </Link>
                  </h3>

                  <div className="destacada-artist-row">
                    <div className="destacada-artist-left">
                      <img
                        src={art.artistAvatar}
                        alt={art.artist}
                        className="destacada-artist-avatar"
                        onError={handleImageError}
                      />
                      <span className="destacada-artist-handle">{art.artist}</span>
                    </div>

                    <div className="destacada-likes">
                      <Heart size={12} fill="#EF4444" color="#EF4444" aria-hidden="true" />
                      <span>{displayLikes}</span>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>


      {/* 7. PAGINACIÓN DINÁMICA */}
      <div className="explore-pagination-wrap">
        <div className="numeric-pagination-row" aria-label="Paginación">
          <button
            type="button"
            className="page-num-btn"
            aria-label="Página anterior"
            disabled={activePage <= 1}
            onClick={() => {
              if (activePage > 1) {
                setCurrentPage(activePage - 1)
                const el = document.getElementById('destacadas-section-header')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              className={`page-num-btn ${activePage === pageNum ? 'is-active' : ''}`}
              aria-current={activePage === pageNum ? 'page' : undefined}
              onClick={() => {
                setCurrentPage(pageNum)
                const el = document.getElementById('destacadas-section-header')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            className="page-num-btn"
            aria-label="Página siguiente"
            disabled={activePage >= totalPages}
            onClick={() => {
              if (activePage < totalPages) {
                setCurrentPage(activePage + 1)
                const el = document.getElementById('destacadas-section-header')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 8. MODAL DE FILTROS DETALLADOS */}
      {filterModalOpen && (
        <div
          className="filter-modal-backdrop"
          onClick={() => setFilterModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-filter-heading"
        >
          <div className="filter-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h3 id="modal-filter-heading">Filtros Avanzados</h3>
              <button
                type="button"
                className="filter-modal-close"
                onClick={() => setFilterModalOpen(false)}
                aria-label="Cerrar modal de filtros"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="filter-modal-grid">
              <div className="filter-field">
                <label htmlFor="modal-filter-discipline">Disciplina principal</label>
                <select
                  id="modal-filter-discipline"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Todas las disciplinas</option>
                  <option value="2d">Ilustración 2D</option>
                  <option value="3d">Modelado 3D & CG</option>
                  <option value="animation">Animación & Rigging</option>
                  <option value="concept">Concept Art & Dev</option>
                  <option value="pixel">Pixel Art & Game</option>
                  <option value="chibi">Chibi & Emotes</option>
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="modal-filter-slots">Disponibilidad de comisiones</label>
                <select
                  id="modal-filter-slots"
                  value={openSlotsOnly ? 'open' : 'any'}
                  onChange={(e) => setOpenSlotsOnly(e.target.value === 'open')}
                >
                  <option value="any">Cualquier estado</option>
                  <option value="open">Solo cupos abiertos</option>
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="modal-filter-sort">Criterio de ordenamiento</label>
                <select
                  id="modal-filter-sort"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                >
                  <option value="popular">Más populares</option>
                  <option value="recent">Más recientes</option>
                  <option value="price_asc">Precio: Menor a mayor</option>
                  <option value="price_desc">Precio: Mayor a menor</option>
                </select>
              </div>
            </div>

            <div className="filter-modal-footer">
              <button
                type="button"
                className="promo-btn-secondary"
                onClick={() => {
                  setSelectedCategory('all')
                  setOpenSlotsOnly(false)
                  setSearchQuery('')
                  setFilterModalOpen(false)
                }}
              >
                Restablecer
              </button>
              <button
                type="button"
                className="promo-btn-primary"
                onClick={() => setFilterModalOpen(false)}
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
