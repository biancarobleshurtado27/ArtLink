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
```

También puedes iniciar JSON Server directamente con:

```bash
npx json-server --watch db.json --port 3000
```

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
