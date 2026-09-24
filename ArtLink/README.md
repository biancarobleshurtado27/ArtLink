# ArtLink

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Instalación y desarrollo

Requisitos: Node.js 20 o superior y npm 10 o superior.

Desde esta carpeta (`ArtLink/`), instala las dependencias:

```bash
npm install
```

En una terminal inicia JSON Server:

```bash
npm run server
```

La API simulada quedará disponible en `http://localhost:3000` y leerá `db.json`.

El cliente Axios usa esa URL por defecto. Para cambiarla, crea un archivo `.env` en `ArtLink/`:

```bash
VITE_API_URL=http://localhost:3000

# Asistente ArtLink (opcional; usar un proxy/backend propio para no exponer secretos en producción)
VITE_AI_API_URL=
VITE_AI_API_KEY=
```

También puedes iniciar JSON Server directamente con:

```bash
npx json-server --watch db.json --port 3000
```

## Asistente ArtLink

El asistente usa `VITE_AI_API_URL` y `VITE_AI_API_KEY` únicamente cuando ambas variables están configuradas. En desarrollo académico, si faltan, funciona en **modo demostración** con reglas locales deterministas para interpretar disciplina, estilo, presupuesto y disponibilidad. Las recomendaciones son orientativas: el asistente no compra, reserva ni ejecuta operaciones externas.

Puedes copiar `.env.example` como `.env` y completar las variables solo mediante un endpoint/proxy autorizado. No incluyas claves reales en el repositorio.

En otra terminal inicia Vite:

```bash
npm run dev
```

Abre la URL que muestre Vite, normalmente `http://localhost:5173`.

## Validación

```bash
npm run lint
npm run test:run
npm run build
```

## Estructura principal

- `src/components`: componentes reutilizables.
- `src/pages`: vistas asociadas a rutas.
- `src/layouts`: shells compartidos de la aplicación.
- `src/services`: clientes HTTP y servicios externos.
- `src/hooks`: hooks reutilizables.
- `src/context`: estado global, incluida la sesión.
- `src/routes`: definición del router y guards.
- `src/utils`: constantes y utilidades.
- `src/assets`: recursos estáticos.
- `src/styles`: tokens y estilos compartidos.
- `tests`: pruebas con Vitest y React Testing Library.
- `db.json`: fuente de datos para JSON Server.

## Guía visual

- **Dirección:** galería pastel viva con composición editorial y detalles scrapbook. Las tarjetas usan borde oscuro, sombra firme y pequeñas inclinaciones para sentirse como recortes de papel.
- **Color:** violeta para acciones y foco, rosa para acentos, menta para estados positivos, amarillo para llamadas secundarias y tinta para texto/bordes. Los fondos crema y lila mantienen contraste y respiración.
- **Tipografía:** `Epilogue` para títulos, `Plus Jakarta Sans` para interfaz y `Space Grotesk` para badges. Las variables globales están en `src/styles/visual.css`.
- **Responsive:** desde 48rem se muestra la navegación móvil con menú compacto y barra inferior; en escritorio se muestra la navegación completa. Las tarjetas pasan de tres columnas a dos y luego a una.
- **Accesibilidad:** navegación semántica, nombres accesibles para iconos, foco visible, labels asociados y estados con `role="status"` o `role="alert"`.
- **Preferencias:** el tema claro/oscuro y el tamaño de texto normal/grande/extra grande se guardan en `localStorage` con las claves `artlink_theme` y `artlink_text_size`.
