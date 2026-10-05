// Componente SVG puro para las estrellitas decorativas de 4 puntas suaves (estilo pastel scrapbook de ArtLink).
// Es la unica definicion de estrella del proyecto: se reutiliza tanto para la decoracion flotante
// (FloatingStars) como para los distintivos y etiquetas en linea de las paginas.
export function SparkleStar({ size = 24, color = '#F472B6', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
      className={`decorative-star ${className}`.trim()}
      aria-hidden="true"
    >
      <path
        d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z"
        fill={color}
      />
    </svg>
  )
}



// Preset completo para el Hero principal (conserva la distribución exacta de HomePage)
export const HERO_SPARKLES_DATA = [
  // Zona Superior
  { id: 'sp-1', top: '3.5rem', left: '3.5%', size: 30, color: '#F472B6', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'sp-2', top: '4.5rem', right: '4%', size: 32, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '0.8s' },
  { id: 'sp-3', top: '1.8rem', left: '20%', size: 18, color: '#F472B6', anim: 'anim-star-float-3', delay: '1.4s' },
  { id: 'sp-4', top: '2.2rem', right: '22%', size: 20, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.1s' },
  { id: 'sp-extra-1', top: '6.5rem', left: '11%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '0.4s' },
  { id: 'sp-extra-2', top: '7.2rem', right: '13%', size: 22, color: '#C084FC', anim: 'anim-star-float-3', delay: '1.7s' },

  // Zona Media
  { id: 'sp-5', top: '12.5rem', left: '5.5%', size: 24, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1s' },
  { id: 'sp-6', top: '14rem', right: '5%', size: 28, color: '#F472B6', anim: 'anim-star-float-3', delay: '0.3s' },
  { id: 'sp-7', top: '19.5rem', left: '2%', size: 22, color: '#A78BFA', anim: 'anim-star-float-1', delay: '2.5s' },
  { id: 'sp-8', top: '21rem', right: '2.2%', size: 24, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '1.6s' },
  { id: 'sp-extra-3', top: '23.5rem', left: '14%', size: 18, color: '#F472B6', anim: 'anim-star-float-3', delay: '2.9s' },
  { id: 'sp-extra-4', top: '24.2rem', right: '15%', size: 19, color: '#FBBF24', anim: 'anim-star-float-1', delay: '1.2s' },

  // Zona Media-Baja
  { id: 'sp-9', top: '29rem', left: '4%', size: 26, color: '#F472B6', anim: 'anim-star-float-3', delay: '3.1s' },
  { id: 'sp-10', top: '31rem', right: '4.5%', size: 24, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.5s' },
  { id: 'sp-11', top: '38rem', left: '2.2%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '2.2s' },
  { id: 'sp-12', top: '40rem', right: '2.5%', size: 26, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '1.3s' },
  { id: 'sp-extra-5', top: '43.5rem', left: '5.5%', size: 22, color: '#A78BFA', anim: 'anim-star-float-1', delay: '0.7s' },
  { id: 'sp-extra-6', top: '44.5rem', right: '6%', size: 20, color: '#F472B6', anim: 'anim-star-float-2', delay: '2.3s' },

  // Zona Inferior
  { id: 'sp-13', bottom: '8rem', left: '3.5%', size: 24, color: '#F472B6', anim: 'anim-star-float-1', delay: '1.8s' },
  { id: 'sp-14', bottom: '8.5rem', right: '4%', size: 24, color: '#A78BFA', anim: 'anim-star-float-2', delay: '0.7s' },
  { id: 'sp-15', bottom: '4rem', left: '3%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '2.4s' },
  { id: 'sp-16', bottom: '4.5rem', right: '3.5%', size: 22, color: '#FBBF24', anim: 'anim-star-float-1', delay: '1.1s' },
  { id: 'sp-17', bottom: '1.5rem', left: '8%', size: 24, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '0.5s' },
  { id: 'sp-18', bottom: '1.4rem', left: '30%', size: 20, color: '#FBBF24', anim: 'anim-star-float-3', delay: '2.0s' },
  { id: 'sp-19', bottom: '1.4rem', right: '30%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '1.5s' },
  { id: 'sp-20', bottom: '1.6rem', right: '7%', size: 26, color: '#F472B6', anim: 'anim-star-float-2', delay: '0.9s' },
  { id: 'sp-extra-7', bottom: '6.2rem', left: '17%', size: 18, color: '#C084FC', anim: 'anim-star-float-3', delay: '1.9s' },
  { id: 'sp-extra-8', bottom: '6rem', right: '18%', size: 17, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '0.6s' },
  { id: 'sp-extra-9', top: '16.5rem', left: '12%', size: 18, color: '#FF85A1', anim: 'anim-star-float-1', delay: '1.7s' },
  { id: 'sp-extra-10', top: '17rem', right: '13%', size: 20, color: '#70D6FF', anim: 'anim-star-float-2', delay: '2.4s' },
  { id: 'sp-extra-11', top: '35rem', left: '8%', size: 17, color: '#A78BFA', anim: 'anim-star-float-3', delay: '0.8s' },
  { id: 'sp-extra-12', top: '36rem', right: '9%', size: 19, color: '#FBBF24', anim: 'anim-star-float-1', delay: '1.9s' },
  { id: 'sp-extra-13', bottom: '12rem', left: '6%', size: 19, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '1.2s' },
  { id: 'sp-extra-14', bottom: '12.5rem', right: '6.5%', size: 21, color: '#F472B6', anim: 'anim-star-float-3', delay: '2.7s' },
]

// Preset controlado para cabeceras y banners principales de otras páginas
export const HEADER_SPARKLES_DATA = [
  { id: 'hdr-1', top: '0.8rem', left: '2.5%', size: 22, color: '#F472B6', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'hdr-2', top: '1.2rem', right: '3%', size: 24, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '0.8s' },
  { id: 'hdr-3', top: '3.2rem', left: '6%', size: 18, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '1.5s' },
  { id: 'hdr-4', top: '3.5rem', right: '7%', size: 20, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.2s' },
  { id: 'hdr-5', top: '6.2rem', left: '1.5%', size: 19, color: '#C084FC', anim: 'anim-star-float-2', delay: '0.5s' },
  { id: 'hdr-6', top: '6.8rem', right: '2%', size: 21, color: '#FF85A1', anim: 'anim-star-float-3', delay: '1.7s' },
  { id: 'hdr-7', top: '2rem', left: '15%', size: 16, color: '#FDE047', anim: 'anim-star-float-1', delay: '1.1s' },
  { id: 'hdr-8', top: '2.5rem', right: '16%', size: 17, color: '#70D6FF', anim: 'anim-star-float-2', delay: '2.6s' },
  { id: 'hdr-9', bottom: '0.8rem', left: '4%', size: 18, color: '#A78BFA', anim: 'anim-star-float-2', delay: '0.4s' },
  { id: 'hdr-10', bottom: '1.1rem', right: '5%', size: 19, color: '#F472B6', anim: 'anim-star-float-3', delay: '1.8s' },
  { id: 'hdr-11', bottom: '1.8rem', left: '11%', size: 15, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '1.3s' },
  { id: 'hdr-12', bottom: '1.5rem', right: '12%', size: 16, color: '#FBBF24', anim: 'anim-star-float-2', delay: '2.0s' },
]

// Preset ambiental para páginas (Explorar, Información, Solicitudes, Ajustes, etc.)
// Diseñado como en la referencia del Hero de Inicio:
// 1. Estrellas en la zona superior (arriba del encabezado y en las esquinas altas para no dejar espacios vacíos).
// 2. Estrellas limpiamente esparcidas a lo largo de los bordes laterales exteriores (izquierdo y derecho).
// 3. Cantidad equilibrada y cómoda sin aglomeraciones ni sobrecarga visual.
export const PAGE_SPARKLES_DATA = [
  // Zona Superior: enmarca el título y las esquinas altas (elimina el vacío superior)
  { id: 'pg-1', top: '1.6rem', left: '19%', size: 18, color: '#F472B6', anim: 'anim-star-float-3', delay: '1.4s' },
  { id: 'pg-2', top: '2.0rem', right: '21%', size: 20, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.1s' },
  { id: 'pg-3', top: '3.2rem', left: '3.5%', size: 30, color: '#F472B6', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'pg-4', top: '4.2rem', right: '3.8%', size: 32, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '0.8s' },
  { id: 'pg-5', top: '6.5rem', left: '10%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '0.4s' },
  { id: 'pg-6', top: '7.2rem', right: '11.5%', size: 22, color: '#C084FC', anim: 'anim-star-float-3', delay: '1.7s' },

  // Bordes Laterales: esparcidas suavemente a lo largo de los márgenes izquierdo y derecho
  { id: 'pg-7', top: '13rem', left: '4.8%', size: 24, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.0s' },
  { id: 'pg-8', top: '14.5rem', right: '4.2%', size: 28, color: '#F472B6', anim: 'anim-star-float-3', delay: '0.3s' },

  { id: 'pg-9', top: '21rem', left: '2.2%', size: 22, color: '#A78BFA', anim: 'anim-star-float-1', delay: '2.5s' },
  { id: 'pg-10', top: '22.5rem', right: '2.5%', size: 24, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '1.6s' },

  { id: 'pg-11', top: '29.5rem', left: '4.2%', size: 26, color: '#F472B6', anim: 'anim-star-float-3', delay: '3.1s' },
  { id: 'pg-12', top: '31.5rem', right: '4%', size: 24, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.5s' },

  { id: 'pg-13', top: '39rem', left: '2.4%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '2.2s' },
  { id: 'pg-14', top: '41.5rem', right: '2.8%', size: 26, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '1.3s' },

  { id: 'pg-15', top: '50rem', left: '3.8%', size: 23, color: '#A78BFA', anim: 'anim-star-float-1', delay: '0.7s' },
  { id: 'pg-16', top: '52.5rem', right: '3.5%', size: 21, color: '#70D6FF', anim: 'anim-star-float-2', delay: '2.3s' },

  { id: 'pg-17', top: '62rem', left: '2.6%', size: 24, color: '#FF85A1', anim: 'anim-star-float-3', delay: '1.8s' },
  { id: 'pg-18', top: '64.5rem', right: '3%', size: 22, color: '#FBBF24', anim: 'anim-star-float-1', delay: '1.1s' },

  { id: 'pg-19', top: '75rem', left: '3.6%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '0.9s' },
  { id: 'pg-20', top: '77.5rem', right: '2.6%', size: 25, color: '#C084FC', anim: 'anim-star-float-3', delay: '2.6s' },

  { id: 'pg-21', top: '88rem', left: '2.4%', size: 23, color: '#F472B6', anim: 'anim-star-float-1', delay: '1.5s' },
  { id: 'pg-22', top: '90.5rem', right: '3.2%', size: 21, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '2.0s' },

  { id: 'pg-23', top: '101rem', left: '3.2%', size: 20, color: '#A78BFA', anim: 'anim-star-float-3', delay: '1.2s' },
  { id: 'pg-24', top: '103.5rem', right: '2.5%', size: 24, color: '#FF85A1', anim: 'anim-star-float-1', delay: '2.4s' },
]

// Preset sutil para formularios o paneles más compactos (Login, Registro, Ajustes)
export const SUBTLE_SPARKLES_DATA = [
  { id: 'sub-1', top: '1.2rem', left: '3%', size: 18, color: '#F472B6', anim: 'anim-star-float-1', delay: '0.2s' },
  { id: 'sub-2', top: '1.5rem', right: '3.5%', size: 20, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '1.3s' },
  { id: 'sub-3', top: '4.8rem', left: '2%', size: 16, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '2.1s' },
  { id: 'sub-4', top: '5.2rem', right: '2.5%', size: 17, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.6s' },
  { id: 'sub-5', bottom: '4.8rem', left: '2.5%', size: 17, color: '#C084FC', anim: 'anim-star-float-2', delay: '1.7s' },
  { id: 'sub-6', bottom: '4.5rem', right: '2%', size: 16, color: '#70D6FF', anim: 'anim-star-float-3', delay: '0.4s' },
  { id: 'sub-7', bottom: '1.2rem', left: '4%', size: 18, color: '#F472B6', anim: 'anim-star-float-1', delay: '2.4s' },
  { id: 'sub-8', bottom: '1rem', right: '4.5%', size: 19, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.1s' },
]

const VARIANT_MAP = {
  hero: HERO_SPARKLES_DATA,
  full: HERO_SPARKLES_DATA,
  header: HEADER_SPARKLES_DATA,
  banner: HEADER_SPARKLES_DATA,
  page: PAGE_SPARKLES_DATA,
  ambient: PAGE_SPARKLES_DATA,
  spread: PAGE_SPARKLES_DATA,
  scattered: PAGE_SPARKLES_DATA,
  subtle: SUBTLE_SPARKLES_DATA,
  minimal: SUBTLE_SPARKLES_DATA,
}

// Variantes cuyo contenedor se extiende hacia todo el ancho de la página
const BLEED_VARIANTS = new Set(['page', 'ambient', 'spread', 'scattered'])

/**
 * Componente reutilizable de estrellitas flotantes con movimiento suave.
 * Diseñado específicamente para acompañar el estilo pastel scrapbook de ArtLink
 * de manera controlada y accesible.
 */
export default function FloatingStars({
  variant = 'header',
  stars = null,
  className = '',
  inline = false,
  // Fuerza el modo bleed aunque el preset no lo pida por defecto.
  edge = null,
}) {
  const activeStars = stars || VARIANT_MAP[variant] || HEADER_SPARKLES_DATA
  const usesBleed = edge === null ? BLEED_VARIANTS.has(variant) : edge

  const content = activeStars.map((sp) => (
    <span
      key={sp.id}
      className={`hero-floating-star ${sp.anim || 'anim-star-float-1'}`}
      style={{
        top: sp.top,
        bottom: sp.bottom,
        left: sp.left ?? undefined,
        right: sp.right ?? undefined,
        animationDelay: sp.delay || '0s',
      }}
      aria-hidden="true"
    >
      <SparkleStar size={sp.size} color={sp.color} />
    </span>
  ))

  if (inline) {
    return <>{content}</>
  }

  const edgeClass = usesBleed ? ' floating-stars-container--bleed' : ' floating-stars-container--inset'

  return (
    <div
      className={`floating-stars-container${edgeClass} ${className}`.trim()}
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      {content}
    </div>
  )
}



// Exportar aliases comúnmente utilizados para facilitar imports consistentes
export const DecorativeStars = FloatingStars
export const AnimatedStars = FloatingStars
export const BackgroundDecoration = FloatingStars
export const HeroDecoration = FloatingStars
export const HeroSparkleStar = SparkleStar

// Estrellita reutilizable para distintivos, etiquetas y titulos en linea.
export const DecorativeStar = SparkleStar
