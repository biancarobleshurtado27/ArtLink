const fs = require('fs');

const db = {
  users: [
    {
      id: "admin-1",
      name: "Administrador",
      email: "admin@artlink.com",
      password: "admin",
      role: "admin",
      avatar: "https://ui-avatars.com/api/?name=Admin&background=random"
    },
    {
      id: "client-1",
      name: "Cliente Prueba",
      email: "cliente@artlink.com",
      password: "123",
      role: "client",
      avatar: "https://ui-avatars.com/api/?name=Cliente&background=random"
    },
    {
      id: "artist-demo-101",
      name: "Pixel Foundry [DEMO]",
      email: "pixelfoundry@demo.artlink.local",
      password: "123",
      role: "artist",
      avatar: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80"
    },
    {
      id: "artist-demo-102",
      name: "Voxel Studio Lab [DEMO]",
      email: "voxelstudio@demo.artlink.local",
      password: "123",
      role: "artist",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80"
    },
    {
      id: "artist-demo-103",
      name: "Chroma Vector Works [DEMO]",
      email: "chromavector@demo.artlink.local",
      password: "123",
      role: "artist",
      avatar: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80"
    },
    {
      id: "artist-demo-104",
      name: "Aether Concept Art [DEMO]",
      email: "aetherconcept@demo.artlink.local",
      password: "123",
      role: "artist",
      avatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80"
    },
    {
      id: "artist-demo-105",
      name: "Nexus UI Labs [DEMO]",
      email: "nexusui@demo.artlink.local",
      password: "123",
      role: "artist",
      avatar: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&q=80"
    },
    {
      id: "artist-demo-106",
      name: "Glitch Dimension [DEMO]",
      email: "glitchdim@demo.artlink.local",
      password: "123",
      role: "artist",
      avatar: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80"
    },
    {
      id: "artist-demo-107",
      name: "Kinetics 3D Motion [DEMO]",
      email: "kinetics3d@demo.artlink.local",
      password: "123",
      role: "artist",
      avatar: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=400&q=80"
    },
    {
      id: "artist-demo-108",
      name: "Mythos Character Forge [DEMO]",
      email: "mythosforge@demo.artlink.local",
      password: "123",
      role: "artist",
      avatar: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80"
    },
    {
      id: "artist-demo-109",
      name: "TypoGraphix Digital [DEMO]",
      email: "typographix@demo.artlink.local",
      password: "123",
      role: "artist",
      avatar: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&q=80"
    },
    {
      id: "artist-demo-110",
      name: "Aura Digital Matte [DEMO]",
      email: "auramatte@demo.artlink.local",
      password: "123",
      role: "artist",
      avatar: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80"
    }
  ],
  artistProfiles: [
    {
      id: "artist-demo-101",
      userId: "artist-demo-101",
      displayName: "Pixel Foundry [DEMO]",
      username: "pixelfoundry",
      avatar: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80",
      bio: "[PERFIL DE DEMOSTRACIÓN] Entorno de prueba de ArtLink. Taller de creación de pixel art para videojuegos retro, sprites 16-bit e interfaces vintage. No representa a una persona real.",
      disciplines: ["Pixel Art", "Ilustración"],
      styles: ["16-bit", "Cyberpunk", "Chibi"],
      location: "Servidor Sintético 01",
      availability: "open",
      slots: 4,
      rating: 4.9,
      verified: true,
      basePrice: 80,
      isDemo: true,
      demoDisclaimer: "Perfil generado para propósitos de prueba y demostración del prototipo ArtLink.",
      socialLinks: { web: "https://demo.artlink.local/pixelfoundry" }
    },
    {
      id: "artist-demo-102",
      userId: "artist-demo-102",
      displayName: "Voxel Studio Lab [DEMO]",
      username: "voxelstudio",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
      bio: "[PERFIL DE DEMOSTRACIÓN] Laboratorio de experimentación volumétrica y dioramas 3D low-poly para maquetas y juegos. Perfil ficticio de prototipo.",
      disciplines: ["Voxel Art", "Modelado 3D"],
      styles: ["Low-Poly", "Isométrico", "Diorama"],
      location: "Entorno Isométrico Alfa",
      availability: "open",
      slots: 2,
      rating: 4.8,
      verified: true,
      basePrice: 120,
      isDemo: true,
      demoDisclaimer: "Perfil generado para propósitos de prueba y demostración del prototipo ArtLink.",
      socialLinks: { web: "https://demo.artlink.local/voxelstudio" }
    },
    {
      id: "artist-demo-103",
      userId: "artist-demo-103",
      displayName: "Chroma Vector Works [DEMO]",
      username: "chromavector",
      avatar: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
      bio: "[PERFIL DE DEMOSTRACIÓN] Creación de identidades visuales, infografías limpias e ilustraciones vectoriales escalables. Demostración para catálogo ArtLink.",
      disciplines: ["Ilustración Vectorial", "Diseño Gráfico"],
      styles: ["Flat Art", "Minimalista", "Geométrico"],
      location: "Cluster Gráfico Vectorial",
      availability: "open",
      slots: 5,
      rating: 4.7,
      verified: true,
      basePrice: 90,
      isDemo: true,
      demoDisclaimer: "Perfil generado para propósitos de prueba y demostración del prototipo ArtLink.",
      socialLinks: { web: "https://demo.artlink.local/chromavector" }
    },
    {
      id: "artist-demo-104",
      userId: "artist-demo-104",
      displayName: "Aether Concept Art [DEMO]",
      username: "aetherconcept",
      avatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
      bio: "[PERFIL DE DEMOSTRACIÓN] Conceptualización de mundos de ciencia ficción y atmósferas fantásticas de gran escala. Datos ficticios para ArtLink.",
      disciplines: ["Concept Art", "Arte Digital"],
      styles: ["Sci-Fi", "Fantasía Épica", "Cinematográfico"],
      location: "Estación Orbital Beta",
      availability: "waitlist",
      slots: 0,
      rating: 5.0,
      verified: true,
      basePrice: 220,
      isDemo: true,
      demoDisclaimer: "Perfil generado para propósitos de prueba y demostración del prototipo ArtLink.",
      socialLinks: { web: "https://demo.artlink.local/aetherconcept" }
    },
    {
      id: "artist-demo-105",
      userId: "artist-demo-105",
      displayName: "Nexus UI Labs [DEMO]",
      username: "nexusui",
      avatar: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
      bio: "[PERFIL DE DEMOSTRACIÓN] Diseño de interfaces de usuario modernas, tableros interactivos y sistemas de diseño listos para desarrollo.",
      disciplines: ["Diseño UI/UX", "Diseño Gráfico"],
      styles: ["Glassmorphism", "Dark Mode", "Sistemas de Diseño"],
      location: "Plataforma Prototipo UX",
      availability: "open",
      slots: 3,
      rating: 4.9,
      verified: true,
      basePrice: 150,
      isDemo: true,
      demoDisclaimer: "Perfil generado para propósitos de prueba y demostración del prototipo ArtLink.",
      socialLinks: { web: "https://demo.artlink.local/nexusui" }
    },
    {
      id: "artist-demo-106",
      userId: "artist-demo-106",
      displayName: "Glitch Dimension [DEMO]",
      username: "glitchdim",
      avatar: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=80",
      bio: "[PERFIL DE DEMOSTRACIÓN] Exploración de arte generativo algorítmico, texturas datamosh y estética cyberpunk experimental.",
      disciplines: ["Arte Generativo", "Arte Digital"],
      styles: ["Glitch Art", "Procedural", "Datamosh"],
      location: "Subred Experimental 404",
      availability: "open",
      slots: 3,
      rating: 4.8,
      verified: false,
      basePrice: 70,
      isDemo: true,
      demoDisclaimer: "Perfil generado para propósitos de prueba y demostración del prototipo ArtLink.",
      socialLinks: { web: "https://demo.artlink.local/glitchdim" }
    },
    {
      id: "artist-demo-107",
      userId: "artist-demo-107",
      displayName: "Kinetics 3D Motion [DEMO]",
      username: "kinetics3d",
      avatar: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&q=80",
      bio: "[PERFIL DE DEMOSTRACIÓN] Renderizado tridimensional de objetos cinéticos, animación de bucles y composiciones dinámicas metálicas.",
      disciplines: ["Modelado 3D", "Animación"],
      styles: ["CGI", "Fluido", "Metálico Futurista"],
      location: "Render Farm Virtual",
      availability: "open",
      slots: 2,
      rating: 4.9,
      verified: true,
      basePrice: 190,
      isDemo: true,
      demoDisclaimer: "Perfil generado para propósitos de prueba y demostración del prototipo ArtLink.",
      socialLinks: { web: "https://demo.artlink.local/kinetics3d" }
    },
    {
      id: "artist-demo-108",
      userId: "artist-demo-108",
      displayName: "Mythos Character Forge [DEMO]",
      username: "mythosforge",
      avatar: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
      bio: "[PERFIL DE DEMOSTRACIÓN] Modelado y diseño de personajes heroicos, criaturas fantásticas y atuendos estilizados para narrativas interactivas.",
      disciplines: ["Character Design", "Ilustración"],
      styles: ["Estilizado", "Fantasía Épica", "Mecha"],
      location: "Gremio de Creación 09",
      availability: "open",
      slots: 4,
      rating: 5.0,
      verified: true,
      basePrice: 160,
      isDemo: true,
      demoDisclaimer: "Perfil generado para propósitos de prueba y demostración del prototipo ArtLink.",
      socialLinks: { web: "https://demo.artlink.local/mythosforge" }
    },
    {
      id: "artist-demo-109",
      userId: "artist-demo-109",
      displayName: "TypoGraphix Digital [DEMO]",
      username: "typographix",
      avatar: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&q=80",
      bio: "[PERFIL DE DEMOSTRACIÓN] Laboratorio de rotulación experimental, cartelería de impacto y fuentes tipográficas personalizadas.",
      disciplines: ["Tipografía Digital", "Diseño Gráfico"],
      styles: ["Brutalismo", "Lettering", "Monocromo"],
      location: "Atelier Tipográfico Central",
      availability: "open",
      slots: 6,
      rating: 4.8,
      verified: true,
      basePrice: 85,
      isDemo: true,
      demoDisclaimer: "Perfil generado para propósitos de prueba y demostración del prototipo ArtLink.",
      socialLinks: { web: "https://demo.artlink.local/typographix" }
    },
    {
      id: "artist-demo-110",
      userId: "artist-demo-110",
      displayName: "Aura Digital Matte [DEMO]",
      username: "auramatte",
      avatar: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
      bio: "[PERFIL DE DEMOSTRACIÓN] Pintura digital de paisajes cinemáticos, fondos escénicos hiperdetallados y atmósferas envolventes para producciones.",
      disciplines: ["Matte Painting", "Arte Digital"],
      styles: ["Atmósferas Cinemáticas", "Realismo Fantástico", "Paisaje"],
      location: "Horizonte Digital Estudio",
      availability: "waitlist",
      slots: 1,
      rating: 4.9,
      verified: true,
      basePrice: 210,
      isDemo: true,
      demoDisclaimer: "Perfil generado para propósitos de prueba y demostración del prototipo ArtLink.",
      socialLinks: { web: "https://demo.artlink.local/auramatte" }
    }
  ],
  categories: [
    { id: "cat-1", name: "Pixel Art", slug: "pixel-art", color: "#F59E0B" },
    { id: "cat-2", name: "Voxel Art", slug: "voxel-art", color: "#3B82F6" },
    { id: "cat-3", name: "Ilustración Vectorial", slug: "ilustracion-vectorial", color: "#10B981" },
    { id: "cat-4", name: "Concept Art", slug: "concept-art", color: "#8B5CF6" },
    { id: "cat-5", name: "Diseño UI/UX", slug: "diseno-ui-ux", color: "#06B6D4" },
    { id: "cat-6", name: "Arte Generativo", slug: "arte-generativo", color: "#EC4899" },
    { id: "cat-7", name: "Modelado 3D", slug: "modelado-3d", color: "#6366F1" },
    { id: "cat-8", name: "Character Design", slug: "character-design", color: "#EF4444" },
    { id: "cat-9", name: "Tipografía Digital", slug: "tipografia-digital", color: "#84CC16" },
    { id: "cat-10", name: "Matte Painting", slug: "matte-painting", color: "#14B8A6" }
  ],
  portfolioItems: [
    // 101 - Pixel Foundry
    {
      id: "art-101",
      artistId: "artist-demo-101",
      title: "[DEMO] Consola Arcade Cibernética",
      category: "Pixel Art",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
      description: "Ilustración en cuadrícula de 16 colores simulando hardware retrofuturista.",
      likes: 142,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "art-102",
      artistId: "artist-demo-101",
      title: "[DEMO] Ciudad Neón 16-Bit",
      category: "Pixel Art",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
      description: "Panorámica nocturna estilo pixel art con iluminación de letreros sintéticos.",
      likes: 215,
      createdAt: "2024-02-10T14:30:00Z"
    },
    {
      id: "art-103",
      artistId: "artist-demo-101",
      title: "[DEMO] Mazmorra Isométrica Retro",
      category: "Pixel Art",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80",
      description: "Set de baldosas y props para videojuego de exploración en perspectiva isométrica.",
      likes: 178,
      createdAt: "2024-03-05T09:15:00Z"
    },

    // 102 - Voxel Studio Lab
    {
      id: "art-104",
      artistId: "artist-demo-102",
      title: "[DEMO] Santuario Flotante Voxel",
      category: "Voxel Art",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80",
      description: "Diorama cúbico con vegetación procedural y templo en suspensión.",
      likes: 198,
      createdAt: "2024-01-20T11:00:00Z"
    },
    {
      id: "art-105",
      artistId: "artist-demo-102",
      title: "[DEMO] Rover de Exploración Low-Poly",
      category: "Voxel Art",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&q=80",
      description: "Modelo vehicular simplificado optimizado para motores de juego en tiempo real.",
      likes: 164,
      createdAt: "2024-02-18T16:00:00Z"
    },
    {
      id: "art-106",
      artistId: "artist-demo-102",
      title: "[DEMO] Isla Cúbica de Cristal",
      category: "Voxel Art",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
      description: "Composición geométrica con iluminación cáustica simulada.",
      likes: 220,
      createdAt: "2024-03-12T13:45:00Z"
    },

    // 103 - Chroma Vector Works
    {
      id: "art-107",
      artistId: "artist-demo-103",
      title: "[DEMO] Fauna Sintética Vectorial",
      category: "Ilustración Vectorial",
      image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80",
      description: "Estudio de formas orgánicas puras con trazados bezier matemáticos.",
      likes: 135,
      createdAt: "2024-01-25T12:00:00Z"
    },
    {
      id: "art-108",
      artistId: "artist-demo-103",
      title: "[DEMO] Sistema Modular de Glifos",
      category: "Ilustración Vectorial",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
      description: "Familia de pictogramas contemporáneos basados en rejilla de 24 píxeles.",
      likes: 180,
      createdAt: "2024-02-22T17:10:00Z"
    },
    {
      id: "art-109",
      artistId: "artist-demo-103",
      title: "[DEMO] Afiche Constructivista Digital",
      category: "Ilustración Vectorial",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
      description: "Póster experimental combinando geometría euclidiana y gradientes de alta saturación.",
      likes: 245,
      createdAt: "2024-03-19T10:20:00Z"
    },

    // 104 - Aether Concept Art
    {
      id: "art-110",
      artistId: "artist-demo-104",
      title: "[DEMO] Bastión Espacial en Órbita",
      category: "Concept Art",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
      description: "Ilustración conceptual para escena de llegada interplanetaria.",
      likes: 310,
      createdAt: "2024-01-30T15:00:00Z"
    },
    {
      id: "art-111",
      artistId: "artist-demo-104",
      title: "[DEMO] Circuito del Núcleo Estelar",
      category: "Concept Art",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
      description: "Exploración de maquinaria estelar futurista con iluminación bioluminiscente.",
      likes: 275,
      createdAt: "2024-02-27T08:40:00Z"
    },
    {
      id: "art-112",
      artistId: "artist-demo-104",
      title: "[DEMO] Puerta del Abismo Cósmico",
      category: "Concept Art",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
      description: "Entorno conceptual para producción de cine de ciencia ficción.",
      likes: 340,
      createdAt: "2024-03-24T18:00:00Z"
    },

    // 105 - Nexus UI Labs
    {
      id: "art-113",
      artistId: "artist-demo-105",
      title: "[DEMO] Tablero de Telemetría Cuántica",
      category: "Diseño UI/UX",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      description: "Interfaz oscura analítica con visualización de datos en tiempo real.",
      likes: 190,
      createdAt: "2024-02-02T09:00:00Z"
    },
    {
      id: "art-114",
      artistId: "artist-demo-105",
      title: "[DEMO] Prototipo Móvil Fintech Glass",
      category: "Diseño UI/UX",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80",
      description: "Sistema de pantallas para aplicación financiera con componentes traslúcidos.",
      likes: 210,
      createdAt: "2024-02-28T14:15:00Z"
    },
    {
      id: "art-115",
      artistId: "artist-demo-105",
      title: "[DEMO] Biblioteca de Tokens de Diseño",
      category: "Diseño UI/UX",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      description: "Estructura de variables, tipografías y paletas normalizadas para desarrollo web.",
      likes: 165,
      createdAt: "2024-03-28T11:50:00Z"
    },

    // 106 - Glitch Dimension
    {
      id: "art-116",
      artistId: "artist-demo-106",
      title: "[DEMO] Aberración Cromática Ondulada",
      category: "Arte Generativo",
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
      description: "Ruptura de canales RGB mediante algoritmos de distorsión por desplazamiento.",
      likes: 145,
      createdAt: "2024-02-05T16:20:00Z"
    },
    {
      id: "art-117",
      artistId: "artist-demo-106",
      title: "[DEMO] Cascada Binaria Procedural",
      category: "Arte Generativo",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
      description: "Matriz algorítmica generada con scripts matemáticos en canvas interactivo.",
      likes: 188,
      createdAt: "2024-03-02T19:30:00Z"
    },

    // 107 - Kinetics 3D Motion
    {
      id: "art-118",
      artistId: "artist-demo-107",
      title: "[DEMO] Núcleo Metálico Levitante",
      category: "Modelado 3D",
      image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80",
      description: "Render con trazado de rayos simulando aleaciones de cromo líquido pulido.",
      likes: 230,
      createdAt: "2024-02-08T13:00:00Z"
    },
    {
      id: "art-119",
      artistId: "artist-demo-107",
      title: "[DEMO] Cintas de Energía Tridimensional",
      category: "Modelado 3D",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80",
      description: "Estudio de simulación de fluidos y materiales reflectivos en movimiento continuo.",
      likes: 295,
      createdAt: "2024-03-06T15:45:00Z"
    },

    // 108 - Mythos Character Forge
    {
      id: "art-120",
      artistId: "artist-demo-108",
      title: "[DEMO] Autómata Centinela MK-IV",
      category: "Character Design",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80",
      description: "Hoja de diseño y turn-around para guardián robótico con iluminación interna.",
      likes: 320,
      createdAt: "2024-02-12T10:10:00Z"
    },
    {
      id: "art-121",
      artistId: "artist-demo-108",
      title: "[DEMO] Yelmo Cibernético del Vórtice",
      category: "Character Design",
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
      description: "Diseño de indumentaria y armadura para protagonista de aventura espacial.",
      likes: 260,
      createdAt: "2024-03-10T12:00:00Z"
    },
    {
      id: "art-122",
      artistId: "artist-demo-108",
      title: "[DEMO] Silueta Espectral de Cristal",
      category: "Character Design",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
      description: "Concepto de entidad mística compuesta por fracturas de luz astral.",
      likes: 310,
      createdAt: "2024-03-29T17:15:00Z"
    },

    // 109 - TypoGraphix Digital
    {
      id: "art-123",
      artistId: "artist-demo-109",
      title: "[DEMO] Alfabeto Monocromo Brutalista",
      category: "Tipografía Digital",
      image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&q=80",
      description: "Composición de caracteres display con cortes geométricos de alto contraste.",
      likes: 155,
      createdAt: "2024-02-14T11:20:00Z"
    },
    {
      id: "art-124",
      artistId: "artist-demo-109",
      title: "[DEMO] Retícula Tipográfica Experimental",
      category: "Tipografía Digital",
      image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80",
      description: "Exploración de diagramación asimétrica y jerarquía visual tipográfica.",
      likes: 182,
      createdAt: "2024-03-14T14:40:00Z"
    },
    {
      id: "art-125",
      artistId: "artist-demo-109",
      title: "[DEMO] Pintura Gestual Tipográfica",
      category: "Tipografía Digital",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
      description: "Fusión de caligrafía digital con trazos gestuales de acuarela sintética.",
      likes: 205,
      createdAt: "2024-03-31T09:30:00Z"
    },

    // 110 - Aura Digital Matte
    {
      id: "art-126",
      artistId: "artist-demo-110",
      title: "[DEMO] Valle Brumoso del Crepúsculo",
      category: "Matte Painting",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      description: "Pintura digital de paisaje de alta resolución para fondo de producción fílmica.",
      likes: 380,
      createdAt: "2024-02-16T18:00:00Z"
    },
    {
      id: "art-127",
      artistId: "artist-demo-110",
      title: "[DEMO] Santuario del Bosque Esmeralda",
      category: "Matte Painting",
      image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80",
      description: "Composición ambiental con rayos solares volumétricos y follaje denso.",
      likes: 290,
      createdAt: "2024-03-18T16:15:00Z"
    },
    {
      id: "art-128",
      artistId: "artist-demo-110",
      title: "[DEMO] Cordillera de los Vientos",
      category: "Matte Painting",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
      description: "Vista panorámica de picos montañosos bajo un manto de neblina matutina.",
      likes: 345,
      createdAt: "2024-04-02T12:00:00Z"
    }
  ],
  commissions: [
    {
      id: "comm-101",
      artistId: "artist-demo-101",
      title: "[DEMO] Hoja de Sprites de Personaje 16-Bit",
      description: "Creación de personaje pixel art con 4 ciclos de movimiento básicos.",
      price: 80,
      deliveryDays: 5,
      revisions: 2,
      includes: "Archivos PNG con fondo transparente y archivo de proyecto",
      featured: true,
      category: "Pixel Art"
    },
    {
      id: "comm-102",
      artistId: "artist-demo-101",
      title: "[DEMO] Escenario Completo en Perspectiva Pixel",
      description: "Fondo de escenario estático o con capas parallax para videojuego 2D.",
      price: 140,
      deliveryDays: 10,
      revisions: 3,
      includes: "Capas separadas en PSD/PNG",
      featured: false,
      category: "Pixel Art"
    },
    {
      id: "comm-103",
      artistId: "artist-demo-102",
      title: "[DEMO] Diorama Voxel Isométrico",
      description: "Modelado de una escena o habitación temática en bloques cúbicos detallados.",
      price: 120,
      deliveryDays: 7,
      revisions: 2,
      includes: "Render 4K y archivo .vox / .obj",
      featured: true,
      category: "Voxel Art"
    },
    {
      id: "comm-104",
      artistId: "artist-demo-103",
      title: "[DEMO] Kit de Ilustraciones Vectoriales de Marca",
      description: "Conjunto de 3 ilustraciones corporativas o de producto en curvas escalables.",
      price: 90,
      deliveryDays: 6,
      revisions: 2,
      includes: "Formatos SVG, AI y exportaciones optimizadas",
      featured: true,
      category: "Ilustración Vectorial"
    },
    {
      id: "comm-105",
      artistId: "artist-demo-104",
      title: "[DEMO] Ilustración de Entorno Sci-Fi Cinemático",
      description: "Concept art a todo color con iluminación dramática y detalles atmosféricos.",
      price: 220,
      deliveryDays: 14,
      revisions: 3,
      includes: "Bocetos iniciales, selección tonal y pintura final en alta resolución",
      featured: true,
      category: "Concept Art"
    },
    {
      id: "comm-106",
      artistId: "artist-demo-105",
      title: "[DEMO] Diseño de UI para Dashboard Web",
      description: "Arquitectura visual y maquetación de pantalla principal con componentes UI.",
      price: 150,
      deliveryDays: 8,
      revisions: 3,
      includes: "Archivo Figma editable con autolayout y tokens",
      featured: true,
      category: "Diseño UI/UX"
    },
    {
      id: "comm-107",
      artistId: "artist-demo-106",
      title: "[DEMO] Pieza Generativa / Textura Glitch",
      description: "Composición digital algorítmica para portadas de álbumes o visuales de escenario.",
      price: 70,
      deliveryDays: 4,
      revisions: 2,
      includes: "Arte final en alta resolución y variaciones cromáticas",
      featured: true,
      category: "Arte Generativo"
    },
    {
      id: "comm-108",
      artistId: "artist-demo-107",
      title: "[DEMO] Bucle de Animación 3D para Redes",
      description: "Renderizado continuo de un objeto o logotipo tridimensional en movimiento armónico.",
      price: 190,
      deliveryDays: 10,
      revisions: 2,
      includes: "Video MP4 sin pérdida y secuencia de frames",
      featured: true,
      category: "Modelado 3D"
    },
    {
      id: "comm-109",
      artistId: "artist-demo-108",
      title: "[DEMO] Diseño de Personaje Original Completo",
      description: "Ficha conceptual con vista frontal, lateral y expresiones principales del personaje.",
      price: 160,
      deliveryDays: 12,
      revisions: 3,
      includes: "Hoja de especificaciones de color y trazo final",
      featured: true,
      category: "Character Design"
    },
    {
      id: "comm-110",
      artistId: "artist-demo-109",
      title: "[DEMO] Logotipo Tipográfico y Monograma",
      description: "Diseño personalizado de tipografía display adaptada a la identidad del proyecto.",
      price: 85,
      deliveryDays: 5,
      revisions: 2,
      includes: "Archivos vectoriales SVG y guía de aplicación tipográfica",
      featured: true,
      category: "Tipografía Digital"
    },
    {
      id: "comm-111",
      artistId: "artist-demo-110",
      title: "[DEMO] Matte Painting de Paisaje Épico",
      description: "Pintura de fondo con integración de elementos naturales, iluminación volumétrica y profundidad.",
      price: 210,
      deliveryDays: 14,
      revisions: 3,
      includes: "Archivo PSD por capas y exportación en resolución 6K",
      featured: true,
      category: "Matte Painting"
    }
  ],
  requests: [
    {
      id: "req-101",
      clientId: "client-1",
      artistId: "artist-demo-101",
      packageId: "comm-101",
      status: "completed",
      budget: 80,
      createdAt: "2024-03-01T10:00:00Z"
    },
    {
      id: "req-102",
      clientId: "client-1",
      artistId: "artist-demo-104",
      packageId: "comm-105",
      status: "in_progress",
      budget: 220,
      createdAt: "2024-03-15T12:00:00Z"
    },
    {
      id: "req-103",
      clientId: "client-1",
      artistId: "artist-demo-108",
      packageId: "comm-109",
      status: "completed",
      budget: 160,
      createdAt: "2024-03-20T14:00:00Z"
    }
  ],
  reviews: [
    {
      id: "rev-101",
      artistId: "artist-demo-101",
      requestId: "req-101",
      clientId: "client-1",
      clientName: "Cliente Prueba",
      clientAvatar: "https://ui-avatars.com/api/?name=Cliente&background=random",
      commissionTitle: "[DEMO] Hoja de Sprites de Personaje 16-Bit",
      rating: 5,
      comment: "Entrega impecable y precisa en cada fotograma del ciclo de animación. Excelente demostración.",
      createdAt: "2024-03-08T15:00:00Z"
    },
    {
      id: "rev-102",
      artistId: "artist-demo-108",
      requestId: "req-103",
      clientId: "client-1",
      clientName: "Cliente Prueba",
      clientAvatar: "https://ui-avatars.com/api/?name=Cliente&background=random",
      commissionTitle: "[DEMO] Diseño de Personaje Original Completo",
      rating: 5,
      comment: "El diseño del atuendo y la silueta del personaje superaron las expectativas para la prueba.",
      createdAt: "2024-03-26T18:30:00Z"
    }
  ],
  follows: [
    {
      id: "fol-101",
      followerId: "client-1",
      artistId: "artist-demo-101",
      createdAt: "2024-03-20T10:00:00.000Z"
    },
    {
      id: "fol-102",
      followerId: "client-1",
      artistId: "artist-demo-104",
      createdAt: "2024-03-22T12:00:00.000Z"
    }
  ],
  likes: [
    {
      id: "like-101",
      userId: "client-1",
      portfolioItemId: "art-101",
      createdAt: "2024-03-20T10:00:00.000Z"
    },
    {
      id: "like-102",
      userId: "client-1",
      portfolioItemId: "art-102",
      createdAt: "2024-03-21T11:00:00.000Z"
    },
    {
      id: "like-103",
      userId: "client-1",
      portfolioItemId: "art-104",
      createdAt: "2024-03-22T14:00:00.000Z"
    }
  ],
  messages: [],
  conversations: [],
  favorites: [],
  portfolio: []
};

fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
console.log("Base de datos generada exitosamente con 10 artistas ficticios de demostracion.");
