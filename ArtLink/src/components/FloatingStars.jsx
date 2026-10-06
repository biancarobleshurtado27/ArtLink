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
// Confinadas estrictamente a los márgenes exteriores (1.5% a 4.2%):
// - Totalmente alejadas de componentes, tarjetas, buscadores, botones y letras.
// - Variación oscilante en distancia, tamaño y altura para que no formen una línea recta.
// - Decoración de fondo limpia y espaciada.
export const PAGE_SPARKLES_DATA = [
  // Borde izquierdo exterior (oscila entre 1.5% y 4.2%, bien lejos de los componentes)
  { id: 'pg-1', top: '1.2rem', left: '3.5%', size: 24, color: '#F472B6', anim: 'anim-star-float-3', delay: '1.4s' },
  { id: 'pg-3', top: '5.5rem', left: '1.5%', size: 28, color: '#BCA6E8', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'pg-5', top: '12.0rem', left: '4.2%', size: 18, color: '#F472B6', anim: 'anim-star-float-2', delay: '0.4s' },
  { id: 'pg-7', top: '19.5rem', left: '2.0%', size: 26, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.5s' },
  { id: 'pg-9', top: '28.0rem', left: '3.8%', size: 20, color: '#A78BFA', anim: 'anim-star-float-3', delay: '1.2s' },
  { id: 'pg-11', top: '38.5rem', left: '1.6%', size: 30, color: '#F472B6', anim: 'anim-star-float-2', delay: '3.1s' },
  { id: 'pg-13', top: '48.0rem', left: '4.0%', size: 18, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '2.2s' },
  { id: 'pg-15', top: '59.0rem', left: '2.2%', size: 24, color: '#A78BFA', anim: 'anim-star-float-3', delay: '0.7s' },
  { id: 'pg-17', top: '71.5rem', left: '3.6%', size: 20, color: '#FF85A1', anim: 'anim-star-float-2', delay: '1.8s' },
  { id: 'pg-19', top: '83.0rem', left: '1.8%', size: 26, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '0.9s' },
  { id: 'pg-21', top: '96.0rem', left: '4.2%', size: 19, color: '#F472B6', anim: 'anim-star-float-3', delay: '1.5s' },
  { id: 'pg-23', top: '108.5rem', left: '2.4%', size: 24, color: '#A78BFA', anim: 'anim-star-float-2', delay: '1.2s' },

  // Borde derecho exterior (oscila entre 1.5% y 4.2%, bien lejos de los componentes)
  { id: 'pg-2', top: '2.0rem', right: '3.8%', size: 26, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.1s' },
  { id: 'pg-4', top: '7.2rem', right: '1.6%', size: 30, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '0.8s' },
  { id: 'pg-6', top: '14.8rem', right: '4.0%', size: 20, color: '#C084FC', anim: 'anim-star-float-3', delay: '1.7s' },
  { id: 'pg-8', top: '23.0rem', right: '2.2%', size: 28, color: '#F472B6', anim: 'anim-star-float-1', delay: '0.3s' },
  { id: 'pg-10', top: '33.0rem', right: '4.2%', size: 18, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '1.6s' },
  { id: 'pg-12', top: '43.5rem', right: '1.8%', size: 24, color: '#FBBF24', anim: 'anim-star-float-3', delay: '0.5s' },
  { id: 'pg-14', top: '53.0rem', right: '3.6%', size: 26, color: '#BCA6E8', anim: 'anim-star-float-1', delay: '1.3s' },
  { id: 'pg-16', top: '65.0rem', right: '2.0%', size: 20, color: '#70D6FF', anim: 'anim-star-float-2', delay: '2.3s' },
  { id: 'pg-18', top: '77.0rem', right: '4.0%', size: 22, color: '#FBBF24', anim: 'anim-star-float-3', delay: '1.1s' },
  { id: 'pg-20', top: '90.0rem', right: '1.5%', size: 28, color: '#C084FC', anim: 'anim-star-float-1', delay: '2.6s' },
  { id: 'pg-22', top: '102.5rem', right: '3.8%', size: 20, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '2.0s' },
  { id: 'pg-24', top: '115.0rem', right: '2.2%', size: 24, color: '#FF85A1', anim: 'anim-star-float-3', delay: '2.4s' },
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

// Preset exclusivo para /solicitudes (PrivateRequestsPage):
// Con cantidad moderada, alternancia orgánica y ubicadas en los márgenes exteriores,
// sin aproximarse al filtro lateral ni a las tarjetas de propuestas ni botones.
export const REQUESTS_SPARKLES_DATA = [
  // Borde izquierdo exterior
  { id: 'req-sp-1', top: '0.8rem', left: '2.2%', size: 22, color: '#F472B6', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'req-sp-2', top: '8.5rem', left: '1.4%', size: 26, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '0.9s' },
  { id: 'req-sp-3', top: '18.0rem', left: '3.0%', size: 18, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '1.7s' },
  { id: 'req-sp-4', top: '30.5rem', left: '1.5%', size: 24, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.5s' },
  { id: 'req-sp-5', top: '44.0rem', left: '2.6%', size: 20, color: '#A78BFA', anim: 'anim-star-float-2', delay: '0.6s' },
  { id: 'req-sp-6', top: '58.0rem', left: '1.3%', size: 25, color: '#FF85A1', anim: 'anim-star-float-3', delay: '2.1s' },
  { id: 'req-sp-7', top: '74.0rem', left: '2.4%', size: 19, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '1.3s' },

  // Borde derecho exterior
  { id: 'req-sp-8', top: '1.5rem', right: '2.6%', size: 24, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.4s' },
  { id: 'req-sp-9', top: '9.8rem', right: '1.5%', size: 28, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '0.3s' },
  { id: 'req-sp-10', top: '20.5rem', right: '3.1%', size: 18, color: '#C084FC', anim: 'anim-star-float-1', delay: '2.0s' },
  { id: 'req-sp-11', top: '33.0rem', right: '1.6%', size: 26, color: '#F472B6', anim: 'anim-star-float-2', delay: '0.8s' },
  { id: 'req-sp-12', top: '47.0rem', right: '2.8%', size: 20, color: '#70D6FF', anim: 'anim-star-float-3', delay: '2.7s' },
  { id: 'req-sp-13', top: '62.0rem', right: '1.5%', size: 24, color: '#BCA6E8', anim: 'anim-star-float-1', delay: '1.1s' },
  { id: 'req-sp-14', top: '78.0rem', right: '2.9%', size: 22, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.9s' },
]

// Preset adaptado para el Catálogo y Explorador (/explorar)
export const EXPLORE_SPARKLES_DATA = [
  { id: 'exp-1', top: '1.2rem', left: '3.2%', size: 24, color: '#F472B6', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'exp-2', top: '2.0rem', right: '3.6%', size: 26, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.2s' },
  { id: 'exp-3', top: '7.5rem', left: '1.8%', size: 28, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '0.5s' },
  { id: 'exp-4', top: '9.0rem', right: '1.6%', size: 30, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '2.1s' },
  { id: 'exp-5', top: '15.5rem', left: '3.8%', size: 20, color: '#A78BFA', anim: 'anim-star-float-2', delay: '1.7s' },
  { id: 'exp-6', top: '17.0rem', right: '3.2%', size: 22, color: '#FF85A1', anim: 'anim-star-float-3', delay: '0.8s' },
  { id: 'exp-7', top: '27.0rem', left: '1.6%', size: 26, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.5s' },
  { id: 'exp-8', top: '29.5rem', right: '2.4%', size: 24, color: '#C084FC', anim: 'anim-star-float-2', delay: '1.4s' },
  { id: 'exp-9', top: '40.0rem', left: '3.5%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '0.9s' },
  { id: 'exp-10', top: '42.5rem', right: '1.8%', size: 28, color: '#F472B6', anim: 'anim-star-float-1', delay: '2.8s' },
  { id: 'exp-11', top: '54.0rem', left: '2.0%', size: 24, color: '#A78BFA', anim: 'anim-star-float-2', delay: '1.1s' },
  { id: 'exp-12', top: '56.5rem', right: '3.5%', size: 20, color: '#70D6FF', anim: 'anim-star-float-3', delay: '0.3s' },
  { id: 'exp-13', top: '69.0rem', left: '3.6%', size: 20, color: '#FF85A1', anim: 'anim-star-float-1', delay: '1.9s' },
  { id: 'exp-14', top: '72.0rem', right: '2.0%', size: 26, color: '#FBBF24', anim: 'anim-star-float-2', delay: '2.2s' },
  { id: 'exp-15', top: '85.0rem', left: '1.8%', size: 26, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '0.6s' },
  { id: 'exp-16', top: '88.0rem', right: '3.0%', size: 22, color: '#BCA6E8', anim: 'anim-star-float-1', delay: '1.5s' },
]

// Preset adaptado para Autenticación (Login y Registro)
// Enmarca la tarjeta central en el viewport sin extenderse a zonas vacías
export const AUTH_SPARKLES_DATA = [
  { id: 'auth-1', top: '1.5rem', left: '4.5%', size: 24, color: '#F472B6', anim: 'anim-star-float-1', delay: '0.2s' },
  { id: 'auth-2', top: '2.2rem', right: '5.0%', size: 26, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '1.1s' },
  { id: 'auth-3', top: '7.0rem', left: '2.5%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '2.0s' },
  { id: 'auth-4', top: '8.2rem', right: '3.2%', size: 28, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.7s' },
  { id: 'auth-5', top: '16.5rem', left: '4.8%', size: 22, color: '#A78BFA', anim: 'anim-star-float-2', delay: '1.6s' },
  { id: 'auth-6', top: '18.0rem', right: '4.2%', size: 20, color: '#FF85A1', anim: 'anim-star-float-3', delay: '2.5s' },
  { id: 'auth-7', top: '26.0rem', left: '2.8%', size: 26, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.4s' },
  { id: 'auth-8', top: '28.5rem', right: '3.5%', size: 24, color: '#70D6FF', anim: 'anim-star-float-2', delay: '1.8s' },
  { id: 'auth-9', top: '37.0rem', left: '4.2%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '1.3s' },
  { id: 'auth-10', top: '39.0rem', right: '4.8%', size: 22, color: '#C084FC', anim: 'anim-star-float-1', delay: '2.2s' },
]

// Preset adaptado para el formulario de Nueva Solicitud (/solicitar-comision/:id)
export const NEW_REQUEST_SPARKLES_DATA = [
  { id: 'nreq-1', top: '1.0rem', left: '3.0%', size: 24, color: '#F472B6', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'nreq-2', top: '2.5rem', right: '3.5%', size: 26, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.0s' },
  { id: 'nreq-3', top: '9.0rem', left: '1.8%', size: 22, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '1.8s' },
  { id: 'nreq-4', top: '11.5rem', right: '2.0%', size: 28, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '0.5s' },
  { id: 'nreq-5', top: '20.0rem', left: '3.6%', size: 18, color: '#A78BFA', anim: 'anim-star-float-2', delay: '2.4s' },
  { id: 'nreq-6', top: '23.0rem', right: '3.2%', size: 24, color: '#FF85A1', anim: 'anim-star-float-3', delay: '1.2s' },
  { id: 'nreq-7', top: '32.5rem', left: '2.2%', size: 26, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.8s' },
  { id: 'nreq-8', top: '35.0rem', right: '2.5%', size: 20, color: '#70D6FF', anim: 'anim-star-float-2', delay: '2.7s' },
  { id: 'nreq-9', top: '44.0rem', left: '3.5%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '1.5s' },
  { id: 'nreq-10', top: '47.0rem', right: '3.8%', size: 26, color: '#C084FC', anim: 'anim-star-float-1', delay: '0.3s' },
  { id: 'nreq-11', top: '56.0rem', left: '2.0%', size: 22, color: '#F472B6', anim: 'anim-star-float-2', delay: '2.1s' },
  { id: 'nreq-12', top: '58.5rem', right: '2.2%', size: 24, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '1.4s' },
]

// Preset adaptado para el Perfil Público de Artista (/artista/:id)
export const ARTIST_PROFILE_SPARKLES_DATA = [
  { id: 'aprof-1', top: '1.5rem', left: '2.5%', size: 26, color: '#F472B6', anim: 'anim-star-float-1', delay: '0.4s' },
  { id: 'aprof-2', top: '2.0rem', right: '2.8%', size: 28, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.3s' },
  { id: 'aprof-3', top: '8.5rem', left: '1.5%', size: 22, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '2.1s' },
  { id: 'aprof-4', top: '10.0rem', right: '1.8%', size: 30, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '0.6s' },
  { id: 'aprof-5', top: '18.0rem', left: '3.5%', size: 20, color: '#A78BFA', anim: 'anim-star-float-2', delay: '1.8s' },
  { id: 'aprof-6', top: '20.5rem', right: '3.2%', size: 24, color: '#FF85A1', anim: 'anim-star-float-3', delay: '0.9s' },
  { id: 'aprof-7', top: '30.0rem', left: '2.0%', size: 26, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.6s' },
  { id: 'aprof-8', top: '33.0rem', right: '2.2%', size: 22, color: '#C084FC', anim: 'anim-star-float-2', delay: '1.5s' },
  { id: 'aprof-9', top: '44.0rem', left: '3.8%', size: 24, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '0.7s' },
  { id: 'aprof-10', top: '47.5rem', right: '1.6%', size: 28, color: '#F472B6', anim: 'anim-star-float-1', delay: '2.3s' },
  { id: 'aprof-11', top: '59.0rem', left: '1.8%', size: 20, color: '#70D6FF', anim: 'anim-star-float-2', delay: '1.2s' },
  { id: 'aprof-12', top: '62.0rem', right: '3.5%', size: 26, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '2.8s' },
  { id: 'aprof-13', top: '74.0rem', left: '3.2%', size: 22, color: '#FF85A1', anim: 'anim-star-float-1', delay: '1.7s' },
  { id: 'aprof-14', top: '77.0rem', right: '2.0%', size: 24, color: '#FBBF24', anim: 'anim-star-float-2', delay: '0.5s' },
]

// Preset adaptado para el Panel de Artista (/panel-artista)
export const ARTIST_PANEL_SPARKLES_DATA = [
  { id: 'apan-1', top: '1.0rem', left: '3.0%', size: 24, color: '#F472B6', anim: 'anim-star-float-1', delay: '0.2s' },
  { id: 'apan-2', top: '2.2rem', right: '3.2%', size: 26, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '1.1s' },
  { id: 'apan-3', top: '8.0rem', left: '1.6%', size: 28, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '2.0s' },
  { id: 'apan-4', top: '10.5rem', right: '1.8%', size: 22, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.7s' },
  { id: 'apan-5', top: '19.0rem', left: '3.5%', size: 20, color: '#A78BFA', anim: 'anim-star-float-2', delay: '1.6s' },
  { id: 'apan-6', top: '21.5rem', right: '3.0%', size: 24, color: '#FF85A1', anim: 'anim-star-float-3', delay: '2.5s' },
  { id: 'apan-7', top: '31.0rem', left: '2.0%', size: 26, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.8s' },
  { id: 'apan-8', top: '34.0rem', right: '2.4%', size: 20, color: '#70D6FF', anim: 'anim-star-float-2', delay: '2.2s' },
  { id: 'apan-9', top: '44.0rem', left: '3.8%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '1.3s' },
  { id: 'apan-10', top: '47.0rem', right: '1.6%', size: 26, color: '#C084FC', anim: 'anim-star-float-1', delay: '0.4s' },
  { id: 'apan-11', top: '57.0rem', left: '1.8%', size: 24, color: '#F472B6', anim: 'anim-star-float-2', delay: '2.7s' },
  { id: 'apan-12', top: '60.0rem', right: '3.2%', size: 20, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '1.9s' },
]

// Preset adaptado para el Perfil Propio (/perfil)
export const PROFILE_SPARKLES_DATA = [
  { id: 'prof-1', top: '1.2rem', left: '3.5%', size: 24, color: '#F472B6', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'prof-2', top: '2.0rem', right: '3.8%', size: 26, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.2s' },
  { id: 'prof-3', top: '8.0rem', left: '1.8%', size: 22, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '0.8s' },
  { id: 'prof-4', top: '10.5rem', right: '2.0%', size: 28, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '2.3s' },
  { id: 'prof-5', top: '19.0rem', left: '3.8%', size: 18, color: '#A78BFA', anim: 'anim-star-float-2', delay: '1.6s' },
  { id: 'prof-6', top: '22.0rem', right: '3.4%', size: 22, color: '#FF85A1', anim: 'anim-star-float-3', delay: '0.4s' },
  { id: 'prof-7', top: '31.0rem', left: '2.0%', size: 26, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.7s' },
  { id: 'prof-8', top: '34.0rem', right: '2.5%', size: 20, color: '#70D6FF', anim: 'anim-star-float-2', delay: '1.4s' },
  { id: 'prof-9', top: '44.0rem', left: '3.6%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '1.0s' },
  { id: 'prof-10', top: '47.0rem', right: '3.0%', size: 24, color: '#C084FC', anim: 'anim-star-float-1', delay: '2.1s' },
]

// Preset adaptado para la pantalla de Ajustes (/ajustes)
export const SETTINGS_SPARKLES_DATA = [
  { id: 'set-1', top: '1.2rem', left: '3.0%', size: 22, color: '#F472B6', anim: 'anim-star-float-1', delay: '0.3s' },
  { id: 'set-2', top: '2.0rem', right: '3.5%', size: 24, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '1.2s' },
  { id: 'set-3', top: '7.5rem', left: '1.5%', size: 26, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '2.1s' },
  { id: 'set-4', top: '9.8rem', right: '2.0%', size: 20, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.6s' },
  { id: 'set-5', top: '18.0rem', left: '3.5%', size: 18, color: '#A78BFA', anim: 'anim-star-float-2', delay: '1.7s' },
  { id: 'set-6', top: '21.0rem', right: '3.2%', size: 24, color: '#FF85A1', anim: 'anim-star-float-3', delay: '0.9s' },
  { id: 'set-7', top: '29.5rem', left: '2.2%', size: 24, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.5s' },
  { id: 'set-8', top: '33.0rem', right: '2.6%', size: 20, color: '#70D6FF', anim: 'anim-star-float-2', delay: '1.4s' },
  { id: 'set-9', top: '42.0rem', left: '3.8%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '0.5s' },
  { id: 'set-10', top: '45.5rem', right: '3.0%', size: 26, color: '#C084FC', anim: 'anim-star-float-1', delay: '2.0s' },
]

// Preset adaptado para la vista de Mensajería (/mensajes)
export const MESSAGES_SPARKLES_DATA = [
  { id: 'msg-1', top: '0.8rem', left: '2.5%', size: 20, color: '#F472B6', anim: 'anim-star-float-1', delay: '0.2s' },
  { id: 'msg-2', top: '1.2rem', right: '2.8%', size: 22, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '1.4s' },
  { id: 'msg-3', top: '6.5rem', left: '1.5%', size: 18, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '2.0s' },
  { id: 'msg-4', top: '7.8rem', right: '1.8%', size: 24, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.8s' },
  { id: 'msg-5', bottom: '8.0rem', left: '2.8%', size: 20, color: '#A78BFA', anim: 'anim-star-float-2', delay: '1.7s' },
  { id: 'msg-6', bottom: '7.2rem', right: '2.2%', size: 18, color: '#FF85A1', anim: 'anim-star-float-3', delay: '2.3s' },
  { id: 'msg-7', bottom: '1.8rem', left: '2.0%', size: 22, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.5s' },
  { id: 'msg-8', bottom: '1.5rem', right: '2.5%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '1.1s' },
]

// Preset adaptado para Cómo Funciona (/como-funciona)
export const COMO_FUNCIONA_SPARKLES_DATA = [
  { id: 'cf-1', top: '1.5rem', left: '3.0%', size: 26, color: '#F472B6', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'cf-2', top: '2.5rem', right: '3.5%', size: 28, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '0.8s' },
  { id: 'cf-3', top: '8.5rem', left: '1.6%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '1.7s' },
  { id: 'cf-4', top: '10.5rem', right: '2.0%', size: 30, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.4s' },
  { id: 'cf-5', top: '20.0rem', left: '3.8%', size: 20, color: '#A78BFA', anim: 'anim-star-float-2', delay: '0.9s' },
  { id: 'cf-6', top: '22.5rem', right: '3.2%', size: 24, color: '#FF85A1', anim: 'anim-star-float-3', delay: '1.8s' },
  { id: 'cf-7', top: '32.0rem', left: '2.0%', size: 28, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.9s' },
  { id: 'cf-8', top: '35.0rem', right: '2.4%', size: 22, color: '#70D6FF', anim: 'anim-star-float-2', delay: '1.3s' },
  { id: 'cf-9', top: '45.0rem', left: '3.6%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '0.5s' },
  { id: 'cf-10', top: '48.0rem', right: '1.8%', size: 26, color: '#C084FC', anim: 'anim-star-float-1', delay: '2.2s' },
  { id: 'cf-11', top: '58.0rem', left: '1.8%', size: 24, color: '#F472B6', anim: 'anim-star-float-2', delay: '1.5s' },
  { id: 'cf-12', top: '61.0rem', right: '3.5%', size: 20, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '0.3s' },
  { id: 'cf-13', top: '71.0rem', left: '3.2%', size: 20, color: '#FF85A1', anim: 'anim-star-float-1', delay: '2.0s' },
  { id: 'cf-14', top: '74.0rem', right: '2.2%', size: 26, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.1s' },
]

// Preset adaptado para Para Artistas (/para-artistas)
export const PARA_ARTISTAS_SPARKLES_DATA = [
  { id: 'pa-1', top: '1.2rem', left: '3.2%', size: 28, color: '#F472B6', anim: 'anim-star-float-1', delay: '0.2s' },
  { id: 'pa-2', top: '2.0rem', right: '3.6%', size: 30, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.0s' },
  { id: 'pa-3', top: '8.0rem', left: '1.8%', size: 22, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '1.8s' },
  { id: 'pa-4', top: '10.5rem', right: '2.0%', size: 26, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '2.6s' },
  { id: 'pa-5', top: '19.5rem', left: '3.6%', size: 20, color: '#A78BFA', anim: 'anim-star-float-2', delay: '0.7s' },
  { id: 'pa-6', top: '22.0rem', right: '3.0%', size: 24, color: '#FF85A1', anim: 'anim-star-float-3', delay: '2.1s' },
  { id: 'pa-7', top: '31.5rem', left: '2.0%', size: 28, color: '#FBBF24', anim: 'anim-star-float-1', delay: '1.3s' },
  { id: 'pa-8', top: '34.5rem', right: '2.5%', size: 22, color: '#70D6FF', anim: 'anim-star-float-2', delay: '2.8s' },
  { id: 'pa-9', top: '44.5rem', left: '3.8%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '0.4s' },
  { id: 'pa-10', top: '47.5rem', right: '1.8%', size: 26, color: '#C084FC', anim: 'anim-star-float-1', delay: '1.9s' },
  { id: 'pa-11', top: '57.0rem', left: '1.8%', size: 24, color: '#F472B6', anim: 'anim-star-float-2', delay: '1.2s' },
  { id: 'pa-12', top: '60.0rem', right: '3.4%', size: 20, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '2.4s' },
  { id: 'pa-13', top: '70.0rem', left: '3.0%', size: 22, color: '#FF85A1', anim: 'anim-star-float-1', delay: '0.8s' },
  { id: 'pa-14', top: '73.0rem', right: '2.2%', size: 26, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.6s' },
]

// Preset adaptado para el Panel Administrativo (/admin)
export const ADMIN_SPARKLES_DATA = [
  { id: 'adm-1', top: '0.8rem', left: '2.0%', size: 20, color: '#BCA6E8', anim: 'anim-star-float-1', delay: '0.3s' },
  { id: 'adm-2', top: '1.5rem', right: '2.4%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '1.1s' },
  { id: 'adm-3', top: '7.5rem', left: '1.4%', size: 24, color: '#F472B6', anim: 'anim-star-float-3', delay: '1.9s' },
  { id: 'adm-4', top: '9.2rem', right: '1.6%', size: 20, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.7s' },
  { id: 'adm-5', top: '18.0rem', left: '2.8%', size: 18, color: '#A78BFA', anim: 'anim-star-float-2', delay: '2.4s' },
  { id: 'adm-6', top: '20.5rem', right: '2.2%', size: 22, color: '#FF85A1', anim: 'anim-star-float-3', delay: '1.3s' },
  { id: 'adm-7', top: '30.0rem', left: '1.6%', size: 24, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.5s' },
  { id: 'adm-8', top: '33.0rem', right: '2.6%', size: 18, color: '#70D6FF', anim: 'anim-star-float-2', delay: '2.6s' },
  { id: 'adm-9', top: '43.0rem', left: '2.6%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '1.5s' },
  { id: 'adm-10', top: '46.0rem', right: '1.5%', size: 22, color: '#C084FC', anim: 'anim-star-float-1', delay: '0.9s' },
  { id: 'adm-11', top: '56.0rem', left: '1.8%', size: 22, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '2.1s' },
  { id: 'adm-12', top: '59.0rem', right: '2.4%', size: 20, color: '#F472B6', anim: 'anim-star-float-3', delay: '1.7s' },
]

// Preset adaptado para páginas de estado (404 Not Found y 403 Access Denied)
export const STATUS_SPARKLES_DATA = [
  { id: 'stat-1', top: '2.0rem', left: '5.0%', size: 24, color: '#F472B6', anim: 'anim-star-float-1', delay: '0.2s' },
  { id: 'stat-2', top: '3.0rem', right: '5.5%', size: 28, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1.2s' },
  { id: 'stat-3', top: '9.5rem', left: '3.2%', size: 22, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '2.0s' },
  { id: 'stat-4', top: '11.0rem', right: '3.6%', size: 26, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '0.8s' },
  { id: 'stat-5', top: '18.5rem', left: '4.8%', size: 20, color: '#A78BFA', anim: 'anim-star-float-2', delay: '1.7s' },
  { id: 'stat-6', top: '20.0rem', right: '4.2%', size: 22, color: '#FF85A1', anim: 'anim-star-float-3', delay: '2.4s' },
  { id: 'stat-7', top: '28.0rem', left: '3.8%', size: 26, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.6s' },
  { id: 'stat-8', top: '30.0rem', right: '4.5%', size: 24, color: '#70D6FF', anim: 'anim-star-float-2', delay: '1.4s' },
]

// Preset adaptado para Páginas Legales y Términos (/terminos, /privacidad)
export const LEGAL_SPARKLES_DATA = [
  { id: 'leg-1', top: '1.2rem', left: '2.8%', size: 22, color: '#F472B6', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'leg-2', top: '2.0rem', right: '3.0%', size: 24, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '0.9s' },
  { id: 'leg-3', top: '9.0rem', left: '1.8%', size: 26, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '1.8s' },
  { id: 'leg-4', top: '11.5rem', right: '2.2%', size: 20, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.5s' },
  { id: 'leg-5', top: '21.0rem', left: '3.5%', size: 20, color: '#A78BFA', anim: 'anim-star-float-2', delay: '0.7s' },
  { id: 'leg-6', top: '24.0rem', right: '2.8%', size: 22, color: '#FF85A1', anim: 'anim-star-float-3', delay: '1.6s' },
  { id: 'leg-7', top: '35.0rem', left: '2.0%', size: 26, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.8s' },
  { id: 'leg-8', top: '38.0rem', right: '2.4%', size: 20, color: '#70D6FF', anim: 'anim-star-float-2', delay: '1.1s' },
  { id: 'leg-9', top: '49.0rem', left: '3.6%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '0.4s' },
  { id: 'leg-10', top: '52.0rem', right: '1.8%', size: 24, color: '#C084FC', anim: 'anim-star-float-1', delay: '2.2s' },
  { id: 'leg-11', top: '63.0rem', left: '2.2%', size: 24, color: '#F472B6', anim: 'anim-star-float-2', delay: '1.3s' },
  { id: 'leg-12', top: '66.0rem', right: '3.2%', size: 20, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '2.6s' },
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
  requests: REQUESTS_SPARKLES_DATA,
  solicitudes: REQUESTS_SPARKLES_DATA,
  explore: EXPLORE_SPARKLES_DATA,
  explorar: EXPLORE_SPARKLES_DATA,
  auth: AUTH_SPARKLES_DATA,
  login: AUTH_SPARKLES_DATA,
  register: AUTH_SPARKLES_DATA,
  'new-request': NEW_REQUEST_SPARKLES_DATA,
  newRequest: NEW_REQUEST_SPARKLES_DATA,
  'artist-profile': ARTIST_PROFILE_SPARKLES_DATA,
  artistProfile: ARTIST_PROFILE_SPARKLES_DATA,
  'artist-panel': ARTIST_PANEL_SPARKLES_DATA,
  artistPanel: ARTIST_PANEL_SPARKLES_DATA,
  profile: PROFILE_SPARKLES_DATA,
  perfil: PROFILE_SPARKLES_DATA,
  settings: SETTINGS_SPARKLES_DATA,
  ajustes: SETTINGS_SPARKLES_DATA,
  messages: MESSAGES_SPARKLES_DATA,
  mensajes: MESSAGES_SPARKLES_DATA,
  'como-funciona': COMO_FUNCIONA_SPARKLES_DATA,
  howItWorks: COMO_FUNCIONA_SPARKLES_DATA,
  'para-artistas': PARA_ARTISTAS_SPARKLES_DATA,
  forArtists: PARA_ARTISTAS_SPARKLES_DATA,
  admin: ADMIN_SPARKLES_DATA,
  status: STATUS_SPARKLES_DATA,
  'not-found': STATUS_SPARKLES_DATA,
  notFound: STATUS_SPARKLES_DATA,
  'access-denied': STATUS_SPARKLES_DATA,
  accessDenied: STATUS_SPARKLES_DATA,
  legal: LEGAL_SPARKLES_DATA,
}

// Variantes cuyo contenedor se extiende hacia todo el ancho de la página
const BLEED_VARIANTS = new Set([
  'page', 'ambient', 'spread', 'scattered', 'requests', 'solicitudes',
  'explore', 'explorar', 'auth', 'login', 'register', 'new-request', 'newRequest',
  'artist-profile', 'artistProfile', 'artist-panel', 'artistPanel',
  'profile', 'perfil', 'settings', 'ajustes', 'messages', 'mensajes',
  'como-funciona', 'howItWorks', 'para-artistas', 'forArtists',
  'admin', 'status', 'not-found', 'notFound', 'access-denied', 'accessDenied', 'legal'
])

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
