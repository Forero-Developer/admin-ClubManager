# admin-ClubManager

Panel interno de ClubSport Manager para el equipo (SUPERADMIN): clubes, planes y suscripciones, organizadores de torneos, jugadores y tablero general.
Consume la API de `sports-clubs-backend`.

## Stack
React 19 · Vite · TypeScript · Tailwind · TanStack Query · Zustand (`src/store`).

## Correr en local
```bash
npm install
VITE_API_URL=http://localhost:3000/api/v1 npm run dev
```
`npm run build` compila tipos (`tsc -b`) y genera `dist/`.

## Estructura
- `src/pages/<módulo>/`: pantallas (`clubs`, `plans`, `subscriptions`, `organizers`, `players`, `dashboard`, `auth`).
- `src/services/<módulo>/`: llamadas a la API.
- `src/routes/`: rutas por módulo.
- `src/components/`, `src/hooks/`, `src/lib/`: piezas compartidas.
