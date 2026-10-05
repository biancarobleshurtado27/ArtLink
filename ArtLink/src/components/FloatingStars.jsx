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

// Preset ambiental para páginas largas (Explorar, Información, Solicitudes, Ajustes...)
// Las posiciones verticales usan porcentajes para repartirse por TODA la altura real
// del contenedor, evitando que las estrellas queden agrupadas en la parte superior.
export const PAGE_SPARKLES_DATA = [
  { id: 'pg-1', top: '1.5%', left: '1.4%', size: 21, color: '#F472B6', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'pg-2', top: '3.2%', right: '2.2%', size: 22, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '1.1s' },
  { id: 'pg-3', top: '5%', left: '3.6%', size: 17, color: '#FBBF24', anim: 'anim-star-float-3', delay: '0.4s' },
  { id: 'pg-4', top: '6.6%', right: '1.2%', size: 19, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '1.8s' },

  { id: 'pg-5', top: '8.4%', left: '1.8%', size: 18, color: '#C084FC', anim: 'anim-star-float-2', delay: '2.2s' },
  { id: 'pg-6', top: '10.2%', right: '3.4%', size: 21, color: '#FF85A1', anim: 'anim-star-float-3', delay: '0.7s' },
  { id: 'pg-7', top: '12%', left: '4.8%', size: 16, color: '#70D6FF', anim: 'anim-star-float-1', delay: '1.4s' },
  { id: 'pg-8', top: '13.8%', right: '2.6%', size: 18, color: '#FBBF24', anim: 'anim-star-float-2', delay: '2.5s' },

  { id: 'pg-9', top: '15.6%', left: '1.1%', size: 20, color: '#A78BFA', anim: 'anim-star-float-3', delay: '0.9s' },
  { id: 'pg-10', top: '17.4%', right: '1.6%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '1.6s' },
  { id: 'pg-11', top: '19.2%', left: '3.1%', size: 17, color: '#F472B6', anim: 'anim-star-float-2', delay: '2.8s' },
  { id: 'pg-12', top: '21%', right: '4.2%', size: 19, color: '#C084FC', anim: 'anim-star-float-3', delay: '0.3s' },

  { id: 'pg-13', top: '22.8%', left: '1.6%', size: 18, color: '#FBBF24', anim: 'anim-star-float-1', delay: '1.7s' },
  { id: 'pg-14', top: '24.6%', right: '2.4%', size: 20, color: '#70D6FF', anim: 'anim-star-float-2', delay: '2.3s' },
  { id: 'pg-15', top: '26.4%', left: '4.4%', size: 16, color: '#FF85A1', anim: 'anim-star-float-3', delay: '1.0s' },
  { id: 'pg-16', top: '28.2%', right: '1%', size: 21, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '2.1s' },

  { id: 'pg-17', top: '30%', left: '2.6%', size: 19, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '0.6s' },
  { id: 'pg-18', top: '31.8%', right: '3.2%', size: 20, color: '#F472B6', anim: 'anim-star-float-3', delay: '1.9s' },
  { id: 'pg-19', top: '33.6%', left: '1.3%', size: 17, color: '#A78BFA', anim: 'anim-star-float-1', delay: '2.7s' },
  { id: 'pg-20', top: '35.4%', right: '4.8%', size: 18, color: '#FBBF24', anim: 'anim-star-float-2', delay: '0.8s' },

  { id: 'pg-21', top: '37.2%', left: '3.9%', size: 21, color: '#C084FC', anim: 'anim-star-float-3', delay: '2.4s' },
  { id: 'pg-22', top: '39%', right: '1.4%', size: 16, color: '#70D6FF', anim: 'anim-star-float-1', delay: '1.2s' },
  { id: 'pg-23', top: '40.8%', left: '1.9%', size: 20, color: '#F472B6', anim: 'anim-star-float-2', delay: '0.5s' },
  { id: 'pg-24', top: '42.6%', right: '2.8%', size: 19, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '2.6s' },

  { id: 'pg-25', top: '44.4%', left: '4.6%', size: 18, color: '#FBBF24', anim: 'anim-star-float-1', delay: '1.3s' },
  { id: 'pg-26', top: '46.2%', right: '1%', size: 22, color: '#A78BFA', anim: 'anim-star-float-2', delay: '2.0s' },
  { id: 'pg-27', top: '48%', left: '1.5%', size: 17, color: '#FF85A1', anim: 'anim-star-float-3', delay: '0.9s' },
  { id: 'pg-28', top: '49.8%', right: '3.8%', size: 20, color: '#BCA6E8', anim: 'anim-star-float-1', delay: '1.6s' },

  { id: 'pg-29', top: '51.6%', left: '3.3%', size: 19, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '2.2s' },
  { id: 'pg-30', top: '53.4%', right: '2%', size: 16, color: '#C084FC', anim: 'anim-star-float-3', delay: '0.4s' },
  { id: 'pg-31', top: '55.2%', left: '1%', size: 21, color: '#FBBF24', anim: 'anim-star-float-1', delay: '1.7s' },
  { id: 'pg-32', top: '57%', right: '4.4%', size: 18, color: '#70D6FF', anim: 'anim-star-float-2', delay: '2.5s' },

  { id: 'pg-33', top: '58.8%', left: '2.9%', size: 20, color: '#F472B6', anim: 'anim-star-float-3', delay: '1.1s' },
  { id: 'pg-34', top: '60.6%', right: '1.7%', size: 17, color: '#A78BFA', anim: 'anim-star-float-1', delay: '2.3s' },
  { id: 'pg-35', top: '62.4%', left: '4.2%', size: 19, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '0.7s' },
  { id: 'pg-36', top: '64.2%', right: '3%', size: 21, color: '#FF85A1', anim: 'anim-star-float-3', delay: '1.9s' },

  { id: 'pg-37', top: '66%', left: '1.2%', size: 16, color: '#BCA6E8', anim: 'anim-star-float-1', delay: '2.8s' },
  { id: 'pg-38', top: '67.8%', right: '2.5%', size: 20, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.4s' },
  { id: 'pg-39', top: '69.6%', left: '3.7%', size: 18, color: '#C084FC', anim: 'anim-star-float-3', delay: '0.6s' },
  { id: 'pg-40', top: '71.4%', right: '1.1%', size: 19, color: '#70D6FF', anim: 'anim-star-float-1', delay: '2.1s' },

  { id: 'pg-41', top: '73.2%', left: '2.2%', size: 21, color: '#F472B6', anim: 'anim-star-float-2', delay: '1.5s' },
  { id: 'pg-42', top: '75%', right: '3.6%', size: 17, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '0.8s' },
  { id: 'pg-43', top: '76.8%', left: '4.8%', size: 18, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.4s' },
  { id: 'pg-44', top: '78.6%', right: '2.1%', size: 20, color: '#A78BFA', anim: 'anim-star-float-2', delay: '1.0s' },

  { id: 'pg-45', top: '80.4%', left: '1%', size: 19, color: '#FF85A1', anim: 'anim-star-float-3', delay: '2.6s' },
  { id: 'pg-46', top: '82.2%', right: '4%', size: 16, color: '#BCA6E8', anim: 'anim-star-float-1', delay: '0.5s' },
  { id: 'pg-47', top: '84%', left: '3%', size: 21, color: '#C084FC', anim: 'anim-star-float-2', delay: '1.3s' },
  { id: 'pg-48', top: '85.8%', right: '1.5%', size: 18, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '2.7s' },

  { id: 'pg-49', top: '87.6%', left: '4.4%', size: 17, color: '#70D6FF', anim: 'anim-star-float-1', delay: '1.8s' },
  { id: 'pg-50', top: '89.4%', right: '2.7%', size: 20, color: '#FBBF24', anim: 'anim-star-float-2', delay: '0.9s' },
  { id: 'pg-51', top: '91.2%', left: '1.7%', size: 19, color: '#F472B6', anim: 'anim-star-float-3', delay: '2.0s' },
  { id: 'pg-52', top: '93%', right: '3.4%', size: 16, color: '#A78BFA', anim: 'anim-star-float-1', delay: '1.2s' },

  { id: 'pg-53', top: '94.8%', left: '2.6%', size: 21, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '2.4s' },
  { id: 'pg-54', top: '96.6%', right: '1.9%', size: 18, color: '#FF85A1', anim: 'anim-star-float-3', delay: '0.6s' },
  { id: 'pg-55', top: '98.2%', left: '4%', size: 17, color: '#BCA6E8', anim: 'anim-star-float-1', delay: '1.6s' },
  { id: 'pg-56', top: '99%', right: '2.3%', size: 20, color: '#C084FC', anim: 'anim-star-float-2', delay: '2.9s' },
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

// Variantes cuyo contenedor se extiende hacia el margen exterior de la pagina,
// para que las estrellas queden en los bordes y no junto al texto.
const BLEED_VARIANTS = new Set(['page', 'ambient', 'spread', 'scattered'])

// Rango horizontal original de los presets (porcentaje respecto al ancho del
// contenedor de contenido) y su equivalente como fraccion del margen exterior.
const SOURCE_EDGE_MIN = 1
const SOURCE_EDGE_MAX = 4.8
const GUTTER_EDGE_MIN = 0.06
const GUTTER_EDGE_MAX = 0.72

/**
 * Convierte una posicion horizontal en porcentaje (medida desde el borde del
 * area de contenido) a una fraccion del margen exterior de la pagina.
 * Asi la estrella se aleja de las letras y queda pegada al borde real.
 */
function percentToGutter(percent) {
  const value = Number.parseFloat(percent)
  if (!Number.isFinite(value)) return null
  const ratio = (value - SOURCE_EDGE_MIN) / (SOURCE_EDGE_MAX - SOURCE_EDGE_MIN)
  const clamped = Math.min(1, Math.max(0, ratio))
  const gutterFraction = GUTTER_EDGE_MIN + clamped * (GUTTER_EDGE_MAX - GUTTER_EDGE_MIN)
  return `calc(var(--stars-gutter) * ${gutterFraction.toFixed(3)})`
}

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
  // Fuerza el margen exterior aunque el preset no lo pida por defecto.
  edge = null,
}) {
  const activeStars = stars || VARIANT_MAP[variant] || HEADER_SPARKLES_DATA
  const usesBleed = edge === null ? BLEED_VARIANTS.has(variant) : edge

  const content = activeStars.map((sp) => {
    // En modo borde las estrellas se repositionan al margen exterior.
    const left = usesBleed && sp.left ? percentToGutter(sp.left) : sp.left
    const right = usesBleed && sp.right ? percentToGutter(sp.right) : sp.right

    return (
      <span
        key={sp.id}
        className={`hero-floating-star ${sp.anim || 'anim-star-float-1'}`}
        style={{
          top: sp.top,
          bottom: sp.bottom,
          left: left ?? undefined,
          right: right ?? undefined,
          animationDelay: sp.delay || '0s',
        }}
        aria-hidden="true"
      >
        <SparkleStar size={sp.size} color={sp.color} />
      </span>
    )
  })

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
